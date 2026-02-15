import type { Plugin } from "vite";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

interface ViteCriticalOptions {
  /**
   * Base directory for files
   * @default process.cwd()
   */
  base?: string;
  /**
   * HTML source file
   * @default 'index.html'
   */
  src?: string;
  /**
   * Output file destination
   * @default 'index.html'
   */
  dest?: string;
  /**
   * Viewport dimensions for critical CSS extraction
   * @default [{ width: 1300, height: 900 }]
   */
  dimensions?: Array<{ width: number; height: number }>;
  /**
   * Whether to inline critical CSS in HTML head
   * @default true
   */
  inline?: boolean;
  /**
   * Whether to minify extracted CSS
   * @default true
   */
  minify?: boolean;
  /**
   * Extract critical CSS from these CSS files
   * If not provided, will extract from all CSS files in the build
   */
  css?: string[];
  /**
   * Base URL for the application
   * @default '/'
   */
  baseUrl?: string;
  /**
   * Skip critical CSS extraction if browser launch fails
   * @default true
   */
  skipOnError?: boolean;
}

/**
 * Vite plugin for extracting and inlining critical CSS
 * Uses the 'critical' package to extract above-the-fold CSS
 */
export function vitePluginCritical(options: ViteCriticalOptions = {}): Plugin {
  const {
    base = process.cwd(),
    src = "index.html",
    dest = "index.html",
    dimensions = [
      { width: 1300, height: 900 },
      { width: 375, height: 667 },
    ], // Desktop and mobile
    inline = true,
    minify = true,
    css,
    baseUrl = "/",
    skipOnError = true,
  } = options;

  let distDir = "";
  let outputDir = "";
  let viteBaseUrl = "/";

  return {
    name: "vite-plugin-critical",
    enforce: "post",
    apply: "build",
    async closeBundle() {
      try {
        const htmlPath = join(outputDir, dest);

        // Wait a bit to ensure files are written
        await new Promise(resolve => setTimeout(resolve, 100));

        // Check if HTML file exists
        if (!existsSync(htmlPath)) {
          console.warn(
            `[vite-plugin-critical] ⚠ HTML file not found at ${htmlPath}. Skipping critical CSS extraction.`
          );
          return;
        }

        // Dynamically import critical to avoid requiring it at build time
        const critical = await import("critical");
        const criticalGenerate = critical.generate || critical.default;

        let htmlContent = readFileSync(htmlPath, "utf-8");
        const actualBaseUrl = baseUrl !== "/" ? baseUrl : viteBaseUrl;

        // Save original HTML BEFORE any modifications
        const originalHtml = htmlContent;

        // Temporarily rewrite absolute paths with base to relative paths for critical package
        // Critical package has trouble resolving paths with base URLs
        if (actualBaseUrl !== "/") {
          const basePath = actualBaseUrl.replace(/\/$/, "").replace(/^\//, "");
          // Replace /HiSMaComp/path with /path (remove base prefix for critical package)
          htmlContent = htmlContent.replace(
            new RegExp(
              `/${basePath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/`,
              "g"
            ),
            "/"
          );
          // Write temporary HTML for critical to process
          const tempHtmlPath = join(outputDir, "index.temp.html");
          writeFileSync(tempHtmlPath, htmlContent, "utf-8");

          // Use temp file for processing
          const criticalOptions: any = {
            base: outputDir,
            src: tempHtmlPath,
            inline,
            width: dimensions[0]?.width || 1300,
            height: dimensions[0]?.height || 900,
          };

          const result = await criticalGenerate(criticalOptions);

          if (result && result.html) {
            // Restore base paths in the result
            let processedHtml = result.html;
            const basePathNoSlash = basePath.replace(/^\//, ""); // Remove leading slash for comparison

            // CRITICAL: Ensure base tag is correct (critical package might change it)
            // We use relative paths with base tag, so ensure it's correct
            processedHtml = processedHtml.replace(
              /<base\s+[^>]*>/i,
              `<base href="${actualBaseUrl}">`
            );

            // Restore base paths: href="/assets/..." -> href="/HiSMaComp/assets/..."
            processedHtml = processedHtml.replace(
              /(href|src)=["']\/([^"']+)["']/g,
              (match: string, attr: string, path: string) => {
                // Skip external URLs
                if (path.startsWith("http") || path.startsWith("//")) {
                  return match;
                }
                // Skip if already has base path
                if (
                  path.startsWith(basePathNoSlash + "/") ||
                  path === basePathNoSlash
                ) {
                  return match;
                }
                return `${attr}="${actualBaseUrl}${path}"`;
              }
            );
            writeFileSync(htmlPath, processedHtml, "utf-8");
            console.log(
              `[vite-plugin-critical] ✓ Critical CSS extracted and inlined successfully`
            );
          } else if (result && result.css) {
            // If HTML wasn't returned, manually inject the CSS
            const criticalCss = result.css;
            const styleTag = `<style id="critical-css">${criticalCss}</style>`;
            const updatedHtml = originalHtml.replace(
              "</head>",
              `${styleTag}\n</head>`
            );
            writeFileSync(htmlPath, updatedHtml, "utf-8");
            console.log(
              `[vite-plugin-critical] ✓ Critical CSS extracted and inlined successfully`
            );
          }

          // Clean up temp file
          try {
            const { unlinkSync } = await import("fs");
            unlinkSync(tempHtmlPath);
          } catch {
            // Ignore cleanup errors
          }

          return;
        }

        // Generate critical CSS (for root base path)
        // Note: critical package uses a headless browser
        const criticalOptions: any = {
          base: outputDir,
          src: htmlPath,
          inline,
          width: dimensions[0]?.width || 1300,
          height: dimensions[0]?.height || 900,
        };

        const result = await criticalGenerate(criticalOptions);

        if (result && result.html) {
          let processedHtml = result.html;
          // CRITICAL: Ensure base tag is correct (critical package might change it)
          // We use relative paths with base tag, so ensure it's correct
          if (viteBaseUrl !== "/") {
            processedHtml = processedHtml.replace(
              /<base\s+[^>]*>/i,
              `<base href="${viteBaseUrl}">`
            );
          }
          writeFileSync(htmlPath, processedHtml, "utf-8");
          console.log(
            `[vite-plugin-critical] ✓ Critical CSS extracted and inlined successfully`
          );
        } else if (result && result.css) {
          // If HTML wasn't returned, manually inject the CSS
          const criticalCss = result.css;
          const styleTag = `<style id="critical-css">${criticalCss}</style>`;
          // Insert before closing </head> tag
          let updatedHtml = htmlContent.replace(
            "</head>",
            `${styleTag}\n</head>`
          );
          // Ensure base tag is correct
          if (viteBaseUrl !== "/") {
            updatedHtml = updatedHtml.replace(
              /<base\s+[^>]*>/i,
              `<base href="${viteBaseUrl}">`
            );
          }
          writeFileSync(htmlPath, updatedHtml, "utf-8");
          console.log(
            `[vite-plugin-critical] ✓ Critical CSS extracted and inlined successfully`
          );
        }
      } catch (error) {
        if (error instanceof Error) {
          if (error.message.includes("Cannot find module 'critical'")) {
            console.warn(
              `[vite-plugin-critical] ⚠ 'critical' package not found. Install it with: npm install --save-dev critical`
            );
          } else if (
            error.message.includes("Failed to launch the browser") ||
            error.message.includes("browser process") ||
            error.message.includes("TROUBLESHOOTING")
          ) {
            console.warn(
              `[vite-plugin-critical] ⚠ Browser launch failed. Critical CSS extraction skipped.`
            );
            console.warn(
              `[vite-plugin-critical] This is usually due to missing Puppeteer dependencies.`
            );
            console.warn(
              `[vite-plugin-critical] To fix: Install Puppeteer dependencies or skip critical CSS extraction.`
            );
            console.warn(
              `[vite-plugin-critical] Build will continue without critical CSS optimization.`
            );
          } else {
            console.error(
              "[vite-plugin-critical] ✗ Error extracting critical CSS:",
              error
            );
            // Don't fail the build if critical CSS extraction fails
            console.warn(
              "[vite-plugin-critical] Build will continue without critical CSS optimization"
            );
          }
        } else {
          console.error(
            "[vite-plugin-critical] ✗ Error extracting critical CSS:",
            error
          );
          console.warn(
            "[vite-plugin-critical] Build will continue without critical CSS optimization"
          );
        }
      }
    },
    configResolved(config) {
      distDir = config.build.outDir || "dist";
      outputDir = join(base, distDir);
      viteBaseUrl = config.base || "/";
    },
  };
}
