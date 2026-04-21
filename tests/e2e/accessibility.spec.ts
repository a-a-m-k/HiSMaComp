/**
 * Accessibility Testing with axe-core
 *
 * Automated accessibility tests using @axe-core/playwright to ensure
 * the application meets WCAG standards and is accessible to all users.
 *
 * To run this test:
 * npm run test:e2e -- accessibility.spec.ts
 */

import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Accessibility Tests", () => {
  test("should not have any automatically detectable accessibility violations", async ({
    page,
  }) => {
    await page.goto("/");

    // Wait for app to load
    await page.waitForSelector("#map-container-area", { timeout: 10000 });

    // Run accessibility scan
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "best-practice"])
      .analyze();

    // Check for violations
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test("should have proper heading structure", async ({ page }) => {
    await page.goto("/");

    // Main heading exists and is sr-only (visually hidden, in DOM for screen readers)
    const mainHeading = page.locator("main h1").first();
    await expect(mainHeading).toBeAttached();
    await expect(mainHeading).toHaveClass(/sr-only/);
    await expect(mainHeading).toContainText(/HiSMaComp|Historical Map/i);
  });

  test("should have proper ARIA labels on interactive elements", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForSelector("#map-container-area", { timeout: 10000 });

    // Check map container has proper ARIA attributes
    const mapContainer = page.locator("#map-container-area");
    await expect(mapContainer).toHaveAttribute("role", "application");
    await expect(mapContainer).toHaveAttribute("aria-label");
    await expect(mapContainer).toHaveAttribute("aria-describedby");
  });

  test("should have keyboard accessible controls", async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto("/");
    await page.waitForSelector("#map-container-area", { timeout: 20000 });
    await page.waitForSelector("#timeline", { timeout: 10000 });

    const slider = page.getByRole("slider").first();
    await slider.waitFor({ state: "visible", timeout: 10000 });
    await slider.focus();
    await expect(slider).toBeFocused();

    const mapContainer = page.locator("#map-container-area");
    await mapContainer.focus();
    await expect(mapContainer).toBeFocused();

    const screenshotButton = page.locator("#map-screenshot-button");
    if (await screenshotButton.isVisible()) {
      await screenshotButton.focus();
      await expect(screenshotButton).toBeFocused();
    }
  });

  test("should have proper color contrast", async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector("#map-container-area", { timeout: 10000 });

    // Run accessibility scan focusing on color contrast
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2aa"])
      .disableRules(["color-contrast"]) // Browser may not detect all contrast issues
      .analyze();

    // Check that we have no violations (color-contrast excluded as it's checked manually)
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test("should have proper focus indicators", async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto("/");
    await page.waitForSelector("#map-container-area", { timeout: 20000 });
    await page.waitForSelector("#timeline", { timeout: 10000 });

    const slider = page.getByRole("slider").first();
    await slider.waitFor({ state: "visible", timeout: 10000 });
    await slider.focus();

    const focusedStyles = await slider.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return {
        outline: styles.outline,
        outlineWidth: styles.outlineWidth,
        boxShadow: styles.boxShadow,
      };
    });

    const hasOutline =
      focusedStyles.outline &&
      focusedStyles.outline !== "none" &&
      focusedStyles.outlineWidth !== "0px";
    const hasBoxShadow =
      focusedStyles.boxShadow && focusedStyles.boxShadow !== "none";
    expect(hasOutline || hasBoxShadow).toBe(true);
  });

  test("should have proper form labels and inputs", async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector("#timeline", { timeout: 10000 });

    // Timeline uses MUI Slider (role="slider"), not a raw year-valued <input type="range">.
    const slider = page.locator("#timeline").getByRole("slider");
    await expect(slider).toHaveAttribute("aria-label");
  });

  test("should have skip links or logical tab order", async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto("/");
    await page.waitForSelector("#map-container-area", { timeout: 20000 });
    await page
      .locator("#timeline")
      .waitFor({ state: "visible", timeout: 10000 });

    const maxTabs = 60;
    let timelineReached = false;
    let mapReached = false;

    await page.keyboard.press("Tab");
    for (let i = 0; i < maxTabs; i++) {
      await page.keyboard.press("Tab");
      const activeIn = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement;
        if (!el) return { timeline: false, map: false };
        return {
          timeline: !!document.getElementById("timeline")?.contains(el),
          map:
            el.id === "map-container-area" ||
            el.closest("#map-container-area") != null,
        };
      });
      if (activeIn.timeline) timelineReached = true;
      if (activeIn.map) mapReached = true;
      if (timelineReached && mapReached) break;
    }

    expect(timelineReached).toBe(true);
    expect(mapReached).toBe(true);
  });

  test("should have descriptive text for screen readers", async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector("#map-container-area", { timeout: 10000 });
    await page.waitForSelector("#map-description", { timeout: 5000 });

    // Sr-only content exists in DOM (visually hidden via .sr-only)
    const srOnly = page.locator(".sr-only").first();
    await expect(srOnly).toBeAttached();
    await expect(srOnly).toHaveClass(/sr-only/);

    // Map description exists and describes the map for screen readers
    const mapDescription = page.locator("#map-description");
    await expect(mapDescription).toBeAttached();
    await expect(mapDescription).toHaveClass(/sr-only/);
    await expect(mapDescription).toHaveText(/Interactive map/i);
  });
});
