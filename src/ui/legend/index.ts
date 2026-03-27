/**
 * Map legend — public surface of the internal UI library (`@/ui`).
 * App code may import from here or from `@/components/controls` (re-export).
 */
export { default } from "./Legend";
export { LegendContent, type LegendProps } from "./LegendContent";
export {
  getLegendPaperSurface,
  getLegendTestId,
  getLegendYearLabel,
  getResponsiveStyles,
  LEGEND_CONTENT_SPACING,
  type LegendLayoutOptions,
} from "./legendHelpers";
