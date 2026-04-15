import type { CSSObject } from "@mui/material/styles";
import { alpha, type Theme } from "@mui/material/styles";

import {
  MAP_OVERLAY_FLOATING_TOOL_SIZE_DESKTOP,
  MAP_OVERLAY_FLOATING_TOOL_SIZE_PHONE,
  SCREENSHOT_BUTTON_SIZE,
} from "@/constants/map";
import { MAP_OVERLAY_LIGHT_PAPER_ALPHA } from "@/theme/mapTokens";
import { mapOverlayIconButtonTooltipStyles } from "@/theme/mapOverlayTooltipStyles";

/** Frosted circles + tool stack — matches `darkTheme` `palette.background.paper` (`nightPaper`). */
export function mapOverlayControlSurfaceBackground(theme: Theme): string {
  if (theme.palette.mode === "dark") {
    return theme.palette.background.paper;
  }
  return alpha(theme.palette.background.paper, MAP_OVERLAY_LIGHT_PAPER_ALPHA);
}

/** Optional extras on `.MuiSvgIcon-root` for floating (e.g. reset control alignment). */
export type MapOverlayFloatingSvgIconExtras = Pick<
  CSSObject,
  "lineHeight" | "display"
>;

/**
 * Shared `&&` root for map overlay circular / legend `IconButton`s (screenshot, reset, map style).
 */
export function mapOverlayIconButtonRootStyles(theme: Theme) {
  const accent = theme.palette.info.main;
  return {
    "&&": {
      padding: 0,
      position: "relative",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      color: accent,
    },
  };
}

/**
 * Frosted floating control (not `data-variant="inline"`): phone circles, `md+` larger until grouped overrides apply.
 */
export function mapOverlayIconButtonFloatingStyles(
  theme: Theme,
  options?: { floatingSvgIconExtras?: MapOverlayFloatingSvgIconExtras }
) {
  const accent = theme.palette.info.main;
  const disabledBg =
    theme.palette.mode === "dark"
      ? alpha(theme.palette.background.paper, 0.5)
      : alpha(theme.palette.background.paper, 0.6);
  const disabledBorder =
    theme.palette.mode === "dark"
      ? alpha(theme.palette.divider, 0.35)
      : alpha(theme.palette.divider, 0.55);
  const disabledIcon =
    theme.palette.mode === "dark"
      ? alpha(theme.palette.text.secondary, 0.45)
      : alpha(theme.palette.text.secondary, 0.5);
  const svgExtras = options?.floatingSvgIconExtras;

  return {
    '&&:not([data-variant="inline"])': {
      borderRadius: "50%",
      width: SCREENSHOT_BUTTON_SIZE,
      height: SCREENSHOT_BUTTON_SIZE,
      minWidth: SCREENSHOT_BUTTON_SIZE,
      minHeight: SCREENSHOT_BUTTON_SIZE,
      transition: "all 0.2s ease",
      backgroundColor: mapOverlayControlSurfaceBackground(theme),
      backdropFilter: "blur(16px)",
      boxShadow: theme.custom.shadows.medium,
      border: "1px solid",
      borderColor: theme.palette.divider,
      "&, &:hover, &:focus, &:focus-visible, &:active": {
        borderRadius: "50%",
      },
      "& .MuiTouchRipple-root": {
        borderRadius: "50%",
      },
      "& .MuiTouchRipple-ripple": {
        borderRadius: "50%",
      },
      "&:focus": {
        outline: "none",
      },
      "&:focus-visible": {
        outline: `2px solid ${accent}`,
        outlineOffset: "2px",
        boxShadow: theme.custom.shadows.medium,
      },
      "&:active": {
        transform: "scale(0.95)",
      },
      "&:disabled": {
        cursor: "not-allowed",
        pointerEvents: "none",
        backgroundColor: disabledBg,
        borderColor: disabledBorder,
        boxShadow: "none",
        color: disabledIcon,
        opacity: 1,
        transform: "none",
      },
      /* Only when the UA reports real hover (not touch-first). Avoid `pointer: fine` — it hides hover for some trackpads / hybrid setups. */
      "@media (hover: hover)": {
        "&:hover": {
          backgroundColor: alpha(accent, 0.12),
          borderColor: accent,
          outline: "none",
          boxShadow: `0 4px 20px ${alpha(accent, 0.22)}`,
        },
      },
      "@media (prefers-reduced-motion: reduce)": {
        transition: "none",
        "&:active": {
          transform: "none",
        },
      },
      "& .MuiSvgIcon-root": {
        fontSize: "1.25rem",
        ...svgExtras,
      },
      [theme.breakpoints.down("sm")]: {
        width: MAP_OVERLAY_FLOATING_TOOL_SIZE_PHONE,
        height: MAP_OVERLAY_FLOATING_TOOL_SIZE_PHONE,
        minWidth: MAP_OVERLAY_FLOATING_TOOL_SIZE_PHONE,
        minHeight: MAP_OVERLAY_FLOATING_TOOL_SIZE_PHONE,
        "& .MuiSvgIcon-root": {
          fontSize: "1.625rem",
          ...svgExtras,
        },
      },
      [theme.breakpoints.up("md")]: {
        width: MAP_OVERLAY_FLOATING_TOOL_SIZE_DESKTOP,
        height: MAP_OVERLAY_FLOATING_TOOL_SIZE_DESKTOP,
        minWidth: MAP_OVERLAY_FLOATING_TOOL_SIZE_DESKTOP,
        minHeight: MAP_OVERLAY_FLOATING_TOOL_SIZE_DESKTOP,
        "& .MuiSvgIcon-root": {
          fontSize: "1.35rem",
          ...svgExtras,
        },
      },
      ...mapOverlayIconButtonTooltipStyles(theme),
    },
  };
}

/**
 * Legend header row (`data-variant="inline"`): transparent icon buttons aligned with collapse control.
 */
export function mapOverlayIconButtonInlineStyles(theme: Theme) {
  const accent = theme.palette.info.main;
  const inlineDisabledIcon =
    theme.palette.mode === "dark"
      ? alpha(theme.palette.text.secondary, 0.4)
      : alpha(theme.palette.text.secondary, 0.45);
  const L = theme.custom.legend.collapseIconButton;
  return {
    '&&[data-variant="inline"]': {
      width: L.size,
      height: L.size,
      minWidth: L.size,
      minHeight: L.size,
      flexShrink: 0,
      borderRadius: 4,
      backgroundColor: "transparent",
      backdropFilter: "none",
      border: "none",
      boxShadow: "none",
      transition: theme.custom.transitions.color,
      "@media (hover: hover)": {
        "&:hover": {
          backgroundColor: alpha(accent, 0.1),
          border: "none",
          boxShadow: "none",
        },
      },
      "&:focus": {
        outline: "none",
      },
      "&:focus-visible": {
        outline: `2px solid ${accent}`,
        outlineOffset: "2px",
        boxShadow: "none",
      },
      "&:active": {
        transform: "none",
      },
      "&:disabled": {
        cursor: "not-allowed",
        pointerEvents: "none",
        color: inlineDisabledIcon,
        backgroundColor: "transparent",
        boxShadow: "none",
        opacity: 1,
      },
      "@media (prefers-reduced-motion: reduce)": {
        transition: "none",
      },
      "& .MuiSvgIcon-root": {
        fontSize: L.iconFontSize,
      },
      "& .MuiTouchRipple-root": {
        borderRadius: 4,
      },
      "& .MuiTouchRipple-ripple": {
        borderRadius: 4,
      },
      ...mapOverlayIconButtonTooltipStyles(theme),
    },
  };
}
