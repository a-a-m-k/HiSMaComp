/**
 * UI constants barrel: pure layout (uiConstants), theme-derived (themeValues), and map style generators (mapStyles).
 * Re-exports from @/theme for Z_INDEX, TRANSITIONS, getMapStyles, etc. Import from @/constants/ui for compatibility.
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
