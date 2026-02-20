#!/usr/bin/env node
/**
 * Checks that the production bundle stays within size budgets.
 * Fails the build (exit 1) if any limit is exceeded.
 * Run after: npm run build
 *
 * Budgets are in KiB (gzip sizes from build output).
 * Adjust BUDGETS as the app grows.
 */
import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import { gzipSync } from "zlib";

const distDir = join(process.cwd(), "dist");
const assetsDir = join(distDir, "assets");

const BUDGETS = {
  totalJs: 1100, // ~1100 KiB gzip total JS (maplibre + vendor + index + towns)
  maplibre: 260,
  vendor: 150,
  index: 30,
  towns: 120, // async chunk from useTownsData dynamic import
};

function getGzipSizeKiB(filePath) {
  const content = readFileSync(filePath);
  const gzip = gzipSync(content);
  return gzip.length / 1024;
}

function main() {
  let failed = false;

  if (!readdirSync(distDir, { withFileTypes: true }).some(d => d.name === "assets")) {
    console.error("[check-bundle-size] dist/assets not found. Run npm run build first.");
    process.exit(1);
  }

  const files = readdirSync(assetsDir).filter(f => f.endsWith(".js"));
  const byName = {};
  let totalJs = 0;

  for (const file of files) {
    const path = join(assetsDir, file);
    let sizeKiB = 0;
    try {
      sizeKiB = getGzipSizeKiB(path);
    } catch (error) {
      console.error(`[check-bundle-size] Failed to read gzip size for ${file}:`, error);
      failed = true;
      continue;
    }

    totalJs += sizeKiB;
    if (file.includes("maplibre")) byName.maplibre = (byName.maplibre || 0) + sizeKiB;
    else if (file.includes("vendor")) byName.vendor = (byName.vendor || 0) + sizeKiB;
    else if (file.includes("index-")) byName.index = (byName.index || 0) + sizeKiB;
    else if (file.includes("towns")) byName.towns = (byName.towns || 0) + sizeKiB;
  }

  if (totalJs > BUDGETS.totalJs) {
    console.error(
      `[check-bundle-size] Total JS gzip estimate ${totalJs.toFixed(0)} KiB exceeds budget ${BUDGETS.totalJs} KiB`
    );
    failed = true;
  }
  if ((byName.maplibre || 0) > BUDGETS.maplibre) {
    console.error(
      `[check-bundle-size] maplibre chunk ${(byName.maplibre || 0).toFixed(0)} KiB exceeds budget ${BUDGETS.maplibre} KiB`
    );
    failed = true;
  }
  if ((byName.vendor || 0) > BUDGETS.vendor) {
    console.error(
      `[check-bundle-size] vendor chunk ${(byName.vendor || 0).toFixed(0)} KiB exceeds budget ${BUDGETS.vendor} KiB`
    );
    failed = true;
  }
  if ((byName.index || 0) > BUDGETS.index) {
    console.error(
      `[check-bundle-size] index chunk ${(byName.index || 0).toFixed(0)} KiB exceeds budget ${BUDGETS.index} KiB`
    );
    failed = true;
  }
  if ((byName.towns || 0) > BUDGETS.towns) {
    console.error(
      `[check-bundle-size] towns chunk ${(byName.towns || 0).toFixed(0)} KiB exceeds budget ${BUDGETS.towns} KiB`
    );
    failed = true;
  }

  if (!failed) {
    console.log(
      "[check-bundle-size] ✓ Bundle within budgets (total ~%s KiB)",
      totalJs.toFixed(0)
    );
  }
  process.exit(failed ? 1 : 0);
}

main();
