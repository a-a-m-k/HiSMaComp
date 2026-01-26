import React from "react";
import Paper from "@mui/material/Paper";

import { LegendContent, LegendProps } from "./LegendContent";
import {
  Z_INDEX,
  COMPONENT_WIDTHS,
  RESPONSIVE_PADDING,
  LEGEND_WIDTHS,
  BORDER_RADIUS,
  OVERLAY_POSITIONS,
} from "@/constants/ui";
import { SIZING_CONSTANTS } from "@/constants/sizing";
import { useResponsive } from "@/hooks/ui";

const Legend: React.FC<LegendProps> = props => {
  const { isMobile, isTablet, isXLarge, theme } = useResponsive();

  if (!props.layers || props.layers.length === 0) return null;

  const commonStyles = {
    elevation: 3,
    zIndex: Z_INDEX.LEGEND,
    ...props.style,
  };

  /**
   * Gets responsive styles for legend positioning.
   * Uses OVERLAY_POSITIONS constants for consistent spacing from viewport edges.
   *
   * Positioning Strategy:
   * - Mobile/Tablet: Fixed at top with edge spacing
   * - Desktop: Absolute positioned (relative to map container) at top-right
   *   (Uses absolute instead of fixed to maintain positioning relative to map container)
   */
  const getResponsiveStyles = () => {
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
  };

  const getTestId = () => {
    if (isMobile) return "legend-mobile";
    if (isTablet) return "legend-tablet";
    return "legend";
  };

  return (
    <Paper
      id="legend"
      sx={getResponsiveStyles()}
      data-testid={getTestId()}
      tabIndex={-1}
    >
      <LegendContent {...props} />
    </Paper>
  );
};

export default Legend;
