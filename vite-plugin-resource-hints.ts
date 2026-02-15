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

        // Find MapLibre GL bundle (critical for LCP, largest chunk)
        const maplibreScript = scripts.find(s =>
          s.src.toLowerCase().includes("maplibre")
        );

        // Find vendor bundle (Material-UI + React, also large)
        const vendorScript = scripts.find(s =>
          s.src.toLowerCase().includes("vendor")
        );

        // Since MapLibre and vendor chunks are dynamically imported,
        // they won't be in the HTML. We need to scan the assets directory
        const assetsDir = join(outputDir, "assets");
        let maplibreAsset: string | null = null;
        let vendorAsset: string | null = null;

        try {
          const assets = readdirSync(assetsDir);

          // Find MapLibre chunk by filename pattern
          const maplibreFile = assets.find(
            file =>
              file.toLowerCase().includes("maplibre") && file.endsWith(".js")
          );
          if (maplibreFile) {
            maplibreAsset = `${baseUrl}assets/${maplibreFile}`;
          }

          // Find vendor chunk by filename pattern
          const vendorFile = assets.find(
            file =>
              file.toLowerCase().includes("vendor") && file.endsWith(".js")
          );
          if (vendorFile) {
            vendorAsset = `${baseUrl}assets/${vendorFile}`;
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

        // Preload MapLibre GL bundle (critical for LCP on mobile)
        // This is the largest chunk (~247KB gzipped) and is needed for map rendering
        // Check both HTML scripts and assets directory
        const maplibreSrc = maplibreScript?.src || maplibreAsset;
        if (maplibreSrc) {
          preloadLinks.push(
            `    <link rel="modulepreload" href="${maplibreSrc}" />`
          );
        }

        // Preload vendor bundle if it exists (Material-UI + React)
        // This helps with faster initial render
        // Check both HTML scripts and assets directory
        const vendorSrc = vendorScript?.src || vendorAsset;
        if (vendorSrc) {
          preloadLinks.push(
            `    <link rel="modulepreload" href="${vendorSrc}" />`
          );
        }

        if (preloadLinks.length > 0) {
          // Insert preload hints right before the first script tag
          const firstScript = scripts[0];
          const updatedHtml = htmlContent.replace(
            firstScript.match,
            `${preloadLinks.join("\n")}\n${firstScript.match}`
          );

          writeFileSync(htmlPath, updatedHtml, "utf-8");

          const preloadedChunks = [];
          if (mainScript) preloadedChunks.push("main bundle");
          if (maplibreSrc) preloadedChunks.push("MapLibre GL");
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
