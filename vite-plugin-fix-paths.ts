import type { Plugin } from "vite";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

/**
 * Vite plugin to fix absolute paths in built HTML for GitHub Pages deployment
 * Ensures all asset references include the base path
 * 
 * This plugin uses writeBundle hook which runs AFTER all other plugins including
 * closeBundle hooks, ensuring it's the absolute last thing to run.
 */
export function vitePluginFixPaths(): Plugin {
  let outputDir = "";
  let baseUrl = "/";

  return {
    name: "vite-plugin-fix-paths",
    enforce: "post", // Run after other plugins
    apply: "build",
    configResolved(config) {
      outputDir = join(process.cwd(), config.build.outDir || "dist");
      baseUrl = config.base || "/";
    },
    writeBundle() {
      // This hook runs AFTER all closeBundle hooks, ensuring we're last
      try {
        const htmlPath = join(outputDir, "index.html");
        if (!existsSync(htmlPath)) {
          console.warn(`[vite-plugin-fix-paths] ⚠ HTML file not found: ${htmlPath}`);
          return;
        }
        
        let htmlContent = readFileSync(htmlPath, "utf-8");
        const originalContent = htmlContent;

        // Only fix paths if baseUrl is not root
        if (baseUrl !== "/") {
          const basePath = baseUrl.replace(/\/$/, ""); // Remove trailing slash
          const basePathNoSlash = basePath.replace(/^\//, ""); // Remove leading slash for comparison

          // Fix ALL absolute paths that don't already have the base path
          // This regex matches: href="/path" or src="/path"
          htmlContent = htmlContent.replace(
            /(href|src)=["'](\/[^"']+)["']/g,
            (match, attr, path) => {
              // Skip external URLs (http, https, //)
              if (/^https?:\/\//.test(path) || path.startsWith("//")) {
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
              if (path === "/" + basePathNoSlash || path === "/" + basePathNoSlash + "/") {
                return match;
              }
              // Add base path (remove leading slash from path to avoid double slashes)
              const cleanPath = path.replace(/^\//, "");
              const newPath = `${basePath}/${cleanPath}`;
              console.log(`[vite-plugin-fix-paths] Fixing: ${path} -> ${newPath}`);
              return `${attr}="${newPath}"`;
            }
          );

          if (htmlContent !== originalContent) {
            writeFileSync(htmlPath, htmlContent, "utf-8");
            console.log(
              `[vite-plugin-fix-paths] ✓ Fixed absolute paths in HTML for base: ${baseUrl}`
            );
          } else {
            console.log(
              `[vite-plugin-fix-paths] ℹ No paths needed fixing (base: ${baseUrl})`
            );
          }
        }
      } catch (error) {
        console.error(`[vite-plugin-fix-paths] ✗ Error fixing paths:`, error);
        // Don't fail the build, but log the error
      }
    },
  };
}
