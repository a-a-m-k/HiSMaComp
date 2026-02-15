import type { Plugin } from "vite";
import { readFileSync, writeFileSync, readdirSync } from "fs";
import { join } from "path";

/**
 * Vite plugin to inject resource hints (preload/prefetch) for critical assets
 * This improves performance by hinting the browser about important resources
 *
 * Preloads:
 * - Main entry script (modulepreload)
 * - MapLibre GL bundle (modulepreload) - largest chunk, critical for LCP
 * - Vendor bundle (modulepreload) - if large enough
 */
export function vitePluginResourceHints(): Plugin {
  let distDir = "";
  let outputDir = "";
  let baseUrl = "/";

  return {
    name: "vite-plugin-resource-hints",
    enforce: "post",
    apply: "build",
    configResolved(config) {
      distDir = config.build.outDir || "dist";
      outputDir = join(process.cwd(), distDir);
      baseUrl = config.base || "/";
    },
    async closeBundle() {
      try {
        const htmlPath = join(outputDir, "index.html");
        let htmlContent = readFileSync(htmlPath, "utf-8");

        // Find all script tags in the HTML
        const scriptMatches = htmlContent.matchAll(
          /<script[^>]+src=["']([^"']+\.js)["'][^>]*>/g
        );

        const scripts: Array<{ src: string; match: string }> = [];
        for (const match of scriptMatches) {
          scripts.push({ src: match[1], match: match[0] });
        }

        if (scripts.length === 0) {
          console.warn(
            `[vite-plugin-resource-hints] ⚠ No scripts found in HTML`
          );
          return;
        }

        // Find main entry script (usually the first one or the one without chunk name)
        const mainScript =
          scripts.find(
            s =>
              !s.src.includes("maplibre") &&
              !s.src.includes("vendor") &&
              !s.src.includes("react-map")
          ) || scripts[0];

        // MapLibre GL is now loaded from CDN, so we don't need to preload it
        // Find vendor bundle (Material-UI + React, also large)
        const vendorScript = scripts.find(s =>
          s.src.toLowerCase().includes("vendor")
        );

        // Since vendor chunks are dynamically imported,
        // they won't be in the HTML. We need to scan the assets directory
        const assetsDir = join(outputDir, "assets");
        let vendorAsset: string | null = null;
        let screenshotButtonAsset: string | null = null;

        try {
          const assets = readdirSync(assetsDir);

          // Find vendor chunk by filename pattern
          const vendorFile = assets.find(
            file =>
              file.toLowerCase().includes("vendor") && file.endsWith(".js")
          );
          if (vendorFile) {
            vendorAsset = `${baseUrl}assets/${vendorFile}`;
          }

          // ScreenshotButton is lazy-loaded; preload to avoid dynamic import 404s
          const screenshotFile = assets.find(
            file =>
              file.toLowerCase().includes("screenshotbutton") &&
              file.endsWith(".js")
          );
          if (screenshotFile) {
            screenshotButtonAsset = `${baseUrl}assets/${screenshotFile}`;
          }
        } catch (error) {
          // Assets directory might not exist or be readable
          console.warn(
            `[vite-plugin-resource-hints] ⚠ Could not scan assets directory:`,
            error
          );
        }

        const preloadLinks: string[] = [];

        // Preload main entry script
        if (mainScript) {
          preloadLinks.push(
            `    <link rel="modulepreload" href="${mainScript.src}" />`
          );
        }

        // Preload vendor bundle if it exists (Material-UI + React)
        const vendorSrc = vendorScript?.src || vendorAsset;
        if (vendorSrc) {
          preloadLinks.push(
            `    <link rel="modulepreload" href="${vendorSrc}" />`
          );
        }

        // Preload ScreenshotButton (lazy chunk) - ensures correct path resolution
        if (screenshotButtonAsset) {
          preloadLinks.push(
            `    <link rel="modulepreload" href="${screenshotButtonAsset}" />`
          );
        }

        if (preloadLinks.length > 0) {
          // Insert preload hints right before the first script tag
          const firstScript = scripts[0];
          let updatedHtml = htmlContent.replace(
            firstScript.match,
            `${preloadLinks.join("\n")}\n${firstScript.match}`
          );

          writeFileSync(htmlPath, updatedHtml, "utf-8");

          const preloadedChunks = [];
          if (mainScript) preloadedChunks.push("main bundle");
          if (vendorSrc) preloadedChunks.push("vendor bundle");

          console.log(
            `[vite-plugin-resource-hints] ✓ Added modulepreload hints for: ${preloadedChunks.join(", ")}`
          );
        }
      } catch (error) {
        console.warn(
          `[vite-plugin-resource-hints] ⚠ Could not inject resource hints:`,
          error
        );
      }
    },
  };
}
