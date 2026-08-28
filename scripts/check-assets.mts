/** Walks the main pages and reports any asset the browser could not load. */
import { chromium } from "playwright";
const BASE = "http://localhost:3000";
const b = await chromium.launch({ channel: "chrome" });
const p = await b.newPage({ viewport: { width: 390, height: 844 } });
const bad = new Set<string>();
p.on("response", r => { if (r.status() === 404) bad.add(`${r.status()} ${r.url().replace(BASE,"")}`); });
for (const path of ["/", "/shop", "/product/richmond-buttoned-6-seater-sofa", "/cart", "/checkout", "/projects", "/about"]) {
  await p.goto(BASE + path, { waitUntil: "domcontentloaded" });
  await p.waitForTimeout(2500);
}
console.log(bad.size ? `${bad.size} missing:\n` + [...bad].join("\n") : "no missing assets");
process.exitCode = bad.size ? 1 : 0;
await b.close();
