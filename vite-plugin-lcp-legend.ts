import type { Plugin } from "vite";
import { readFileSync } from "fs";
import { join } from "path";

const LCP_PLACEHOLDER_COMMENT = "<!-- LCP_LEGEND_PLACEHOLDER -->";
const LEGEND_LABEL_JSON = join(process.cwd(), "src/constants/legendLcp.json");
const LEGEND_LABEL_FALLBACK = "Town size according to population number";

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
          const json = JSON.parse(readFileSync(LEGEND_LABEL_JSON, "utf-8"));
          heading =
            typeof json.heading === "string"
              ? json.heading
              : LEGEND_LABEL_FALLBACK;
        } catch {
          heading = LEGEND_LABEL_FALLBACK;
        }

        const snippet = [
          `<style id="lcp-legend-placeholder-styles">#legend-heading-placeholder{position:fixed;top:12px;left:50%;transform:translateX(-50%);z-index:1000;max-width:520px;padding:6px 10px;background:rgba(255,255,255,.9);border:1px solid rgba(0,0,0,.08);border-radius:10px;box-shadow:0 4px 16px rgba(0,0,0,.08);backdrop-filter:blur(4px);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;pointer-events:none;user-select:none}#legend-heading-placeholder h2{margin:0;font-size:.88rem;font-weight:500;line-height:1.25;color:#2f2f2f;letter-spacing:.01em;white-space:normal;overflow:visible;text-overflow:clip}@media (max-width:640px){#legend-heading-placeholder{top:8px;max-width:300px;padding:4px 8px}#legend-heading-placeholder h2{font-size:.78rem}}</style>`,
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
