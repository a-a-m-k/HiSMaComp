import type { Plugin } from "vite";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

const SCRIPT_SRC_RELAXED = "script-src 'self' 'unsafe-inline' 'unsafe-eval'";
const SCRIPT_SRC_STRICT = "script-src 'self' 'unsafe-eval'";

/**
 * Post-process dist/index.html after critical CSS and path fixes:
 * - Remove async-CSS `onload` handlers (inline handlers require script-src 'unsafe-inline').
 * - Tighten script-src for production (dev keeps unsafe-inline in source index for Vite HMR).
 *
 * GitHub Pages cannot set CSP response headers; the Issues panel may still suggest
 * moving CSP to headers — that requires a CDN or host that supports custom headers.
 */
export function vitePluginProductionHtmlCspCleanup(): Plugin {
  let outDir = "";
  return {
    name: "vite-plugin-production-html-csp-cleanup",
    apply: "build",
    enforce: "post",
    configResolved(config) {
      outDir = join(process.cwd(), config.build.outDir || "dist");
    },
    closeBundle() {
      const htmlPath = join(outDir, "index.html");
      if (!existsSync(htmlPath)) return;
      const html = readFileSync(htmlPath, "utf-8");
      // `critical` may emit attrs in different order; normalize by removing
      // inline handler first, then forcing eager stylesheet media.
      let next = html
        .replace(/\s+onload="this\.media='all'"/g, "")
        .replace(
          /(<link[^>]*rel="stylesheet"[^>]*?)\smedia="print"([^>]*>)/g,
          '$1 media="all"$2'
        );
      next = next.replace(SCRIPT_SRC_RELAXED, SCRIPT_SRC_STRICT);
      if (next !== html) {
        writeFileSync(htmlPath, next, "utf-8");
      }
    },
  };
}
