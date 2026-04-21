import type { Page } from "@playwright/test";

/**
 * Wait until the main map shell, canvas, and timeline slider are present.
 * Prefer this over fixed timeouts after navigation or viewport changes.
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
}
