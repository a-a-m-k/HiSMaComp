/**
 * E2E: Map resize spinner and below-min viewport behaviour
 *
 * - Resizing the window shows "Resizing map..." briefly, then hides after debounce.
 * - When viewport is below min (300px), the resize spinner is not shown.
 *
 * Run: npm run test:e2e -- resize-map.spec.ts
 */

import { test, expect } from "@playwright/test";

const RESIZE_DEBOUNCE_MS = 320;
const BELOW_MIN_WIDTH = 280;

test.describe("Map resize behaviour", () => {
  test("shows resize spinner briefly when window is resized, then hides after debounce", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1000, height: 700 });
    await page.goto("/");
    await page.waitForSelector("#map-container-area", { timeout: 20000 });
    await page.waitForTimeout(500);

    await page.setViewportSize({ width: 950, height: 600 });

    const spinner = page.getByText("Resizing map...");
    await spinner.waitFor({ state: "visible", timeout: 8000 });

    await expect(spinner).not.toBeVisible({ timeout: 10000 });
  });

  test("does not show resize spinner when viewport is below min width", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForSelector("#map-container-area", { timeout: 10000 });

    // Resize to below min viewport (300px) – spinner should not be shown
    await page.setViewportSize({ width: BELOW_MIN_WIDTH, height: 400 });

    const spinner = page.getByText("Resizing map...");
    // Spinner may flash; give a short window then assert it is not present
    await page.waitForTimeout(100);
    await expect(spinner).not.toBeVisible();
  });

  test("narrow layout applies at small width (data-narrow-layout on body)", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForSelector("#map-container-area", { timeout: 10000 });

    await page.setViewportSize({ width: BELOW_MIN_WIDTH, height: 400 });
    await page.waitForTimeout(200);
    await expect(page.locator("body")).toHaveAttribute(
      "data-narrow-layout",
      "true"
    );

    await page.setViewportSize({ width: 320, height: 400 });
    await page.waitForTimeout(200);
    await expect(page.locator("body")).not.toHaveAttribute(
      "data-narrow-layout",
      "true"
    );
  });
});
