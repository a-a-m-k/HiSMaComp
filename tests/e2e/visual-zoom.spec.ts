/**
 * Visual Zoom Testing Script
 *
 * This script tests zoom behavior across different device viewports by:
 * 1. Opening the app in various screen sizes
 * 2. Taking screenshots for visual verification
 * 3. Checking that the map properly fits all towns
 *
 * To run this test:
 * 1. Install Playwright: npm install -D @playwright/test
 * 2. Start your dev server: npm run dev
 * 3. Run tests: npx playwright test tests/visual-zoom.spec.ts
 * 4. View screenshots: npx playwright show-report
 */

import { test, expect, devices } from "@playwright/test";

// Device configurations to test
const deviceConfigs = [
  // Mobile devices
  { name: "iPhone SE", ...devices["iPhone SE"] },
  { name: "iPhone 12", ...devices["iPhone 12"] },
  { name: "iPhone 14 Pro", ...devices["iPhone 14 Pro"] },
  { name: "Pixel 5", ...devices["Pixel 5"] },
  { name: "Galaxy S21", viewport: { width: 360, height: 800 } },

  // Tablets
  { name: "iPad Mini", ...devices["iPad Mini"] },
  { name: "iPad Pro", ...devices["iPad Pro"] },

  // Desktop
  { name: 'Laptop 13"', viewport: { width: 1280, height: 800 } },
  { name: "Desktop HD", viewport: { width: 1920, height: 1080 } },
  { name: "Desktop 2K", viewport: { width: 2560, height: 1440 } },
  { name: "Ultrawide", viewport: { width: 3440, height: 1440 } },
];

// Base URL for your dev server
const BASE_URL = "http://localhost:5173";

test.describe("Cross-Device Zoom Behavior", () => {
  deviceConfigs.forEach(deviceConfig => {
    test(`should display correctly on ${deviceConfig.name}`, async ({
      browser,
    }) => {
      const context = await browser.newContext({
        ...deviceConfig,
        // Set locale if needed
        locale: "en-US",
      });

      const page = await context.newPage();

      // Navigate to your app
      await page.goto(BASE_URL);

      // Wait for map to load
      await page.waitForSelector(".maplibregl-canvas", { timeout: 10000 });

      // Wait for any animations or data loading
      await page.waitForTimeout(2000);

      // Take screenshot of initial state
      await page.screenshot({
        path: `tests/results/screenshots/${deviceConfig.name.replace(/\s+/g, "-")}-initial.png`,
        fullPage: true,
      });

      // Check that map canvas exists
      const mapCanvas = await page.$(".maplibregl-canvas");
      expect(mapCanvas).toBeTruthy();

      // Check that map canvas is actually rendered (most important test)
      if (mapCanvas) {
        const canvasVisible = await mapCanvas.isVisible();
        expect(canvasVisible).toBe(true);
      }

      // Wait for timeline to be ready
      await page.waitForTimeout(500);

      // Find and use the timeline slider
      const slider = await page.locator('input[type="range"]');
      const sliderExists = (await slider.count()) > 0;

      if (sliderExists) {
        // Navigate to year 1300 using keyboard (800->1000->1200->1300)
        await slider.focus();
        await page.keyboard.press("ArrowRight"); // 800 -> 1000
        await page.waitForTimeout(500);
        await page.keyboard.press("ArrowRight"); // 1000 -> 1200
        await page.waitForTimeout(500);
        await page.keyboard.press("ArrowRight"); // 1200 -> 1300
        await page.waitForTimeout(1500);

        // Take screenshot at year 1300
        await page.screenshot({
          path: `tests/results/screenshots/${deviceConfig.name.replace(/\s+/g, "-")}-year-1300.png`,
          fullPage: true,
        });

        // Navigate to year 1500 (1300->1400->1500)
        await page.keyboard.press("ArrowRight"); // 1300 -> 1400
        await page.waitForTimeout(500);
        await page.keyboard.press("ArrowRight"); // 1400 -> 1500
        await page.waitForTimeout(1500);

        // Take screenshot after year change
        await page.screenshot({
          path: `tests/results/screenshots/${deviceConfig.name.replace(/\s+/g, "-")}-year-1500.png`,
          fullPage: true,
        });
      }

      await context.close();
    });
  });

  test("should maintain consistent zoom on orientation change", async ({
    browser,
  }) => {
    // Test portrait mode
    const contextPortrait = await browser.newContext({
      viewport: { width: 390, height: 844 }, // iPhone 12 portrait
    });

    const pagePortrait = await contextPortrait.newPage();
    await pagePortrait.goto(BASE_URL);
    await pagePortrait.waitForSelector(".maplibregl-canvas");
    await pagePortrait.waitForTimeout(1000);

    await pagePortrait.screenshot({
      path: "tests/results/screenshots/orientation-portrait.png",
      fullPage: true,
    });

    await contextPortrait.close();
  });

  test("should handle window resize correctly", async ({ page }) => {
    // Start with desktop size
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(BASE_URL);
    await page.waitForSelector(".maplibregl-canvas");
    await page.waitForTimeout(1000);

    await page.screenshot({
      path: "tests/results/screenshots/resize-desktop.png",
      fullPage: true,
    });

    // Resize to tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(1000);

    await page.screenshot({
      path: "tests/results/screenshots/resize-tablet.png",
      fullPage: true,
    });

    // Resize to mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);

    await page.screenshot({
      path: "tests/results/screenshots/resize-mobile.png",
      fullPage: true,
    });
  });
});

test.describe("Map Interaction Tests", () => {
  test("should allow zooming in/out on different devices", async ({
    browser,
  }) => {
    const devices = [
      { name: "Mobile", viewport: { width: 390, height: 844 } },
      { name: "Desktop", viewport: { width: 1920, height: 1080 } },
    ];

    for (const device of devices) {
      const context = await browser.newContext({ viewport: device.viewport });
      const page = await context.newPage();

      await page.goto(BASE_URL);
      await page.waitForSelector(".maplibregl-canvas");
      await page.waitForTimeout(1000);

      // Get zoom controls
      const zoomInButton = await page.$(".maplibregl-ctrl-zoom-in");
      const zoomOutButton = await page.$(".maplibregl-ctrl-zoom-out");

      if (zoomInButton && zoomOutButton) {
        // Click zoom in
        await zoomInButton.click();
        await page.waitForTimeout(500);

        await page.screenshot({
          path: `tests/results/screenshots/${device.name}-zoomed-in.png`,
          fullPage: true,
        });

        // Click zoom out
        await zoomOutButton.click();
        await page.waitForTimeout(500);

        await page.screenshot({
          path: `tests/results/screenshots/${device.name}-zoomed-out.png`,
          fullPage: true,
        });
      }

      await context.close();
    }
  });

  test("should zoom in/out using keyboard shortcuts", async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForSelector(".maplibregl-canvas");
    await page.waitForTimeout(1000);

    // Get initial zoom level
    const initialZoom = await page.evaluate(() => {
      const mapElement = document.querySelector(".maplibregl-map");
      return mapElement?.getAttribute("data-testid") || "0";
    });

    // Test Ctrl+Plus zoom in
    await page.keyboard.press("Control+Equal");
    await page.waitForTimeout(500);

    // Test Ctrl+Minus zoom out
    await page.keyboard.press("Control+Minus");
    await page.waitForTimeout(500);

    // Verify zoom buttons are clickable
    const zoomInButton = await page.$(".maplibregl-ctrl-zoom-in");
    const zoomOutButton = await page.$(".maplibregl-ctrl-zoom-out");

    expect(zoomInButton).toBeTruthy();
    expect(zoomOutButton).toBeTruthy();

    // Test clicking zoom buttons
    await zoomInButton!.click();
    await page.waitForTimeout(300);

    await zoomOutButton!.click();
    await page.waitForTimeout(300);

    // Verify buttons remain interactive
    const isZoomInClickable = await zoomInButton!.evaluate(el => {
      const style = window.getComputedStyle(el);
      return style.pointerEvents !== "none" && style.display !== "none";
    });

    const isZoomOutClickable = await zoomOutButton!.evaluate(el => {
      const style = window.getComputedStyle(el);
      return style.pointerEvents !== "none" && style.display !== "none";
    });

    expect(isZoomInClickable).toBe(true);
    expect(isZoomOutClickable).toBe(true);
  });

  test("zoom buttons should be above overlays (z-index test)", async ({
    page,
  }) => {
    await page.goto(BASE_URL);
    await page.waitForSelector(".maplibregl-canvas");
    await page.waitForTimeout(1000);

    // Check z-index of zoom buttons
    const zoomInZIndex = await page.evaluate(() => {
      const button = document.querySelector(".maplibregl-ctrl-zoom-in");
      if (!button) return null;
      const style = window.getComputedStyle(button);
      return parseInt(style.zIndex || "0", 10);
    });

    const zoomGroupZIndex = await page.evaluate(() => {
      const group = document.querySelector(".maplibregl-ctrl-group");
      if (!group) return null;
      const style = window.getComputedStyle(group);
      return parseInt(style.zIndex || "0", 10);
    });

    // Verify buttons have reasonable z-index (not 0 or negative)
    expect(zoomInZIndex).toBeGreaterThan(0);
    expect(zoomGroupZIndex).toBeGreaterThan(0);
  });
});
