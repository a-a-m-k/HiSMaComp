import { test, expect } from "@playwright/test";

const BASE_URL = "http://localhost:5173";

test.describe("Error Boundary", () => {
  test("should display error UI when component throws an error", async ({
    page,
  }) => {
    await page.goto(`${BASE_URL}?testError=true`);

    const errorHeading = page.getByText("Something went wrong");
    await expect(errorHeading).toBeVisible({ timeout: 10000 });

    const errorAlert = page.getByRole("alert");
    await expect(errorAlert).toBeVisible();
    await expect(errorAlert).toContainText(
      /Test error for ErrorBoundary|Something went wrong/i
    );
  });

  test("should show Try Again and Reload Page buttons when error occurs", async ({
    page,
  }) => {
    await page.goto(`${BASE_URL}?testError=true`);

    const tryAgainBtn = page.getByRole("button", { name: /try again/i });
    const reloadBtn = page.getByRole("button", { name: /reload page/i });

    await expect(tryAgainBtn).toBeVisible({ timeout: 5000 });
    await expect(reloadBtn).toBeVisible();
  });

  test("should handle Try Again button click to reset error state", async ({
    page,
  }) => {
    await page.goto(`${BASE_URL}?testError=true`);

    const errorHeading = page.getByText("Something went wrong");
    await expect(errorHeading).toBeVisible({ timeout: 5000 });

    const tryAgainBtn = page.getByRole("button", { name: /try again/i });
    await tryAgainBtn.click();
    await expect(page.getByRole("alert")).toBeHidden({ timeout: 5000 });
  });

  test("should handle Reload Page button click", async ({ page }) => {
    await page.goto(`${BASE_URL}?testError=true`);

    const errorHeading = page.getByText("Something went wrong");
    await expect(errorHeading).toBeVisible({ timeout: 5000 });

    const reloadBtn = page.getByRole("button", { name: /reload page/i });
    await expect(reloadBtn).toBeVisible();
    await reloadBtn.click();
    await expect(page.getByRole("alert")).toBeVisible({ timeout: 5000 });
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
    await expect(page.getByRole("alert")).toBeVisible({ timeout: 5000 });
    expect(consoleMessages.length).toBeGreaterThan(0);
    expect(
      consoleErrors.some(
        msg =>
          msg.includes("Error Boundary caught an error") ||
          msg.includes("Test error for ErrorBoundary")
      )
    ).toBe(true);
  });

  test("should display error details in development mode when error occurs", async ({
    page,
  }) => {
    await page.goto(`${BASE_URL}?testError=true`);
    await expect(page.getByText("Something went wrong")).toBeVisible({
      timeout: 5000,
    });

    const errorPre = page.locator("pre");
    const preCount = await errorPre.count();

    if (preCount > 0) {
      const preVisible = await errorPre.first().isVisible();
      expect(preVisible).toBe(true);

      const errorText = await errorPre.first().textContent();
      expect(errorText).toContain("Test error for ErrorBoundary");
    }
  });

  test("should show development mode console hint when error occurs", async ({
    page,
  }) => {
    await page.goto(`${BASE_URL}?testError=true`);
    await expect(page.getByText("Something went wrong")).toBeVisible({
      timeout: 5000,
    });

    const consoleHint = page.getByText(/Check the console|F12/i);
    await expect(consoleHint).toBeVisible({ timeout: 5000 });
  });

  test("should render app normally when no error occurs", async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForSelector(".maplibregl-canvas", { timeout: 10000 });
    await expect(page.locator(".maplibregl-canvas").first()).toBeVisible();

    const errorHeading = page.getByText("Something went wrong");
    const errorVisible = await errorHeading.isVisible().catch(() => false);
    expect(errorVisible).toBeFalsy();
  });
});
