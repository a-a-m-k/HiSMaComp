import { useMemo } from "react";
import type { CSSProperties } from "react";
import type { Theme } from "@mui/material/styles";

import { LEGEND_CONTENT_SPACING } from "./legendHelpers";

export interface LegendLayoutFlags {
  isMobileLayout: boolean;
  isTabletLayout: boolean;
  isMediumOrLargerLayout: boolean;
}

export interface LegendContentStylesResult {
  appTitleStyle: CSSProperties;
  titleStyle: CSSProperties;
  subtitleStyle: CSSProperties;
  stackStyles: {
    spacing: number | string;
    direction: "row" | "column";
    alignItems: "center" | "flex-start";
    sx: {
      flexWrap: string;
      justifyContent: string;
      overflowX: string;
    };
  };
}

/**
 * Memoized title, subtitle, and stack styles for LegendContent based on theme and layout.
 */
export function useLegendContentStyles(
  theme: Theme,
  layout: LegendLayoutFlags,
  isMapIdle: boolean
): LegendContentStylesResult {
  const { isMobileLayout, isTabletLayout, isMediumOrLargerLayout } = layout;

  const appTitleStyle = useMemo<CSSProperties>(
    () => ({
      margin: 0,
      marginBottom: 0,
      textAlign: isTabletLayout || isMobileLayout ? "center" : "left",
      width: "100%",
      color: theme.custom.legend.colors.title,
      fontSize: isMobileLayout ? "13px" : "14px",
      fontWeight: 700,
      lineHeight: 1.3,
      letterSpacing: "-0.01em",
    }),
    [isMobileLayout, isTabletLayout, theme]
  );

  const titleStyle = useMemo<CSSProperties>(
    () => ({
      margin: 0,
      marginTop: 0,
      marginBottom: isMapIdle
        ? theme.spacing(LEGEND_CONTENT_SPACING.headingMarginBottom)
        : 0,
      textAlign: isTabletLayout || isMobileLayout ? "center" : "left",
      width: "100%",
      color: theme.custom.legend.colors.scaleHeading,
      fontSize: "11px",
      fontWeight: 700,
      lineHeight: 1.3,
      letterSpacing: "0.05em",
      textTransform: "uppercase",
    }),
    [isMapIdle, isMobileLayout, isTabletLayout, theme]
  );

  const subtitleStyle = useMemo<CSSProperties>(
    () => ({
      margin: 0,
      marginTop: 0,
      marginBottom: 0,
      textAlign: isTabletLayout || isMobileLayout ? "center" : "left",
      width: "100%",
      color: theme.palette.info.main,
      fontSize: isMobileLayout ? "11px" : "11.5px",
      lineHeight: 1.2,
      fontWeight: 600,
    }),
    [isMobileLayout, isTabletLayout, theme]
  );

  const stackStyles = useMemo(
    () => ({
      spacing: theme.spacing(LEGEND_CONTENT_SPACING.layerStackGap),
      direction: (isMediumOrLargerLayout ? "column" : "row") as
        | "row"
        | "column",
      alignItems: (isTabletLayout || isMobileLayout
        ? "center"
        : "flex-start") as "center" | "flex-start",
      sx: {
        flexWrap: isMediumOrLargerLayout ? "nowrap" : "wrap",
        justifyContent:
          isTabletLayout || isMobileLayout ? "space-evenly" : "flex-start",
        overflowX: isTabletLayout ? "auto" : "visible",
      },
    }),
    [isMobileLayout, isTabletLayout, isMediumOrLargerLayout, theme]
  );

  return { appTitleStyle, titleStyle, subtitleStyle, stackStyles };
}
