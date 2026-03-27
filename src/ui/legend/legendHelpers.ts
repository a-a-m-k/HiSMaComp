import type { SxProps, Theme } from "@mui/material/styles";
import {
  COMPONENT_WIDTHS,
  LEGEND_WIDTHS,
  OVERLAY_POSITIONS,
} from "@/constants";
import { SIZING_CONSTANTS } from "@/constants/sizing";

export interface LegendLayoutOptions {
  isMobile: boolean;
  isTablet: boolean;
  isXLarge: boolean;
  theme: Theme;
  commonStyles: Record<string, unknown>;
}

/**
 * Legend inner layout — one scale for header / main / footer (reference: px 2, header py 1.5).
 * Paper uses `p: 0`; sections apply these insets.
 */
export const LEGEND_CONTENT_SPACING = {
  paddingX: 2,
  headerPaddingY: 1.5,
  /** Padding below each horizontal divider (main top, footer top). */
  sectionPaddingTop: 1.5,
  /** Space below the scale heading before the layer stack. */
  headingMarginBottom: 1.5,
  /** Space after the layer stack before the footer divider. */
  mainPaddingBottom: 1.5,
  /** Bottom inset of the card (footer). */
  footerPaddingBottom: 2,
  /** Bottom inset when there is no footer (map not idle). */
  mainPaddingBottomSolo: 2,
  /** Gap between app title and year line in the header. */
  headerGap: 0.25,
  /** Vertical / flex gap between layer rows (theme spacing). */
  layerStackGap: 1,
} as const;

/** Frosted card shell shared by all legend breakpoints (matches reference Paper). */
export function getLegendPaperSurface(theme: Theme): SxProps<Theme> {
  const { borders, shadows } = theme.custom.legend;
  return {
    bgcolor: "rgba(255, 255, 255, 0.97)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    border: borders.paper,
    /** Match `Timeline` root `Paper` (`borderRadius: 2`). */
    borderRadius: 2,
    overflow: "hidden",
    boxShadow: shadows.paper,
    transition: "all 0.3s ease",
    "@media (prefers-reduced-motion: reduce)": {
      transition: "none",
    },
  };
}

/**
 * Returns responsive styles for legend positioning.
 * Mobile/Tablet: fixed at top with edge spacing.
 * Desktop: absolute (relative to map container) at top-right.
 */
export function getResponsiveStyles(
  options: LegendLayoutOptions
): SxProps<Theme> {
  const { isMobile, isTablet, isXLarge, theme, commonStyles } = options;

  if (isMobile) {
    return {
      ...getLegendPaperSurface(theme),
      ...commonStyles,
      display: "flex",
      position: "fixed" as const,
      top: theme.spacing(OVERLAY_POSITIONS.LEGEND.TOP_MOBILE_TABLET),
      left: theme.spacing(OVERLAY_POSITIONS.LEGEND.TOP_MOBILE_TABLET),
      right: theme.spacing(OVERLAY_POSITIONS.LEGEND.TOP_MOBILE_TABLET),
      p: 0,
    };
  }

  if (isTablet) {
    return {
      ...getLegendPaperSurface(theme),
      ...commonStyles,
      position: "fixed" as const,
      top: theme.spacing(OVERLAY_POSITIONS.LEGEND.TOP_MOBILE_TABLET),
      left: theme.spacing(OVERLAY_POSITIONS.LEGEND.TOP_MOBILE_TABLET),
      right: theme.spacing(OVERLAY_POSITIONS.LEGEND.TOP_MOBILE_TABLET),
      width: `calc(100% - ${theme.spacing(2)})`,
      p: 0,
    };
  }

  return {
    ...getLegendPaperSurface(theme),
    ...commonStyles,
    position: "absolute" as const,
    top: theme.spacing(OVERLAY_POSITIONS.LEGEND.TOP_DESKTOP),
    right: theme.spacing(OVERLAY_POSITIONS.LEGEND.RIGHT_DESKTOP),
    p: 0,
    width: LEGEND_WIDTHS.DESKTOP,
    maxWidth: LEGEND_WIDTHS.DESKTOP_MAX,
    minWidth: isXLarge
      ? SIZING_CONSTANTS.XL_MIN_WIDTH
      : COMPONENT_WIDTHS.DESKTOP_MIN,
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

/**
 * Legend year line: "~800 AD" for 800, otherwise "{year}s" (e.g. "1200s").
 */
export function getLegendYearLabel(year: number): string {
  return year === 800 ? "~800 AD" : `${year}s`;
}
