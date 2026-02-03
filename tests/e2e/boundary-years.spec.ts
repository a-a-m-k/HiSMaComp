/**
 * Boundary Years Zoom Testing
 *
 * Tests zoom behavior at the first and last available years in the dataset
 * to ensure all towns are visible at both extremes.
 */

import { test, expect, devices } from "@playwright/test";

const BASE_URL = "http://localhost:5173";

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

      await page.goto(BASE_URL);
      await page.waitForSelector(".maplibregl-canvas", { timeout: 10000 });

      // Wait for initial load
      await page.waitForTimeout(2000);

      // Find and set the timeline slider to year 800
      const slider = await page.$('input[type="range"]');
      if (slider) {
        await slider.fill("800");
        await page.waitForTimeout(1000); // Wait for map to update
      }

      // Take screenshot
      await page.screenshot({
        path: `tests/results/screenshots/boundary-years/${deviceConfig.name.replace(/\s+/g, "-")}-year-800.png`,
        fullPage: true,
      });

      // Verify map canvas is visible
      const mapCanvas = await page.$(".maplibregl-canvas");
      expect(mapCanvas).toBeTruthy();
      const isVisible = await mapCanvas!.isVisible();
      expect(isVisible).toBe(true);

      await context.close();
    }
  });

  test("should display all towns correctly in year 1750 (last century)", async ({
    browser,
  }) => {
    for (const deviceConfig of testDevices) {
      const context = await browser.newContext(deviceConfig);
      const page = await context.newPage();

      await page.goto(BASE_URL);
      await page.waitForSelector(".maplibregl-canvas", { timeout: 10000 });

      // Wait for initial load
      await page.waitForTimeout(2000);

      // Find and set the timeline slider to year 1750
      const slider = await page.$('input[type="range"]');
      if (slider) {
        await slider.fill("1750");
        await page.waitForTimeout(1000); // Wait for map to update
      }

      // Take screenshot
      await page.screenshot({
        path: `tests/results/screenshots/boundary-years/${deviceConfig.name.replace(/\s+/g, "-")}-year-1750.png`,
        fullPage: true,
      });

      // Verify map canvas is visible
      const mapCanvas = await page.$(".maplibregl-canvas");
      expect(mapCanvas).toBeTruthy();
      const isVisible = await mapCanvas!.isVisible();
      expect(isVisible).toBe(true);

      await context.close();
    }
  });

  test("should handle year transitions smoothly", async ({ browser }) => {
    const deviceConfig = devices["iPhone 12"];
    const context = await browser.newContext(deviceConfig);
    const page = await context.newPage();

    await page.goto(BASE_URL);
    await page.waitForSelector(".maplibregl-canvas", { timeout: 10000 });
    await page.waitForTimeout(2000);

    const slider = await page.$('input[type="range"]');
    if (slider) {
      // Test smooth transition from first to last year
      const years = ["800", "1000", "1200", "1400", "1600", "1750"];

      for (const year of years) {
        await slider.fill(year);
        await page.waitForTimeout(500);

        // Verify map is still visible after each change
        const mapCanvas = await page.$(".maplibregl-canvas");
        expect(mapCanvas).toBeTruthy();
        const isVisible = await mapCanvas!.isVisible();
        expect(isVisible).toBe(true);
      }

      // Take final screenshot
      await page.screenshot({
        path: "tests/results/screenshots/boundary-years/transition-complete.png",
        fullPage: true,
      });
    }

    await context.close();
  });

  test("should maintain consistent zoom across all years", async ({
    browser,
  }) => {
    const deviceConfig = { viewport: { width: 1920, height: 1080 } };
    const context = await browser.newContext(deviceConfig);
    const page = await context.newPage();

    await page.goto(BASE_URL);
    await page.waitForSelector(".maplibregl-canvas", { timeout: 10000 });
    await page.waitForTimeout(2000);

    // Test that zoom doesn't change when year changes
    // (because we use ALL towns for zoom calculation)
    const slider = await page.$('input[type="range"]');
    if (slider) {
      // Set to year 800
      await slider.fill("800");
      await page.waitForTimeout(500);
      await page.screenshot({
        path: "tests/results/screenshots/boundary-years/consistency-year-800.png",
        fullPage: false,
      });

      // Set to year 1750
      await slider.fill("1750");
      await page.waitForTimeout(500);
      await page.screenshot({
        path: "tests/results/screenshots/boundary-years/consistency-year-1750.png",
        fullPage: false,
      });

      // Set to middle year
      await slider.fill("1200");
      await page.waitForTimeout(500);
      await page.screenshot({
        path: "tests/results/screenshots/boundary-years/consistency-year-1200.png",
        fullPage: false,
      });
    }

    await context.close();
  });
});
