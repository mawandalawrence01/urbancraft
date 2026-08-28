import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not set");

/**
 * Neon suspends idle compute and recycles pooled sockets, so a connection that
 * has been sitting in the local pool can be dead by the time we use it. The
 * first query on such a socket fails with a transport error rather than a
 * database error — retrying gets a fresh connection and succeeds.
 */
const TRANSIENT = [
  "ETIMEDOUT", "ECONNRESET", "ECONNREFUSED", "EPIPE", "ENOTFOUND",
  "Connection terminated", "Connection closed", "server closed the connection",
  "Timed out fetching a new connection",
];

function isTransient(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const code = (error as { code?: unknown }).code;
  const message = (error as { message?: unknown }).message;
  const haystack = `${typeof code === "string" ? code : ""} ${typeof message === "string" ? message : ""}`;
  return TRANSIENT.some((needle) => haystack.includes(needle));
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function createClient() {
  const adapter = new PrismaPg({
    connectionString,
    // `next build` forks a worker per CPU and each one opens its own pool, so
    // this ceiling is per-process: keep it low or the build stampedes Neon.
    max: Number(process.env.DB_POOL_MAX ?? 4),
    // A cold start can take several seconds. The pg default (0) would hang the
    // request forever, while too short a value turns every cold start into a 500.
    connectionTimeoutMillis: 15_000,
    // Drop our idle sockets before Neon does, so we hand out fewer dead ones.
    idleTimeoutMillis: 10_000,
    keepAlive: true,
  });

  const base = new PrismaClient({
    adapter,
    // Prisma's own "error" channel fires for every failed attempt, including
    // ones the retry below immediately recovers from. We report exhaustion
    // ourselves instead, so the logs only show failures that actually mattered.
    log: ["warn"],
  });

  return base.$extends({
    query: {
      async $allOperations({ query, args }) {
        let lastError: unknown;
        for (let attempt = 0; attempt < 5; attempt++) {
          try {
            return await query(args);
          } catch (error) {
            if (!isTransient(error)) throw error;
            lastError = error;
            // 150ms → 2.4s, with jitter so parallel build workers do not
            // retry in lockstep and re-create the stampede.
            const backoff = 150 * 2 ** attempt;
            await sleep(backoff + Math.random() * backoff);
          }
        }
        console.error(
          "[db] giving up after 5 attempts:",
          (lastError as { code?: string })?.code ?? lastError,
        );
        throw lastError;
      },
    },
  });
}

// The dev server hot-reloads modules; without caching we leak a pool per reload.
const globalForPrisma = globalThis as unknown as { prisma?: ReturnType<typeof createClient> };

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
