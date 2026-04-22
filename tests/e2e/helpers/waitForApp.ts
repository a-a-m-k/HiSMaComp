import type { Page } from "@playwright/test";

/**
 * Wait until the main map shell, canvas, and timeline slider are present.
 * Prefer this over fixed timeouts after navigation or viewport changes.
 * Also waits for the initial data overlay (if shown) to clear and for MapLibre `idle`
 * (`data-map-ready` on `#map-container-area`) so tiles/markers are usable.
 */
export async function waitForAppShell(page: Page): Promise<void> {
  const APP_READY_TIMEOUT_MS = 25_000;

  try {
    await page
      .locator("#map-container-area")
      .waitFor({ state: "visible", timeout: APP_READY_TIMEOUT_MS });
    await page
      .locator(".maplibregl-canvas")
      .first()
      .waitFor({ state: "visible", timeout: APP_READY_TIMEOUT_MS });
    await page
      .locator("#timeline")
      .getByRole("slider")
      .waitFor({ state: "visible", timeout: APP_READY_TIMEOUT_MS });
  } catch (error) {
    throw new Error(
      `App shell did not become visible within ${APP_READY_TIMEOUT_MS}ms: ${String(error)}`
    );
  }

  const historical = page.getByRole("status", {
    name: /Loading historical data/i,
  });
  if ((await historical.count()) > 0) {
    try {
      await historical
        .first()
        .waitFor({ state: "hidden", timeout: APP_READY_TIMEOUT_MS });
    } catch (error) {
      throw new Error(
        `Historical loading overlay did not hide within ${APP_READY_TIMEOUT_MS}ms: ${String(error)}`
      );
    }
  }

  const readyLocator = page.locator(
    '#map-container-area[data-map-ready="true"]'
  );
  try {
    await readyLocator.waitFor({
      state: "visible",
      timeout: APP_READY_TIMEOUT_MS,
    });
  } catch (error) {
    // Fallback for cases where map-ready marker is delayed/not set by style
    // transitions, while the map is already visible and interactable.
    const mapContainer = page.locator("#map-container-area");
    const mapCanvas = page.locator(".maplibregl-canvas").first();
    const spinner = page.getByRole("status", {
      name: /switching map style/i,
    });

    await mapContainer.waitFor({
      state: "visible",
      timeout: APP_READY_TIMEOUT_MS,
    });
    await mapCanvas.waitFor({
      state: "visible",
      timeout: APP_READY_TIMEOUT_MS,
    });
    if ((await spinner.count()) > 0) {
      await spinner
        .first()
        .waitFor({ state: "hidden", timeout: APP_READY_TIMEOUT_MS });
    }

    // Do not fail solely on missing marker if map shell is interactable.
    void error;
  }
}
