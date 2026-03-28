/**
 * Legend footer attribution block — matches reference Typography `p` styles.
 * Light mode: muted slate; dark mode: lighter slate so text reads on night legend paper.
 */

import type { SxProps, Theme } from "@mui/material/styles";

import { MAP_MUTED_SLATE_RGBA } from "@/constants/map";

export function getLegendAttributionTypographySx(theme: Theme): SxProps<Theme> {
  const isDark = theme.palette.mode === "dark";
  return {
    fontSize: "9px",
    lineHeight: 1.4,
    fontWeight: 400,
    color: isDark ? "rgba(203, 213, 225, 0.9)" : MAP_MUTED_SLATE_RGBA,
  };
}

export function getAttributionLinkInlineSx(theme: Theme): SxProps<Theme> {
  const isDark = theme.palette.mode === "dark";
  return {
    color: "inherit",
    fontSize: "inherit",
    lineHeight: "inherit",
    fontWeight: "inherit",
    textDecoration: "none",
    "&:hover": {
      color: isDark ? "rgba(241, 245, 249, 0.95)" : "#64748b",
    },
    "&:focus-visible": {
      outline: "2px solid",
      outlineColor: isDark ? "#cbd5e1" : "#64748b",
      outlineOffset: "2px",
      borderRadius: "2px",
    },
  };
}
