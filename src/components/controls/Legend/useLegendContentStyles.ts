import { useMemo } from "react";
import type { CSSProperties } from "react";
import type { Theme } from "@mui/material/styles";

export interface LegendLayoutFlags {
  isMobileLayout: boolean;
  isTabletLayout: boolean;
  isMediumOrLargerLayout: boolean;
}

export interface LegendContentStylesResult {
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

  const titleStyle = useMemo<CSSProperties>(
    () => ({
      margin: 0,
      marginBottom: isMapIdle
        ? isMobileLayout
          ? theme.spacing(0.5)
          : isTabletLayout
            ? theme.spacing(0.75)
            : theme.spacing(1.25)
        : 0,
      textAlign: isTabletLayout || isMobileLayout ? "center" : "left",
      width: "100%",
      color: "#2f2f2f",
      fontSize: isMobileLayout ? "0.78rem" : "0.88rem",
      fontWeight: 500,
      lineHeight: 1.25,
      letterSpacing: "0.01em",
    }),
    [isMapIdle, isMobileLayout, isTabletLayout, theme]
  );

  const subtitleStyle = useMemo<CSSProperties>(
    () => ({
      margin: 0,
      marginBottom: isMobileLayout
        ? theme.spacing(0.5)
        : isTabletLayout
          ? theme.spacing(1)
          : theme.spacing(2),
      textAlign: isTabletLayout || isMobileLayout ? "center" : "left",
      width: "100%",
      color: theme.palette.text.secondary,
      opacity: 0.9,
      fontSize: isMobileLayout ? "0.78rem" : "0.88rem",
      lineHeight: 1.25,
      fontWeight: 500,
      letterSpacing: "0.01em",
    }),
    [isMobileLayout, isTabletLayout, theme]
  );

  const stackStyles = useMemo(
    () => ({
      spacing: isMobileLayout
        ? theme.spacing(0.5)
        : isTabletLayout
          ? theme.spacing(2.5)
          : isMediumOrLargerLayout
            ? theme.spacing(1.25)
            : theme.spacing(1.5),
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

  return { titleStyle, subtitleStyle, stackStyles };
}
