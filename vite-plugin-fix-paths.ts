import type { Plugin } from "vite";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

/**
 * Vite plugin to fix absolute paths in built HTML for GitHub Pages deployment
 * Ensures all asset references include the base path
 * 
 * This plugin runs in writeBundle (after all other plugins) to ensure
 * paths are fixed in the final HTML output.
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
      // CRITICAL: This runs AFTER all closeBundle hooks
      // Fix paths and add base tag in the final HTML
      try {
        const htmlPath = join(outputDir, "index.html");
        if (!existsSync(htmlPath)) {
          console.warn(`[vite-plugin-fix-paths] ⚠ HTML file not found: ${htmlPath}`);
          return;
        }
        
        let htmlContent = readFileSync(htmlPath, "utf-8");
        const originalContent = htmlContent;

        if (baseUrl !== "/") {
          const basePath = baseUrl.replace(/\/$/, ""); // Remove trailing slash
          
          // Step 1: Fix or add <base> tag (critical CSS plugin might have set it to "/")
          const baseTagRegex = /<base\s+[^>]*href=["']([^"']+)["'][^>]*>/i;
          if (baseTagRegex.test(htmlContent)) {
            // Replace existing base tag with correct one
            htmlContent = htmlContent.replace(
              baseTagRegex,
              `<base href="${baseUrl}">`
            );
            console.log(`[vite-plugin-fix-paths] ✓ Fixed <base> tag to href="${baseUrl}"`);
          } else {
            // Add base tag if it doesn't exist
            htmlContent = htmlContent.replace(
              /<head>/i,
              `<head>\n    <base href="${baseUrl}">`
            );
            console.log(`[vite-plugin-fix-paths] ✓ Added <base> tag with href="${baseUrl}"`);
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
              console.log(`[vite-plugin-fix-paths] Fixed: ${path} -> ${newPath}`);
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
              console.log(`[vite-plugin-fix-paths] Fixed: ${path} -> ${newPath}`);
              return `${attr}="${newPath}"`;
            }
          );
        }

        if (htmlContent !== originalContent) {
          writeFileSync(htmlPath, htmlContent, "utf-8");
          console.log(`[vite-plugin-fix-paths] ✓ Fixed HTML for base: ${baseUrl}`);
        } else {
          console.log(`[vite-plugin-fix-paths] ℹ No changes needed`);
        }
      } catch (error) {
        console.error(`[vite-plugin-fix-paths] ✗ Error:`, error);
      }
    },
  };
}
