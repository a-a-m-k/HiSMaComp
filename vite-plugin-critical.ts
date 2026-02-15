import type { Plugin } from "vite";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import { pathToFileURL } from "url";

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
    dimensions = [{ width: 1300, height: 900 }, { width: 375, height: 667 }], // Desktop and mobile
    inline = true,
    minify = true,
    css,
    baseUrl = "/",
  } = options;

  let distDir = "";
  let outputDir = "";

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
        // @ts-expect-error - critical package may not be installed
        const critical = await import("critical");
        const criticalGenerate = critical.generate || critical.default;

        const htmlContent = readFileSync(htmlPath, "utf-8");

        // Convert file path to file:// URL for critical package
        const htmlUrl = pathToFileURL(htmlPath).href;

        // Generate critical CSS
        // Note: critical package uses a headless browser and needs a URL
        const criticalOptions = {
          base: outputDir,
          src: htmlUrl, // Use file:// URL instead of file path
          dest: htmlPath,
          inline,
          minify,
          dimensions,
          width: dimensions[0]?.width || 1300,
          height: dimensions[0]?.height || 900,
          // Extract only above-the-fold CSS
          extract: true,
          // Ignore font-face and keyframes in critical CSS
          ignore: {
            atrule: ["@font-face", "@keyframes"],
          },
          // Additional options for better performance
          penthouse: {
            blockJSRequests: false,
            timeout: 30000,
          },
        };

        const result = await criticalGenerate(criticalOptions);

        if (result && result.html) {
          writeFileSync(htmlPath, result.html, "utf-8");
          console.log(
            `[vite-plugin-critical] ✓ Critical CSS extracted and inlined successfully`
          );
        } else if (result && result.css) {
          // If HTML wasn't returned, manually inject the CSS
          const criticalCss = result.css;
          const styleTag = `<style id="critical-css">${criticalCss}</style>`;
          // Insert before closing </head> tag
          const updatedHtml = htmlContent.replace(
            "</head>",
            `${styleTag}\n</head>`
          );
          writeFileSync(htmlPath, updatedHtml, "utf-8");
          console.log(
            `[vite-plugin-critical] ✓ Critical CSS extracted and inlined successfully`
          );
        }
      } catch (error) {
        if (error instanceof Error && error.message.includes("Cannot find module 'critical'")) {
          console.warn(
            `[vite-plugin-critical] ⚠ 'critical' package not found. Install it with: npm install --save-dev critical`
          );
        } else {
          console.error("[vite-plugin-critical] ✗ Error extracting critical CSS:", error);
          // Don't fail the build if critical CSS extraction fails
          console.warn("[vite-plugin-critical] Build will continue without critical CSS optimization");
        }
      }
    },
    configResolved(config) {
      distDir = config.build.outDir || "dist";
      outputDir = join(base, distDir);
    },
  };
}
