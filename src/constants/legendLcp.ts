import legendLcp from "./legendLcp.json";

/**
 * Single source of truth for the legend heading text.
 * Used by the Legend component and by the LCP placeholder injected into index.html at build time.
 * Value is defined in legendLcp.json so the Vite plugin can read it without parsing TS.
 */
export const LEGEND_HEADING_LABEL: string = legendLcp.heading;
