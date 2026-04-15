/**
 * Internal UI library: presentational / reusable map chrome (legend, timeline, …).
 * Prefer importing from `@/ui` for new code; feature folders may re-export for stability.
 */
export { default as Legend, LegendContent, type LegendProps } from "./legend";
export type { LegendLayoutOptions } from "./legend";
