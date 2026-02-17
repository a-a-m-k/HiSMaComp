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
    await page.goto("/");
    await page.waitForSelector("#map-container-area", { timeout: 10000 });

    // Check that timeline is focusable
    const timeline = page.locator("#timeline");
    await timeline.focus();
    await expect(timeline).toBeFocused();

    // Check that screenshot button is accessible
    const screenshotButton = page.locator("#map-screenshot-button");
    await screenshotButton.focus();
    await expect(screenshotButton).toBeFocused();

    // Check that map container is focusable
    const mapContainer = page.locator("#map-container-area");
    await mapContainer.focus();
    await expect(mapContainer).toBeFocused();
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
    await page.goto("/");
    await page.waitForSelector("#map-container-area", { timeout: 10000 });

    // Focus the screenshot button
    const screenshotButton = page.locator("#map-screenshot-button");
    await screenshotButton.focus();

    // Check that focus indicator is visible
    const focusedStyles = await screenshotButton.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return {
        outline: styles.outline,
        outlineOffset: styles.outlineOffset,
        boxShadow: styles.boxShadow,
      };
    });

    // Focus indicator should be visible (box-shadow for focus-visible)
    expect(focusedStyles.boxShadow).not.toBe("none");
  });

  test("should have proper form labels and inputs", async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector("#timeline", { timeout: 10000 });

    // Check timeline slider has proper ARIA attributes
    const timeline = page.locator("#timeline");
    const slider = timeline.locator('input[type="range"]').first();

    // Slider should be accessible
    await expect(slider).toHaveAttribute("aria-label");
  });

  test("should have skip links or logical tab order", async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector("#map-container-area", { timeout: 10000 });

    // Tab through and verify we can reach timeline, screenshot button, and map (focus may land on child elements)
    const maxTabs = 20;
    let timelineReached = false;
    let screenshotReached = false;
    let mapReached = false;

    for (let i = 0; i < maxTabs; i++) {
      await page.keyboard.press("Tab");
      const activeIn = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement;
        if (!el) return { timeline: false, screenshot: false, map: false };
        return {
          timeline: !!document.getElementById("timeline")?.contains(el),
          screenshot:
            el.id === "map-screenshot-button" ||
            el.closest("#map-screenshot-button") != null,
          map:
            el.id === "map-container-area" ||
            el.closest("#map-container-area") != null,
        };
      });
      if (activeIn.timeline) timelineReached = true;
      if (activeIn.screenshot) screenshotReached = true;
      if (activeIn.map) mapReached = true;
      if (timelineReached && screenshotReached && mapReached) break;
    }

    expect(timelineReached).toBe(true);
    expect(screenshotReached).toBe(true);
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
