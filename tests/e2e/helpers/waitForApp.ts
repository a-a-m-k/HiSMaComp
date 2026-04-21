import type { Page } from "@playwright/test";

/**
 * Wait until the main map shell, canvas, and timeline slider are present.
 * Prefer this over fixed timeouts after navigation or viewport changes.
 * Also waits for the initial data overlay (if shown) to clear and for MapLibre `idle`
 * (`data-map-ready` on `#map-container-area`) so tiles/markers are usable.
 */
export async function waitForAppShell(page: Page): Promise<void> {
  await page
    .locator("#map-container-area")
    .waitFor({ state: "visible", timeout: 20_000 });
  await page
    .locator(".maplibregl-canvas")
    .first()
    .waitFor({ state: "visible", timeout: 20_000 });
  await page
    .locator("#timeline")
    .getByRole("slider")
    .waitFor({ state: "visible", timeout: 15_000 });

  const historical = page.getByRole("status", {
    name: /Loading historical data/i,
  });
  if ((await historical.count()) > 0) {
    await historical.first().waitFor({ state: "hidden", timeout: 120_000 });
  }

  await page
    .locator('#map-container-area[data-map-ready="true"]')
    .waitFor({ state: "visible", timeout: 120_000 });
}
