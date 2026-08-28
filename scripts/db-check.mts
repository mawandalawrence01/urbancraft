process.loadEnvFile(".env");
const { PrismaPg } = await import("@prisma/adapter-pg");
const { PrismaClient } = await import("../lib/generated/prisma/client.js");
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });
const rows = await prisma.$queryRaw<{ table_name: string }[]>`
  select table_name from information_schema.tables
  where table_schema = 'public' order by table_name`;
console.log(`tables (${rows.length}):`, rows.map(r => r.table_name).join(", "));
await prisma.$disconnect();
