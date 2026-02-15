import type { Plugin } from "vite";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

/**
 * Vite plugin to fix absolute paths in built HTML for GitHub Pages deployment
 * Ensures all asset references include the base path
 * 
 * This plugin runs in closeBundle AFTER all other plugins to ensure
 * it fixes paths that may have been modified by other plugins (like critical CSS)
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
    transformIndexHtml(html) {
      // Fix paths during HTML transformation (runs before closeBundle)
      if (baseUrl !== "/") {
        const basePath = baseUrl.replace(/\/$/, "");
        const basePathNoSlash = basePath.replace(/^\//, "");

        // Fix absolute paths in HTML
        html = html.replace(
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
            // Skip base path itself
            if (path === "/" + basePathNoSlash || path === "/" + basePathNoSlash + "/") {
              return match;
            }
            const cleanPath = path.replace(/^\//, "");
            return `${attr}="${basePath}/${cleanPath}"`;
          }
        );
      }
      return html;
    },
    async closeBundle() {
      try {
        const htmlPath = join(outputDir, "index.html");
        if (!htmlPath || !require("fs").existsSync(htmlPath)) {
          console.warn(`[vite-plugin-fix-paths] ⚠ HTML file not found: ${htmlPath}`);
          return;
        }
        
        let htmlContent = readFileSync(htmlPath, "utf-8");
        const originalContent = htmlContent;

        // Only fix paths if baseUrl is not root
        if (baseUrl !== "/") {
          const basePath = baseUrl.replace(/\/$/, ""); // Remove trailing slash
          const basePathNoSlash = basePath.replace(/^\//, ""); // Remove leading slash for comparison

          // Comprehensive fix for all absolute paths
          // Match: href="/path" or src="/path" 
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

          // Also fix any paths in link tags that might have been missed
          // This catches cases like: <link rel="icon" href="/favicon.ico">
          htmlContent = htmlContent.replace(
            /<link([^>]*)\s+(href|src)=["'](\/[^"']+)["']([^>]*)>/gi,
            (match, before, attr, path, after) => {
              // Skip external URLs
              if (/^https?:\/\//.test(path) || path.startsWith("//")) {
                return match;
              }
              // Skip data URIs
              if (path.startsWith("data:") || path.startsWith("blob:")) {
                return match;
              }
              // Skip if already has base path
              if (path.startsWith(basePath + "/") || path === basePath) {
                return match;
              }
              const cleanPath = path.replace(/^\//, "");
              const newPath = `${basePath}/${cleanPath}`;
              return `<link${before} ${attr}="${newPath}"${after}>`;
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
