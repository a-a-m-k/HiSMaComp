import type { Plugin } from "vite";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

/**
 * Vite plugin to inject resource hints (preload/prefetch) for critical assets
 * This improves performance by hinting the browser about important resources
 *
 * Preloads:
 * - Main entry script (modulepreload)
 */
export function vitePluginResourceHints(): Plugin {
  let outputDir = "";

  return {
    name: "vite-plugin-resource-hints",
    enforce: "post",
    apply: "build",
    configResolved(config) {
      outputDir = join(process.cwd(), config.build.outDir || "dist");
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
              !s.src.includes("react-map") &&
              !s.src.includes("sentry")
          ) || scripts[0];

        const preloadLinks: string[] = [];
        const hasPreloadFor = (src: string) =>
          htmlContent.includes(`rel="modulepreload" href="${src}"`) ||
          htmlContent.includes(
            `rel="modulepreload" crossorigin href="${src}"`
          ) ||
          htmlContent.includes(
            `rel="modulepreload" crossorigin="" href="${src}"`
          );

        // Preload main entry script
        if (mainScript && !hasPreloadFor(mainScript.src)) {
          preloadLinks.push(
            `    <link rel="modulepreload" href="${mainScript.src}" />`
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

          console.log(
            `[vite-plugin-resource-hints] ✓ Added modulepreload hints for: main bundle`
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
