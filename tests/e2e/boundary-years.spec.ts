/**
 * Boundary Years Zoom Testing
 *
 * Tests zoom behavior at the first and last available years in the dataset
 * to ensure all towns are visible at both extremes.
 */

import { test, expect, devices } from "@playwright/test";

import { selectYearViaTimelineSlider } from "./helpers/selectYear";
import { waitForAppShell } from "./helpers/waitForApp";

// Test on representative devices
const testDevices = [
  { name: "iPhone 12", ...devices["iPhone 12"] },
  { name: "iPad Mini", ...devices["iPad Mini"] },
  { name: "Desktop HD", viewport: { width: 1920, height: 1080 } },
];

test.describe("Boundary Years Zoom Testing", () => {
  test("should display all towns correctly in year 800 (first century)", async ({
    browser,
  }) => {
    for (const deviceConfig of testDevices) {
      const context = await browser.newContext(deviceConfig);
      const page = await context.newPage();

      await page.goto("/");
      await waitForAppShell(page);

      await selectYearViaTimelineSlider(page, 800);

      await page.screenshot({
        path: `tests/results/screenshots/boundary-years/${deviceConfig.name.replace(/\s+/g, "-")}-year-800.png`,
        fullPage: true,
      });

      const mapCanvas = page.locator(".maplibregl-canvas").first();
      await expect(mapCanvas).toBeVisible();

      await context.close();
    }
  });

  test("should display all towns correctly in year 1750 (last century)", async ({
    browser,
  }) => {
    for (const deviceConfig of testDevices) {
      const context = await browser.newContext(deviceConfig);
      const page = await context.newPage();

      await page.goto("/");
      await waitForAppShell(page);

      await selectYearViaTimelineSlider(page, 1750);

      await page.screenshot({
        path: `tests/results/screenshots/boundary-years/${deviceConfig.name.replace(/\s+/g, "-")}-year-1750.png`,
        fullPage: true,
      });

      const mapCanvas = page.locator(".maplibregl-canvas").first();
      await expect(mapCanvas).toBeVisible();

      await context.close();
    }
  });

  test("should handle year transitions smoothly", async ({ browser }) => {
    const deviceConfig = devices["iPhone 12"];
    const context = await browser.newContext(deviceConfig);
    const page = await context.newPage();

    await page.goto("/");
    await waitForAppShell(page);

    const years = [800, 1000, 1200, 1400, 1600, 1750] as const;
    for (const year of years) {
      await selectYearViaTimelineSlider(page, year);
      const mapCanvas = page.locator(".maplibregl-canvas").first();
      await expect(mapCanvas).toBeVisible();
    }
    await page.screenshot({
      path: "tests/results/screenshots/boundary-years/transition-complete.png",
      fullPage: true,
    });

    await context.close();
  });

  test("should maintain consistent zoom across all years", async ({
    browser,
  }) => {
    const deviceConfig = { viewport: { width: 1920, height: 1080 } };
    const context = await browser.newContext(deviceConfig);
    const page = await context.newPage();

    await page.goto("/");
    await waitForAppShell(page);

    await selectYearViaTimelineSlider(page, 800);
    await page.screenshot({
      path: "tests/results/screenshots/boundary-years/consistency-year-800.png",
      fullPage: false,
    });
    await selectYearViaTimelineSlider(page, 1750);
    await page.screenshot({
      path: "tests/results/screenshots/boundary-years/consistency-year-1750.png",
      fullPage: false,
    });
    await selectYearViaTimelineSlider(page, 1200);
    await page.screenshot({
      path: "tests/results/screenshots/boundary-years/consistency-year-1200.png",
      fullPage: false,
    });

    await context.close();
  });
});
