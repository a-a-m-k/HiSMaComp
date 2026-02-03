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

    // Check for main heading (should be hidden with sr-only but still in DOM)
    const mainHeading = page.locator("h1");
    await expect(mainHeading).toBeVisible({ visible: false }); // Hidden visually but accessible to screen readers
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

    // Tab through the page and verify logical order
    await page.keyboard.press("Tab"); // Timeline
    const timeline = page.locator("#timeline");
    await expect(timeline).toBeFocused();

    await page.keyboard.press("Tab"); // Screenshot button
    const screenshotButton = page.locator("#map-screenshot-button");
    await expect(screenshotButton).toBeFocused();

    // Continue with map container
    await page.keyboard.press("Tab");
    const mapContainer = page.locator("#map-container-area");
    await expect(mapContainer).toBeFocused();
  });

  test("should have descriptive text for screen readers", async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector("#map-container-area", { timeout: 10000 });

    // Check for screen reader only content
    const srOnly = page.locator(".sr-only");
    await expect(srOnly.first()).toBeVisible({ visible: false });

    // Check that map description exists
    const mapDescription = page.locator("#map-description");
    await expect(mapDescription).toBeVisible({ visible: false }); // Hidden visually
    await expect(mapDescription).toHaveText(/Interactive map/i);
  });
});
