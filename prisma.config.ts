import path from "node:path";
import { defineConfig, env } from "prisma/config";

// Prisma 7 no longer reads .env implicitly from the config file.
for (const file of [".env.local", ".env"]) {
  try {
    process.loadEnvFile(path.join(process.cwd(), file));
  } catch {
    // file absent — fall through to the real environment (CI, Vercel)
  }
}

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  migrations: {
    path: path.join("prisma", "migrations"),
    seed: "tsx prisma/seed.ts",
  },
  // Migrations run over the direct endpoint; the pooled endpoint is PgBouncer
  // in transaction mode and cannot hold the session state DDL requires.
  datasource: {
    url: env("DIRECT_URL"),
  },
});
