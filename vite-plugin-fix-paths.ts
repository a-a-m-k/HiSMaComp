import type { Plugin } from "vite";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

/**
 * Vite plugin to fix absolute paths in built HTML for GitHub Pages deployment
 * Ensures all asset references include the base path
 * 
 * This plugin runs in both closeBundle and writeBundle to ensure
 * paths are fixed in the final HTML output, regardless of plugin execution order.
 */
export function vitePluginFixPaths(): Plugin {
  let outputDir = "";
  let baseUrl = "/";

  // Shared function to fix HTML
  const fixHtml = (hookName: string) => {
    try {
      const htmlPath = join(outputDir, "index.html");
      if (!existsSync(htmlPath)) {
        if (hookName === "writeBundle") {
          // Only warn in writeBundle, closeBundle might run before HTML exists
          console.warn(`[vite-plugin-fix-paths] ⚠ HTML file not found: ${htmlPath}`);
        }
        return;
      }
      
      let htmlContent = readFileSync(htmlPath, "utf-8");
      const originalContent = htmlContent;

      if (baseUrl !== "/") {
        const basePath = baseUrl.replace(/\/$/, ""); // Remove trailing slash
        
        // Step 1: REMOVE <base> tag entirely - we use absolute paths instead
        // The base tag can cause issues when combined with absolute paths
        // Since we're fixing all paths to be absolute with base prefix, we don't need base tag
        if (htmlContent.includes('<base')) {
          htmlContent = htmlContent.replace(
            /<base\s+[^>]*>/i,
            ''
          );
          console.log(`[vite-plugin-fix-paths] [${hookName}] ✓ Removed <base> tag (using absolute paths instead)`);
        }

        // Step 2: Fix specific known paths first (more reliable)
        const pathsToFix = [
          '/favicon.ico',
          '/favicon-16x16.png',
          '/favicon-32x32.png',
          '/apple-touch-icon.png',
          '/manifest.json',
        ];

        pathsToFix.forEach(path => {
          // Match both href and src attributes
          const regex = new RegExp(`(href|src)=["']${path.replace(/\//g, '\\/')}["']`, 'gi');
          if (regex.test(htmlContent)) {
            const newPath = `${basePath}${path}`;
            htmlContent = htmlContent.replace(regex, `$1="${newPath}"`);
            console.log(`[vite-plugin-fix-paths] [${hookName}] Fixed: ${path} -> ${newPath}`);
          }
        });

        // Step 3: Fix any remaining absolute paths (catch-all)
        htmlContent = htmlContent.replace(
          /(href|src)=["'](\/[^"']+)["']/g,
          (match, attr, path) => {
            // Skip external URLs
            if (/^https?:\/\//.test(path) || path.startsWith("//")) {
              return match;
            }
            // Skip data URIs and blob URIs
            if (path.startsWith("data:") || path.startsWith("blob:")) {
              return match;
            }
            // Skip if already has base path
            if (path.startsWith(basePath + "/") || path === basePath) {
              return match;
            }
            // Fix the path
            const newPath = `${basePath}${path}`;
            console.log(`[vite-plugin-fix-paths] [${hookName}] Fixed: ${path} -> ${newPath}`);
            return `${attr}="${newPath}"`;
          }
        );
      }

      if (htmlContent !== originalContent) {
        writeFileSync(htmlPath, htmlContent, "utf-8");
        console.log(`[vite-plugin-fix-paths] [${hookName}] ✓ Fixed HTML for base: ${baseUrl}`);
      }
    } catch (error) {
      console.error(`[vite-plugin-fix-paths] [${hookName}] ✗ Error:`, error);
    }
  };

  return {
    name: "vite-plugin-fix-paths",
    enforce: "post", // Run after other plugins
    apply: "build",
    configResolved(config) {
      outputDir = join(process.cwd(), config.build.outDir || "dist");
      baseUrl = config.base || "/";
    },
    closeBundle() {
      // Run in closeBundle (after critical CSS plugin)
      fixHtml("closeBundle");
    },
    writeBundle() {
      // Also run in writeBundle as final safety net (runs after closeBundle)
      fixHtml("writeBundle");
    },
  };
}
