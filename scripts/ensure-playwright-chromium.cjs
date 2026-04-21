#!/usr/bin/env node
const { existsSync } = require("fs");
const { execSync } = require("child_process");

function main() {
  let chromiumPath = "";
  try {
    const { chromium } = require("@playwright/test");
    chromiumPath = chromium.executablePath();
  } catch (error) {
    console.warn(
      "[ensure-playwright] Could not resolve @playwright/test executable path:",
      error
    );
    return;
  }

  if (chromiumPath && existsSync(chromiumPath)) {
    console.log("[ensure-playwright] Chromium already installed.");
    return;
  }

  console.log(
    "[ensure-playwright] Chromium missing. Installing Playwright browser..."
  );
  execSync("npx playwright install chromium", { stdio: "inherit" });
}

main();
