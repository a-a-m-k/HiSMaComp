/**
 * README hero image: wait until data + MapLibre idle, then capture PNG.
 *
 *   HERO_URL=https://a-a-m-k.github.io/HiSMaComp/ npm run capture:hero
 *   HERO_URL=http://localhost:5173/ npm run capture:hero   (dev server + .env key)
 *
 * Requires: npx playwright install chromium (or npm run test:e2e:install)
 */
const path = require("path");
const { chromium } = require("@playwright/test");

const url =
  process.env.HERO_URL || "https://a-a-m-k.github.io/HiSMaComp/";
const out = path.join(__dirname, "..", "docs", "hero.png");
const tilePaintMs = Math.max(
  0,
  parseInt(process.env.HERO_TILE_WAIT_MS || "3000", 10) || 3000
);

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1280, height: 720 },
  });

  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 90_000 });

  await page
    .locator("#map-container-area")
    .waitFor({ state: "visible", timeout: 30_000 });
  await page
    .locator(".maplibregl-canvas")
    .first()
    .waitFor({ state: "visible", timeout: 30_000 });
  await page
    .locator("#timeline")
    .getByRole("slider")
    .waitFor({ state: "visible", timeout: 30_000 });

  const historical = page.getByRole("status", {
    name: /Loading historical data/i,
  });
  if ((await historical.count()) > 0) {
    await historical.first().waitFor({ state: "hidden", timeout: 120_000 });
  }

  await page
    .locator('#map-container-area[data-map-ready="true"]')
    .waitFor({ state: "visible", timeout: 120_000 });

  await page.waitForTimeout(tilePaintMs);
  await page.screenshot({ path: out, type: "png" });
  console.log(`Wrote ${out}`);
  await browser.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
