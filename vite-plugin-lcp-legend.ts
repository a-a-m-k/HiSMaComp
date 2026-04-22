import type { Plugin } from "vite";
import { readFileSync } from "fs";
import { join } from "path";

const LCP_PLACEHOLDER_COMMENT = "<!-- LCP_LEGEND_PLACEHOLDER -->";
const LEGEND_LABEL_JSON = join(process.cwd(), "src/constants/legendLcp.json");
const LEGEND_LABEL_FALLBACK = "European population";

/**
 * Injects the LCP legend heading placeholder into index.html at build and dev.
 * Reads the heading from the single source of truth (legendLcp.json) so the
 * static HTML and the React legend stay in sync. The splash uses id="legend-heading"
 * (same as LegendContent) until React removes the placeholder node before paint.
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

        const snippet = `<div id="legend-heading-placeholder" aria-hidden="true"><h2 id="legend-heading" class="lcp-legend-heading-splash">${escapeHtml(heading)}</h2></div>`;

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
