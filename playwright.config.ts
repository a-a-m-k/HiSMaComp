import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright Test Configuration
 *
 * Configures E2E and visual regression testing for the HiSMaComp application.
 * Test results and screenshots are organized in the tests/results directory.
 */
export default defineConfig({
  // Test directory
  testDir: "./tests/e2e",

  // Maximum time one test can run
  timeout: 60 * 1000,

  // Run tests in files in parallel
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Opt out of parallel tests on CI
  workers: process.env.CI ? 1 : undefined,

  // Reporter to use
  reporter: [
    ["html", { outputFolder: "tests/results/reports/html" }],
    ["json", { outputFile: "tests/results/reports/results.json" }],
    ["list"],
  ],

  // Shared settings for all projects
  use: {
    // Base URL for tests
    baseURL: "http://localhost:5173",

    // Collect trace on failure
    trace: "on-first-retry",

    // Screenshot on failure
    screenshot: "only-on-failure",

    // Video on failure
    video: "retain-on-failure",
  },

  // Output folder for test artifacts
  outputDir: "tests/results/e2e-artifacts",

  // Configure projects for major browsers
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  // Run local dev server before starting the tests (reuse if already running, e.g. npm run dev)
  webServer: {
    command: "npm run dev",
    url: "http://localhost:5173",
    reuseExistingServer: true,
    timeout: 120 * 1000,
  },
});
