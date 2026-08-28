/** Signs into the admin and walks every section, reporting HTTP + JS errors. */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const OUT = process.env.SHOT_DIR ?? "tmp";
await mkdir(OUT, { recursive: true });

const BASE = "http://localhost:3000";
const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

const problems: string[] = [];
page.on("pageerror", (e) => problems.push(`JS: ${e.message.split("\n")[0]}`));
page.on("response", (r) => {
  if (r.status() >= 400 && !r.url().includes("favicon")) {
    problems.push(`HTTP ${r.status()}: ${r.url().replace(BASE, "")}`);
  }
});

try {
  // gate check first
  await page.goto(`${BASE}/admin/orders`, { waitUntil: "domcontentloaded" });
  console.log("unauthenticated /admin/orders redirects to login:",
    page.url().includes("/admin/login") ? "PASS" : `FAIL (${page.url()})`);

  await page.fill("input[name='email']", "admin@urbancraft.co.ug");
  await page.fill("input[name='password']", "urbancraft2026");
  // Wait for the redirect to actually land — /admin/login also matches /admin
  await Promise.all([
    page.waitForNavigation({ waitUntil: "networkidle", timeout: 30_000 }),
    page.click("button[type='submit']"),
  ]);
  console.log("signed in:", !page.url().includes("login") ? "PASS" : `FAIL (${page.url()})`);

  const sections = [
    "/admin", "/admin/orders", "/admin/products", "/admin/products/new",
    "/admin/categories", "/admin/images", "/admin/projects",
    "/admin/enquiries", "/admin/settings",
  ];
  for (const path of sections) {
    const before = problems.length;
    await page.goto(BASE + path, { waitUntil: "networkidle" });
    const h1 = await page.locator("h1").first().innerText().catch(() => "(no h1)");
    console.log(`${path.padEnd(24)} → ${h1.slice(0, 34).padEnd(34)} ${problems.length === before ? "OK" : "ISSUES"}`);
  }

  // open a real product editor
  await page.goto(`${BASE}/admin/products`, { waitUntil: "domcontentloaded" });
  const hrefs = await page.locator("a[href^='/admin/products/']").evaluateAll((els) =>
    els.map((e) => (e as HTMLAnchorElement).getAttribute("href")).filter((h) => h && h !== "/admin/products/new"),
  );
  const first = hrefs[0];
  if (first) {
    await page.goto(BASE + first, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(600);
    console.log("product editor:", await page.locator("h1").first().innerText());
    console.log("  status field bound to form:",
      await page.locator("select[name='status'][form='product-form']").count() ? "PASS" : "FAIL");
    console.log("  category field bound to form:",
      await page.locator("select[name='categoryId'][form='product-form']").count() ? "PASS" : "FAIL");
    await page.screenshot({ path: `${OUT}/admin-product.png`, fullPage: false });
  }

  // an order detail page
  await page.goto(`${BASE}/admin/orders`, { waitUntil: "domcontentloaded" });
  const order = await page.locator("a[href^='/admin/orders/']").first().getAttribute("href");
  if (order) {
    await page.goto(BASE + order, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(600);
    console.log("order detail:", await page.locator("h1").first().innerText());
  }

  await page.goto(`${BASE}/admin`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${OUT}/admin-dashboard.png`, fullPage: false });
} catch (error) {
  console.log("FAILED:", (error as Error).message.split("\n")[0]);
} finally {
  console.log(problems.length ? `\nproblems (${problems.length}):\n` + [...new Set(problems)].slice(0, 12).join("\n") : "\nno errors");
  await browser.close();
}
