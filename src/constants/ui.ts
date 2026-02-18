/**
 * UI constants barrel: pure layout (uiConstants), theme-derived (themeValues), and map style generators (mapStyles).
 * Import from @/constants/ui for compatibility; individual modules allow smaller bundles and clearer dependencies.
 */

export * from "./uiConstants";
export {
  COLORS,
  Z_INDEX,
  TRANSITIONS,
  SHADOWS,
  TOOLTIP_STYLES,
} from "@/theme/themeValues";
export {
  getTooltipStyles,
  getMapContainerStyles,
  getNavigationControlStyles,
  getMapStyles,
  type TooltipStylesOptions,
} from "@/theme/mapStyles";
