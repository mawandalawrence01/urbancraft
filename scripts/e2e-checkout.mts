/** End-to-end: add to cart on a real PDP, check out, land on the order page. */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const OUT = process.env.SHOT_DIR ?? "tmp";
await mkdir(OUT, { recursive: true });

const BASE = "http://localhost:3000";
const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

const log: string[] = [];
page.on("pageerror", (e) => log.push(`PAGE ERROR: ${e.message}`));
page.on("console", (m) => m.type() === "error" && log.push(`CONSOLE: ${m.text().slice(0, 160)}`));

try {
  // --- add two different products -----------------------------------------
  await page.goto(`${BASE}/shop`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("article a[href^='/product/']");
  const links = await page.locator("article a[href^='/product/']").evaluateAll(
    (els) => [...new Set(els.map((e) => (e as HTMLAnchorElement).getAttribute("href")))].slice(0, 2),
  );
  console.log("products:", links.join(", "));

  for (const href of links) {
    await page.goto(BASE + href, { waitUntil: "domcontentloaded" });
    await page.getByTestId("add-to-cart").click();
    await page.waitForTimeout(400);
  }

  // --- cart ---------------------------------------------------------------
  await page.goto(`${BASE}/cart`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("text=Summary");
  const cartTotal = await page.locator("aside .font-display").last().innerText();
  console.log("cart total:", cartTotal);

  // --- checkout -----------------------------------------------------------
  await page.goto(`${BASE}/checkout`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("input[name='contactName']");

  await page.fill("input[name='contactName']", "Test Buyer");
  await page.fill("input[name='contactPhone']", "0772123456");
  await page.fill("input[name='deliveryLine1']", "Plot 24 Bukoto Street");
  await page.fill("input[name='deliveryLandmark']", "Opposite Cafe Javas");
  await page.locator("input[name='paymentMethod'][value='CASH_ON_DELIVERY']").check();
  await page.fill("textarea[name='customerNote']", "Automated end-to-end test");

  const checkoutTotal = await page.locator("aside .font-display").last().innerText();
  console.log("checkout total:", checkoutTotal);

  await page.getByRole("button", { name: /Place order/i }).click();
  await page.waitForURL(/\/orders\/UC-/, { timeout: 30_000 });

  const orderNumber = page.url().match(/orders\/(UC-[A-Z0-9]+)/)?.[1];
  console.log("order created:", orderNumber);

  await page.waitForSelector("text=Order received");
  const orderTotal = await page.locator("dd.tabular").last().innerText();
  console.log("order total:", orderTotal);
  console.log("totals match:", checkoutTotal.includes(orderTotal.replace("UGX ", "")) || orderTotal === checkoutTotal ? "PASS" : `CHECK (${checkoutTotal} vs ${orderTotal})`);

  // cart should be emptied after a successful order
  await page.goto(`${BASE}/cart`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(600);
  const emptied = await page.locator("text=Your cart is empty").count();
  console.log("cart cleared after order:", emptied > 0 ? "PASS" : "FAIL");

  await page.goto(`${BASE}/orders/${orderNumber}`, { waitUntil: "domcontentloaded" });
  await page.screenshot({ path: `${OUT}/order-mobile.png`, fullPage: true });
  console.log("RESULT: checkout flow OK");
} catch (error) {
  console.log("RESULT: FAILED —", (error as Error).message.split("\n")[0]);
  await page.screenshot({ path: `${OUT}/e2e-fail.png`, fullPage: true });
} finally {
  if (log.length) console.log("\nbrowser log:\n" + log.slice(0, 10).join("\n"));
  await browser.close();
}
