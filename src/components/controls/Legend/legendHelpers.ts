import type { Theme } from "@mui/material/styles";
import {
  BORDER_RADIUS,
  COMPONENT_WIDTHS,
  LEGEND_WIDTHS,
  OVERLAY_POSITIONS,
  RESPONSIVE_PADDING,
} from "@/constants/ui";
import { SIZING_CONSTANTS } from "@/constants/sizing";

export interface LegendLayoutOptions {
  isMobile: boolean;
  isTablet: boolean;
  isXLarge: boolean;
  theme: Theme;
  commonStyles: Record<string, unknown>;
}

/**
 * Returns responsive styles for legend positioning.
 * Mobile/Tablet: fixed at top with edge spacing.
 * Desktop: absolute (relative to map container) at top-right.
 */
export function getResponsiveStyles(options: LegendLayoutOptions): object {
  const { isMobile, isTablet, isXLarge, theme, commonStyles } = options;

  if (isMobile) {
    return {
      ...commonStyles,
      display: "flex",
      position: "fixed" as const,
      top: theme.spacing(OVERLAY_POSITIONS.LEGEND.TOP_MOBILE_TABLET),
      left: theme.spacing(OVERLAY_POSITIONS.LEGEND.TOP_MOBILE_TABLET),
      right: theme.spacing(OVERLAY_POSITIONS.LEGEND.TOP_MOBILE_TABLET),
      p: 1,
      borderRadius: `${BORDER_RADIUS.CONTROL}px !important`,
      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
    };
  }

  if (isTablet) {
    return {
      ...commonStyles,
      position: "fixed" as const,
      top: theme.spacing(OVERLAY_POSITIONS.LEGEND.TOP_MOBILE_TABLET),
      left: theme.spacing(OVERLAY_POSITIONS.LEGEND.TOP_MOBILE_TABLET),
      right: theme.spacing(OVERLAY_POSITIONS.LEGEND.TOP_MOBILE_TABLET),
      width: `calc(100% - ${theme.spacing(2)})`,
      p: RESPONSIVE_PADDING.TABLET,
      borderRadius: `${BORDER_RADIUS.CONTROL}px !important`,
      boxShadow: "0 12px 40px rgba(0, 0, 0, 0.15)",
    };
  }

  return {
    ...commonStyles,
    position: "absolute" as const,
    top: theme.spacing(OVERLAY_POSITIONS.LEGEND.TOP_DESKTOP),
    right: theme.spacing(OVERLAY_POSITIONS.LEGEND.RIGHT_DESKTOP),
    p: isXLarge
      ? RESPONSIVE_PADDING.XL + 0.5
      : RESPONSIVE_PADDING.DESKTOP + 0.5,
    width: LEGEND_WIDTHS.DESKTOP,
    maxWidth: LEGEND_WIDTHS.DESKTOP_MAX,
    minWidth: isXLarge
      ? SIZING_CONSTANTS.XL_MIN_WIDTH
      : COMPONENT_WIDTHS.DESKTOP_MIN,
    borderRadius: `${BORDER_RADIUS.CONTROL}px !important`,
    boxShadow: "0 16px 48px rgba(0, 0, 0, 0.12)",
  };
}

/**
 * Returns data-testid for the legend based on viewport (for tests).
 */
export function getLegendTestId(options: {
  isMobile: boolean;
  isTablet: boolean;
}): string {
  if (options.isMobile) return "legend-mobile";
  if (options.isTablet) return "legend-tablet";
  return "legend";
}
