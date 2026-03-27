import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import { alpha, styled } from "@mui/material/styles";

import {
  MAP_OVERLAY_FLOATING_TOOL_SIZE_DESKTOP,
  SCREENSHOT_BUTTON_SIZE,
} from "@/constants/map";
import { OVERLAY_POSITIONS } from "@/constants/ui";

/**
 * Fixed container for the screenshot control when used alone (legacy).
 * Prefer `MapOverlayToolsStack` for snapshot + reset; tablet still uses the legend header row.
 */
export const ScreenshotButtonContainer = styled(Box)(({ theme }) => ({
  position: "fixed",
  zIndex: theme.zIndex.appBar + 1,
  transition: theme.custom.transitions.normal,
  [theme.breakpoints.up("md")]: {
    left: theme.spacing(OVERLAY_POSITIONS.SCREENSHOT_BUTTON.LEFT_DESKTOP),
    top: theme.spacing(OVERLAY_POSITIONS.SCREENSHOT_BUTTON.TOP_DESKTOP),
    bottom: "auto",
    right: "auto",
  },
}));

/** Snapshot + reset: row on narrow viewports, column + larger controls from `md` (desktop). */
export const MapOverlayToolsStack = styled(Box)(({ theme }) => ({
  position: "fixed",
  zIndex: theme.zIndex.appBar + 1,
  transition: theme.custom.transitions.normal,
  display: "flex",
  alignItems: "flex-start",
  gap: theme.spacing(1),
  flexDirection: "row",
  left: theme.spacing(OVERLAY_POSITIONS.SCREENSHOT_BUTTON.LEFT_DESKTOP),
  top: theme.spacing(OVERLAY_POSITIONS.SCREENSHOT_BUTTON.TOP_DESKTOP),
  [theme.breakpoints.up("md")]: {
    flexDirection: "column",
    gap: theme.spacing(1.25),
  },
}));

/**
 * `data-variant="inline"` — legend header (tablet): matches collapse `IconButton`.
 * Default / floating — frosted circular control for desktop overlay.
 */
export const ScreenshotButton = styled(IconButton, {
  shouldForwardProp: () => true,
})(({ theme }) => {
  const accent = theme.palette.info.main;
  const L = theme.custom.legend.collapseIconButton;
  return {
    "&&": {
      padding: 0,
      position: "relative",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      color: accent,
    },
    '&&:not([data-variant="inline"])': {
      borderRadius: "50%",
      width: SCREENSHOT_BUTTON_SIZE,
      height: SCREENSHOT_BUTTON_SIZE,
      minWidth: SCREENSHOT_BUTTON_SIZE,
      minHeight: SCREENSHOT_BUTTON_SIZE,
      transition: "all 0.2s ease",
      backgroundColor: "rgba(255, 255, 255, 0.97)",
      backdropFilter: "blur(16px)",
      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
      border: "1px solid",
      borderColor: "rgba(226, 232, 240, 1)",
      "&, &:hover, &:focus, &:focus-visible, &:active": {
        borderRadius: "50%",
      },
      "& .MuiTouchRipple-root": {
        borderRadius: "50%",
      },
      "& .MuiTouchRipple-ripple": {
        borderRadius: "50%",
      },
      "&:hover": {
        backgroundColor: "rgba(86, 128, 165, 0.1)",
        borderColor: accent,
        outline: "none",
        boxShadow: "0 4px 20px rgba(86, 128, 165, 0.15)",
      },
      "&:focus": {
        outline: "none",
      },
      "&:focus-visible": {
        outline: `2px solid ${accent}`,
        outlineOffset: "2px",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
      },
      "&:active": {
        transform: "scale(0.95)",
      },
      "@media (prefers-reduced-motion: reduce)": {
        transition: "none",
        "&:active": {
          transform: "none",
        },
      },
      "& .MuiSvgIcon-root": {
        fontSize: "1.25rem",
      },
      [theme.breakpoints.up("md")]: {
        width: MAP_OVERLAY_FLOATING_TOOL_SIZE_DESKTOP,
        height: MAP_OVERLAY_FLOATING_TOOL_SIZE_DESKTOP,
        minWidth: MAP_OVERLAY_FLOATING_TOOL_SIZE_DESKTOP,
        minHeight: MAP_OVERLAY_FLOATING_TOOL_SIZE_DESKTOP,
        "& .MuiSvgIcon-root": {
          fontSize: "1.35rem",
        },
      },
      "&[data-tooltip]::after": {
        content: "attr(data-tooltip)",
        position: "absolute",
        left: `calc(100% + ${theme.custom.tooltip.offset + 2}px)`,
        top: "50%",
        transform: "translateY(-50%)",
        backgroundColor: theme.custom.colors.tooltipBackground,
        color: theme.custom.colors.tooltipText,
        padding: theme.custom.tooltip.padding,
        borderRadius: theme.custom.tooltip.borderRadius,
        fontSize: theme.custom.tooltip.fontSize,
        whiteSpace: "nowrap",
        pointerEvents: "none",
        opacity: 0,
        visibility: "hidden",
        transition: theme.custom.transitions.tooltip,
        zIndex: theme.custom.zIndex.tooltip,
        boxShadow: theme.custom.shadows.tooltip,
        [theme.breakpoints.down("md")]: {
          display: "none",
        },
      },
      "&[data-tooltip]:focus-visible::after, &[data-tooltip]:hover::after": {
        opacity: 1,
        visibility: "visible",
      },
      "&[data-tooltip]::before": {
        content: '""',
        position: "absolute",
        left: `calc(100% + ${theme.custom.tooltip.offset - 6}px)`,
        top: "50%",
        transform: "translateY(-50%)",
        width: 0,
        height: 0,
        borderTop: `${theme.custom.tooltip.arrowSize}px solid transparent`,
        borderBottom: `${theme.custom.tooltip.arrowSize}px solid transparent`,
        borderRight: `${theme.custom.tooltip.arrowSize}px solid ${theme.custom.colors.tooltipBackground}`,
        opacity: 0,
        visibility: "hidden",
        transition: theme.custom.transitions.tooltip,
        zIndex: theme.custom.zIndex.tooltipArrow,
        [theme.breakpoints.down("md")]: {
          display: "none",
        },
      },
      "&[data-tooltip]:focus-visible::before, &[data-tooltip]:hover::before": {
        opacity: 1,
        visibility: "visible",
      },
    },
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
      "&:hover": {
        backgroundColor: alpha(accent, 0.1),
        border: "none",
        boxShadow: "none",
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
    },
  };
});
