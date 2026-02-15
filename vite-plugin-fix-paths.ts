import type { Plugin, IndexHtmlTransformResult } from "vite";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

/**
 * Vite plugin to fix absolute paths in built HTML for GitHub Pages deployment
 * Ensures all asset references include the base path
 * 
 * Uses both transformIndexHtml (early) and writeBundle (late) to ensure paths are fixed
 * regardless of when other plugins modify the HTML.
 */
export function vitePluginFixPaths(): Plugin {
  let outputDir = "";
  let baseUrl = "/";

  const fixPathsInHtml = (html: string): string => {
    if (baseUrl === "/") {
      return html;
    }

    const basePath = baseUrl.replace(/\/$/, ""); // Remove trailing slash
    const basePathNoSlash = basePath.replace(/^\//, ""); // Remove leading slash

    // Fix ALL absolute paths that don't already have the base path
    // With <base> tag, we can use absolute paths with base prefix OR relative paths
    // We'll use absolute paths with base prefix for better compatibility
    return html.replace(
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
        // Skip if it's the base path itself
        if (path === "/" + basePathNoSlash || path === "/" + basePathNoSlash + "/") {
          return match;
        }
        // Add base path
        const cleanPath = path.replace(/^\//, "");
        const newPath = `${basePath}/${cleanPath}`;
        console.log(`[vite-plugin-fix-paths] Fixing: ${path} -> ${newPath}`);
        return `${attr}="${newPath}"`;
      }
    );
  };

  return {
    name: "vite-plugin-fix-paths",
    enforce: "post", // Run after other plugins
    apply: "build",
    configResolved(config) {
      outputDir = join(process.cwd(), config.build.outDir || "dist");
      baseUrl = config.base || "/";
    },
    transformIndexHtml(html): IndexHtmlTransformResult {
      // Add <base> tag for GitHub Pages deployment
      // With <base> tag, absolute paths like /favicon.ico will resolve relative to base
      // So /favicon.ico with base="/HiSMaComp/" becomes /HiSMaComp/favicon.ico
      if (baseUrl !== "/") {
        // Check if base tag already exists
        if (!html.includes('<base')) {
          // Insert base tag right after <head>
          html = html.replace(
            /<head>/i,
            `<head>\n    <base href="${baseUrl}">`
          );
          console.log(`[vite-plugin-fix-paths] ✓ Added <base> tag with href="${baseUrl}"`);
        }
      }
      
      // With <base> tag, we don't need to fix paths - they'll resolve relative to base
      // But we still fix paths that might have been incorrectly prefixed
      // Remove any double base path prefixes
      if (baseUrl !== "/") {
        const basePath = baseUrl.replace(/\/$/, "");
        html = html.replace(
          new RegExp(`(href|src)=["']${basePath}${basePath}(/[^"']+)["']`, 'g'),
          (match, attr, path) => {
            // Fix double prefix: /HiSMaComp/HiSMaComp/path -> /HiSMaComp/path
            return `${attr}="${basePath}${path}"`;
          }
        );
      }
      
      return html;
    },
    writeBundle() {
      // Also fix paths after all plugins run (safety net)
      try {
        const htmlPath = join(outputDir, "index.html");
        if (!existsSync(htmlPath)) {
          console.warn(`[vite-plugin-fix-paths] ⚠ HTML file not found: ${htmlPath}`);
          return;
        }
        
        let htmlContent = readFileSync(htmlPath, "utf-8");
        const originalContent = htmlContent;
        const fixed = fixPathsInHtml(htmlContent);

        if (fixed !== originalContent) {
          writeFileSync(htmlPath, fixed, "utf-8");
          console.log(
            `[vite-plugin-fix-paths] ✓ Fixed absolute paths in writeBundle for base: ${baseUrl}`
          );
        }
      } catch (error) {
        console.error(`[vite-plugin-fix-paths] ✗ Error fixing paths:`, error);
      }
    },
  };
}
