import type { Plugin } from "vite";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

/**
 * Vite plugin to fix absolute paths in built HTML for GitHub Pages deployment
 * Ensures all asset references include the base path
 */
export function vitePluginFixPaths(): Plugin {
  let outputDir = "";
  let baseUrl = "/";

  return {
    name: "vite-plugin-fix-paths",
    enforce: "post",
    apply: "build",
    configResolved(config) {
      outputDir = join(process.cwd(), config.build.outDir || "dist");
      baseUrl = config.base || "/";
    },
    async closeBundle() {
      try {
        const htmlPath = join(outputDir, "index.html");
        let htmlContent = readFileSync(htmlPath, "utf-8");

        // Only fix paths if baseUrl is not root
        if (baseUrl !== "/") {
          const basePath = baseUrl.replace(/\/$/, ""); // Remove trailing slash
          const basePathNoSlash = basePath.replace(/^\//, ""); // Remove leading slash for comparison

          // Comprehensive fix for all absolute paths
          // This regex matches href="/path" or src="/path" that don't already have the base path
          htmlContent = htmlContent.replace(
            /(href|src)=["'](\/[^"']+)["']/g,
            (match, attr, path) => {
              // Skip external URLs
              if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("//")) {
                return match;
              }
              // Skip data URIs and blob URIs
              if (path.startsWith("data:") || path.startsWith("blob:")) {
                return match;
              }
              // Skip if path already includes base path
              if (path.startsWith(basePath + "/") || path === basePath) {
                return match;
              }
              // Skip if it's the base path itself (to avoid /HiSMaComp/HiSMaComp/)
              if (path === "/" + basePathNoSlash) {
                return match;
              }
              // Add base path (remove leading slash from path to avoid double slashes)
              const cleanPath = path.replace(/^\//, "");
              return `${attr}="${basePath}/${cleanPath}"`;
            }
          );

          writeFileSync(htmlPath, htmlContent, "utf-8");
          console.log(
            `[vite-plugin-fix-paths] ✓ Fixed absolute paths in HTML for base: ${baseUrl}`
          );
        }
      } catch (error) {
        console.warn(`[vite-plugin-fix-paths] ⚠ Could not fix paths:`, error);
      }
    },
  };
}
