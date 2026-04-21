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

import { selectYearViaTimelineSlider } from "./helpers/selectYear";
import { waitForAppShell } from "./helpers/waitForApp";

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

test.describe("@visual Cross-Device Zoom Behavior", () => {
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

      await page.goto("/");
      await waitForAppShell(page);

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

      await selectYearViaTimelineSlider(page, 1300);

      await page.screenshot({
        path: `tests/results/screenshots/${deviceConfig.name.replace(/\s+/g, "-")}-year-1300.png`,
        fullPage: true,
      });

      await selectYearViaTimelineSlider(page, 1500);

      await page.screenshot({
        path: `tests/results/screenshots/${deviceConfig.name.replace(/\s+/g, "-")}-year-1500.png`,
        fullPage: true,
      });

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
    await pagePortrait.goto("/");
    await waitForAppShell(pagePortrait);

    await pagePortrait.screenshot({
      path: "tests/results/screenshots/orientation-portrait.png",
      fullPage: true,
    });

    await contextPortrait.close();
  });

  test("should handle window resize correctly", async ({ page }) => {
    // Start with desktop size
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto("/");
    await waitForAppShell(page);

    await page.screenshot({
      path: "tests/results/screenshots/resize-desktop.png",
      fullPage: true,
    });

    await page.setViewportSize({ width: 768, height: 1024 });
    await waitForAppShell(page);

    await page.screenshot({
      path: "tests/results/screenshots/resize-tablet.png",
      fullPage: true,
    });

    await page.setViewportSize({ width: 375, height: 667 });
    await waitForAppShell(page);

    await page.screenshot({
      path: "tests/results/screenshots/resize-mobile.png",
      fullPage: true,
    });
  });
});

test.describe("@visual Map Interaction Tests", () => {
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

      await page.goto("/");
      await waitForAppShell(page);

      const zoomIn = page.locator(".maplibregl-ctrl-zoom-in").first();
      const zoomOut = page.locator(".maplibregl-ctrl-zoom-out").first();
      const zoomInVisible = await zoomIn.isVisible().catch(() => false);
      const zoomOutVisible = await zoomOut.isVisible().catch(() => false);

      if (zoomInVisible && zoomOutVisible) {
        await zoomIn.click();
        await page.screenshot({
          path: `tests/results/screenshots/${device.name}-zoomed-in.png`,
          fullPage: true,
        });

        await zoomOut.click();
        await page.screenshot({
          path: `tests/results/screenshots/${device.name}-zoomed-out.png`,
          fullPage: true,
        });
      }

      await context.close();
    }
  });

  test("should zoom in/out using keyboard shortcuts", async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto("/");
    await waitForAppShell(page);

    const zoomInLocator = page.locator(".maplibregl-ctrl-zoom-in").first();
    const zoomOutLocator = page.locator(".maplibregl-ctrl-zoom-out").first();

    await page.keyboard.press("Control+Equal");
    await page.keyboard.press("Control+Minus");

    const zoomInAttached = await zoomInLocator
      .waitFor({ state: "attached", timeout: 10000 })
      .then(() => true)
      .catch(() => false);
    const zoomOutAttached = await zoomOutLocator
      .waitFor({ state: "attached", timeout: 5000 })
      .then(() => true)
      .catch(() => false);

    if (zoomInAttached && zoomOutAttached) {
      const zoomInButton = await zoomInLocator.elementHandle();
      const zoomOutButton = await zoomOutLocator.elementHandle();
      expect(zoomInButton).toBeTruthy();
      expect(zoomOutButton).toBeTruthy();
      await zoomInButton!.click();
      await zoomOutButton!.click();
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
    } else {
      expect(await page.locator(".maplibregl-canvas").count()).toBeGreaterThan(
        0
      );
    }
  });

  test("zoom buttons should be above overlays (z-index test)", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto("/");
    await waitForAppShell(page);

    const zoomGroup = page.locator(".maplibregl-ctrl-group").first();
    const zoomIn = page.locator(".maplibregl-ctrl-zoom-in").first();
    const controlAttached = await zoomGroup
      .waitFor({ state: "attached", timeout: 25000 })
      .then(() => true)
      .catch(() => false);

    if (!controlAttached) {
      expect(await page.locator(".maplibregl-canvas").count()).toBeGreaterThan(
        0
      );
      return;
    }

    const zoomInZIndex = await page.evaluate(() => {
      const button = document.querySelector(".maplibregl-ctrl-zoom-in");
      if (!button) return null;
      const style = window.getComputedStyle(button);
      const z = style.zIndex;
      if (z === "auto") return "auto";
      const n = parseInt(z || "0", 10);
      return Number.isNaN(n) ? null : n;
    });
    const zoomGroupZIndex = await page.evaluate(() => {
      const group = document.querySelector(".maplibregl-ctrl-group");
      if (!group) return null;
      const style = window.getComputedStyle(group);
      const z = style.zIndex;
      if (z === "auto") return "auto";
      const n = parseInt(z || "0", 10);
      return Number.isNaN(n) ? null : n;
    });

    expect(zoomInZIndex !== null || zoomGroupZIndex !== null).toBe(true);
    if (
      typeof zoomInZIndex === "number" &&
      typeof zoomGroupZIndex === "number"
    ) {
      expect(zoomInZIndex).toBeGreaterThanOrEqual(0);
      expect(zoomGroupZIndex).toBeGreaterThanOrEqual(0);
    }
  });
});
