import type { Plugin } from "vite";
import { readFileSync } from "fs";
import { join } from "path";

const LCP_PLACEHOLDER_COMMENT = "<!-- LCP_LEGEND_PLACEHOLDER -->";
const CONSTANT_FILE = join(process.cwd(), "src/constants/legendLcp.ts");

/**
 * Injects the LCP legend heading placeholder into index.html at build and dev.
 * Reads the heading from the single source of truth (legendLcp.ts) so the
 * static HTML and the React legend stay in sync.
 */
export function vitePluginLcpLegend(): Plugin {
  return {
    name: "vite-plugin-lcp-legend",
    enforce: "pre",
    transformIndexHtml: {
      order: "pre",
      handler(html) {
        if (!html.includes(LCP_PLACEHOLDER_COMMENT)) return html;

        let heading: string;
        try {
          const content = readFileSync(CONSTANT_FILE, "utf-8");
          const match = content.match(
            /export const LEGEND_HEADING_LABEL\s*=\s*["']([^"']+)["']/
          );
          heading = match
            ? match[1]
            : "Town size according to population number";
        } catch {
          heading = "Town size according to population number";
        }

        const snippet = [
          `<style id="lcp-legend-placeholder-styles">#legend-heading-placeholder{position:fixed;top:16px;right:16px;z-index:1000;max-width:280px;padding:8px 12px;background:#fff;border-radius:4px;box-shadow:0 16px 48px rgba(0,0,0,.12);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif}#legend-heading-placeholder h2{margin:0;font-size:1.25rem;font-weight:500;line-height:1.4;color:#212121}</style>`,
          `<div id="legend-heading-placeholder" aria-hidden="true"><h2>${escapeHtml(heading)}</h2></div>`,
        ].join("\n");

        return html.replace(LCP_PLACEHOLDER_COMMENT, snippet);
      },
    },
  };
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
