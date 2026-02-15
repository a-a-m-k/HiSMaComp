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
          
          // Fix absolute paths that don't start with baseUrl
          // Pattern: href="/path" or src="/path" that should be href="/HiSMaComp/path"
          const absolutePathRegex = /(href|src)=["']\/(?!HiSMaComp\/)([^"']+)["']/g;
          
          htmlContent = htmlContent.replace(absolutePathRegex, (match, attr, path) => {
            // Skip if it's already correct or is an external URL
            if (path.startsWith("http") || path.startsWith("//")) {
              return match;
            }
            // Skip if it's a data URI or special protocol
            if (path.startsWith("data:") || path.startsWith("blob:")) {
              return match;
            }
            // Skip if path already includes base path
            if (path.startsWith(basePath.replace(/^\//, ""))) {
              return match;
            }
            // Add base path (remove leading slash from path to avoid double slashes)
            const cleanPath = path.replace(/^\//, "");
            return `${attr}="${basePath}/${cleanPath}"`;
          });

          writeFileSync(htmlPath, htmlContent, "utf-8");
          console.log(
            `[vite-plugin-fix-paths] ✓ Fixed absolute paths in HTML for base: ${baseUrl}`
          );
        }
      } catch (error) {
        console.warn(
          `[vite-plugin-fix-paths] ⚠ Could not fix paths:`,
          error
        );
      }
    },
  };
}
