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
          console.warn(
            `[vite-plugin-fix-paths] ⚠ HTML file not found: ${htmlPath}`
          );
        }
        return;
      }

      let htmlContent = readFileSync(htmlPath, "utf-8");
      const originalContent = htmlContent;

      if (baseUrl !== "/") {
        const basePath = baseUrl.replace(/\/$/, ""); // Remove trailing slash

        // Step 1: Ensure <base> tag exists with correct href
        // Handle empty href="" or missing href attribute
        // First, specifically fix empty href=""
        htmlContent = htmlContent.replace(
          /<base\s+href=["']{2}\s*>/i,
          `<base href="${baseUrl}">`
        );
        // Then handle any other base tag variations
        const baseTagRegex = /<base\s+[^>]*>/i;
        if (baseTagRegex.test(htmlContent)) {
          // Replace existing base tag (including empty href="")
          htmlContent = htmlContent.replace(
            baseTagRegex,
            `<base href="${baseUrl}">`
          );
          console.log(
            `[vite-plugin-fix-paths] [${hookName}] ✓ Ensured <base> tag is correct: ${baseUrl}`
          );
        } else {
          // Add base tag if missing
          htmlContent = htmlContent.replace(
            /<head>/i,
            `<head>\n    <base href="${baseUrl}">`
          );
          console.log(
            `[vite-plugin-fix-paths] [${hookName}] ✓ Added <base> tag: ${baseUrl}`
          );
        }

        // Step 2: Convert absolute paths to relative paths (works with base tag)
        // /HiSMaComp/favicon.ico -> favicon.ico (relative to base)
        const pathsToFix = [
          { absolute: "/favicon.ico", relative: "favicon.ico" },
          { absolute: "/favicon-16x16.png", relative: "favicon-16x16.png" },
          { absolute: "/favicon-32x32.png", relative: "favicon-32x32.png" },
          {
            absolute: "/apple-touch-icon.png",
            relative: "apple-touch-icon.png",
          },
          { absolute: "/manifest.json", relative: "manifest.json" },
        ];

        pathsToFix.forEach(({ absolute, relative }) => {
          // Match both href and src attributes with absolute path
          const absoluteRegex = new RegExp(
            `(href|src)=["']${absolute.replace(/\//g, "\\/")}["']`,
            "gi"
          );
          if (absoluteRegex.test(htmlContent)) {
            htmlContent = htmlContent.replace(
              absoluteRegex,
              `$1="${relative}"`
            );
            console.log(
              `[vite-plugin-fix-paths] [${hookName}] Fixed: ${absolute} -> ${relative} (relative)`
            );
          }
        });

        // Step 3: Convert ALL absolute paths that start with base path to relative
        // This catches /HiSMaComp/assets/..., /HiSMaComp/manifest.json, etc.
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
            // If path starts with base path, make it relative
            if (path.startsWith(basePath + "/")) {
              const relativePath = path.substring(basePath.length + 1); // Remove /HiSMaComp/
              console.log(
                `[vite-plugin-fix-paths] [${hookName}] Fixed: ${path} -> ${relativePath} (relative)`
              );
              return `${attr}="${relativePath}"`;
            }
            // If path is just the base path, use "./"
            if (path === basePath) {
              return `${attr}="./"`;
            }
            // For any other absolute path (like /src/main.tsx), convert to relative
            // This handles paths that Vite might not have processed correctly
            if (path.startsWith("/")) {
              const relativePath = path.substring(1); // Remove leading /
              console.log(
                `[vite-plugin-fix-paths] [${hookName}] Fixed: ${path} -> ${relativePath} (relative)`
              );
              return `${attr}="${relativePath}"`;
            }
            return match;
          }
        );
      }

      if (htmlContent !== originalContent) {
        writeFileSync(htmlPath, htmlContent, "utf-8");
        console.log(
          `[vite-plugin-fix-paths] [${hookName}] ✓ Fixed HTML for base: ${baseUrl}`
        );
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
    transformIndexHtml(html: string) {
      // Only ensure base tag is correct here
      // Don't convert paths yet - let Vite process /src/main.tsx first
      if (baseUrl !== "/") {
        // First, specifically fix empty href=""
        html = html.replace(
          /<base\s+href=["']{2}\s*>/i,
          `<base href="${baseUrl}">`
        );
        // Then handle any other base tag variations
        const baseTagRegex = /<base\s+[^>]*>/i;
        if (baseTagRegex.test(html)) {
          // Replace existing base tag (including empty href="")
          html = html.replace(baseTagRegex, `<base href="${baseUrl}">`);
        } else {
          html = html.replace(
            /<head>/i,
            `<head>\n    <base href="${baseUrl}">`
          );
        }
      }
      return html;
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
