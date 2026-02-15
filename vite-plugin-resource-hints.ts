import type { Plugin } from "vite";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

/**
 * Vite plugin to inject resource hints (preload/prefetch) for critical assets
 * This improves performance by hinting the browser about important resources
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
        const htmlContent = readFileSync(htmlPath, "utf-8");

        // Find the main entry script in the HTML
        const scriptMatch = htmlContent.match(/<script[^>]+src=["']([^"']+\.js)["'][^>]*>/);
        
        if (scriptMatch) {
          const scriptSrc = scriptMatch[1];
          // Remove base URL prefix if present
          const scriptPath = scriptSrc.startsWith(baseUrl) 
            ? scriptSrc.slice(baseUrl.length).replace(/^\//, "")
            : scriptSrc.replace(/^\//, "");

          // Create preload link for the main entry script
          const preloadLink = `    <link rel="modulepreload" href="${scriptSrc}" />`;

          // Insert preload hint right before the script tag
          const updatedHtml = htmlContent.replace(
            scriptMatch[0],
            `${preloadLink}\n${scriptMatch[0]}`
          );

          writeFileSync(htmlPath, updatedHtml, "utf-8");
          console.log(
            `[vite-plugin-resource-hints] ✓ Added modulepreload hint for main bundle`
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
