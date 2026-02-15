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

  // Fix only the base tag (safe for transformIndexHtml - before Vite injects assets)
  const fixBaseTag = (htmlContent: string): string => {
    if (baseUrl === "/") return htmlContent;
    const correctBaseTag = `<base href="${baseUrl}">`;
    if (/<base[\s>]/i.test(htmlContent)) {
      return htmlContent.replace(/<base[^>]*>/gi, correctBaseTag);
    }
    return htmlContent.replace(/<head>/i, `<head>\n    ${correctBaseTag}`);
  };

  // Full fix: base tag + path conversions (for final HTML after build)
  const fixHtmlContent = (htmlContent: string): string => {
    let result = fixBaseTag(htmlContent);
    if (baseUrl === "/") return result;

    const basePath = baseUrl.replace(/\/$/, "");

    // Step 2: Convert absolute paths to relative paths (works with base tag)
    const pathsToFix = [
      { absolute: "/favicon.ico", relative: "favicon.ico" },
      { absolute: "/favicon-16x16.png", relative: "favicon-16x16.png" },
      { absolute: "/favicon-32x32.png", relative: "favicon-32x32.png" },
      { absolute: "/apple-touch-icon.png", relative: "apple-touch-icon.png" },
      { absolute: "/manifest.json", relative: "manifest.json" },
    ];

    pathsToFix.forEach(({ absolute, relative }) => {
      const absoluteRegex = new RegExp(
        `(href|src)=["']${absolute.replace(/\//g, "\\/")}["']`,
        "gi"
      );
      result = result.replace(absoluteRegex, `$1="${relative}"`);
    });

    // Step 3: Convert root-relative paths (/path) to relative (path)
    result = result.replace(
      /(href|src)=["'](\/[^"']+)["']/g,
      (match, attr, path) => {
        if (/^https?:\/\//.test(path) || path.startsWith("//")) return match;
        if (path.startsWith("data:") || path.startsWith("blob:")) return match;
        if (path.startsWith(basePath + "/")) {
          return `${attr}="${path.substring(basePath.length + 1)}"`;
        }
        if (path === basePath) return `${attr}="./"`;
        if (path.startsWith("/")) {
          return `${attr}="${path.substring(1)}"`;
        }
        return match;
      }
    );

    return result;
  };

  const fixHtml = (hookName: string) => {
    try {
      const htmlPath = join(outputDir, "index.html");
      if (!existsSync(htmlPath)) {
        if (hookName === "writeBundle") {
          console.warn(
            `[vite-plugin-fix-paths] ⚠ HTML file not found: ${htmlPath}`
          );
        }
        return;
      }

      const originalContent = readFileSync(htmlPath, "utf-8");
      const htmlContent = fixHtmlContent(originalContent);

      if (htmlContent !== originalContent) {
        writeFileSync(htmlPath, htmlContent, "utf-8");
        console.log(
          `[vite-plugin-fix-paths] [${hookName}] ✓ Fixed base tag and paths for: ${baseUrl}`
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
      return fixBaseTag(html);
    },
    generateBundle(_, bundle) {
      // Fix HTML in bundle before it's written (catches HTML emitted by Vite)
      for (const [fileName, chunk] of Object.entries(bundle)) {
        if (
          chunk.type === "asset" &&
          typeof chunk.source === "string" &&
          (fileName === "index.html" || fileName.endsWith("/index.html"))
        ) {
          chunk.source = fixHtmlContent(chunk.source);
          break;
        }
      }
    },
    closeBundle() {
      fixHtml("closeBundle");
    },
    writeBundle() {
      fixHtml("writeBundle");
    },
  };
}
