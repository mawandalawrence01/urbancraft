process.loadEnvFile(".env");
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client.js";
// Neon recycles idle sockets, so retry transport errors the way lib/db.ts does.
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL!, max: 3 }),
  log: ["warn"],
}).$extends({
  query: {
    async $allOperations({ query, args }) {
      let last: unknown;
      for (let i = 0; i < 5; i++) {
        try { return await query(args); }
        catch (e) {
          const code = (e as { code?: string })?.code ?? "";
          if (!/ETIMEDOUT|ECONNRESET|EPIPE|Connection/.test(code + String((e as Error)?.message))) throw e;
          last = e;
          await new Promise((r) => setTimeout(r, 200 * 2 ** i));
        }
      }
      throw last;
    },
  },
});

// 1. "Top Class Class" → "Top Class"
const variants = await prisma.productVariant.findMany();
let renamed = 0;
for (const v of variants) {
  const fixed = v.name.replace(/\bClass Class\b/, "Class").replace(/^Standard$/, "Standard Class");
  if (fixed !== v.name) {
    await prisma.productVariant.update({ where: { id: v.id }, data: { name: fixed } });
    renamed++;
  }
}
console.log("variants renamed:", renamed);
console.log("names now:", [...new Set((await prisma.productVariant.findMany()).map(v => v.name))].join(", "));

// 2. Tidy punctuation artefacts carried over from the scraped copy
const products = await prisma.product.findMany({
  select: { id: true, body: true, summary: true, seoDescription: true, seoTitle: true },
});
const tidy = (t: string) =>
  t.replace(/\s+([,.;:])/g, "$1")   // " ," → ","
   .replace(/,\s*,/g, ",")
   .replace(/\s{2,}/g, " ")
   .trim();

let touched = 0;
for (const p of products) {
  const body = p.body as { type: string; text: string }[] | null;
  const nextBody = Array.isArray(body) ? body.map((b) => ({ ...b, text: tidy(b.text) })) : null;
  const nextSummary = p.summary ? tidy(p.summary) : null;

  const nextSeoDescription = p.seoDescription ? tidy(p.seoDescription) : null;
  const nextSeoTitle = p.seoTitle ? tidy(p.seoTitle) : null;
  const bodyChanged = JSON.stringify(nextBody) !== JSON.stringify(body);

  if (
    bodyChanged ||
    nextSummary !== p.summary ||
    nextSeoDescription !== p.seoDescription ||
    nextSeoTitle !== p.seoTitle
  ) {
    await prisma.product.update({
      where: { id: p.id },
      data: {
        ...(bodyChanged ? { body: nextBody as never } : {}),
        summary: nextSummary,
        seoDescription: nextSeoDescription,
        seoTitle: nextSeoTitle,
      },
    });
    touched++;
  }
}
console.log("products tidied:", touched);
await prisma.$disconnect();
