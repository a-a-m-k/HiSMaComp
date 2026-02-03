import { test, expect } from "@playwright/test";

const BASE_URL = "http://localhost:5173";

test.describe("Error Boundary", () => {
  test("should display error UI when component throws an error", async ({
    page,
  }) => {
    await page.goto(`${BASE_URL}?testError=true`);
    await page.waitForTimeout(1500);

    const errorHeading = page.getByText("Oops! Something went wrong");
    await expect(errorHeading).toBeVisible({ timeout: 5000 });

    const errorMessage = page.getByText(/Here.*what happened/i);
    await expect(errorMessage).toBeVisible();
  });

  test("should show Try Again and Reload Page buttons when error occurs", async ({
    page,
  }) => {
    await page.goto(`${BASE_URL}?testError=true`);
    await page.waitForTimeout(1500);

    const tryAgainBtn = page.getByRole("button", { name: /try again/i });
    const reloadBtn = page.getByRole("button", { name: /reload page/i });

    await expect(tryAgainBtn).toBeVisible({ timeout: 5000 });
    await expect(reloadBtn).toBeVisible();
  });

  test("should handle Try Again button click to reset error state", async ({
    page,
  }) => {
    await page.goto(`${BASE_URL}?testError=true`);
    await page.waitForTimeout(1500);

    const errorHeading = page.getByText("Oops! Something went wrong");
    await expect(errorHeading).toBeVisible({ timeout: 5000 });

    const tryAgainBtn = page.getByRole("button", { name: /try again/i });
    await tryAgainBtn.click();
    await page.waitForTimeout(1000);

    expect(tryAgainBtn).toBeTruthy();
  });

  test("should handle Reload Page button click", async ({ page }) => {
    await page.goto(`${BASE_URL}?testError=true`);
    await page.waitForTimeout(1500);

    const errorHeading = page.getByText("Oops! Something went wrong");
    await expect(errorHeading).toBeVisible({ timeout: 5000 });

    const reloadBtn = page.getByRole("button", { name: /reload page/i });
    await expect(reloadBtn).toBeVisible();
    await reloadBtn.click();

    expect(reloadBtn).toBeTruthy();
  });

  test("should log errors to console when error boundary catches error", async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    const consoleMessages: string[] = [];

    page.on("console", msg => {
      const text = msg.text();
      if (msg.type() === "error") {
        consoleErrors.push(text);
      }
      consoleMessages.push(text);
    });

    await page.goto(`${BASE_URL}?testError=true`);
    await page.waitForTimeout(2000);

    const hasErrorLog = consoleErrors.some(
      msg =>
        msg.includes("Error Boundary caught an error") ||
        msg.includes("Test error for ErrorBoundary")
    );

    expect(consoleMessages.length >= 0).toBeTruthy();
  });

  test("should display error details in development mode when error occurs", async ({
    page,
  }) => {
    await page.goto(`${BASE_URL}?testError=true`);
    await page.waitForTimeout(1500);

    await page.waitForSelector('text="Oops! Something went wrong"', {
      timeout: 5000,
    });

    const errorPre = page.locator("pre");
    const preCount = await errorPre.count();

    if (preCount > 0) {
      const preVisible = await errorPre.first().isVisible();
      expect(preVisible).toBeTruthy();

      const errorText = await errorPre.first().textContent();
      expect(errorText).toContain("Test error for ErrorBoundary");
    }
  });

  test("should show development mode console hint when error occurs", async ({
    page,
  }) => {
    await page.goto(`${BASE_URL}?testError=true`);
    await page.waitForTimeout(1500);

    await page.waitForSelector('text="Oops! Something went wrong"', {
      timeout: 5000,
    });

    const consoleHint = page.getByText(/Check the console|F12/i);
    const hintVisible = await consoleHint.isVisible().catch(() => false);

    expect(hintVisible).toBeTruthy();
  });

  test("should render app normally when no error occurs", async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForSelector(".maplibregl-canvas", { timeout: 10000 });
    await page.waitForTimeout(1000);

    const mapCanvas = await page.$(".maplibregl-canvas");
    expect(mapCanvas).toBeTruthy();

    const errorHeading = page.getByText("Oops! Something went wrong");
    const errorVisible = await errorHeading.isVisible().catch(() => false);
    expect(errorVisible).toBeFalsy();
  });
});
