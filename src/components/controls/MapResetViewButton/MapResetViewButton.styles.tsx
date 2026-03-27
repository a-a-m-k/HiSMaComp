import IconButton from "@mui/material/IconButton";
import { alpha, styled } from "@mui/material/styles";

import {
  MAP_OVERLAY_FLOATING_TOOL_SIZE_DESKTOP,
  SCREENSHOT_BUTTON_SIZE,
} from "@/constants/map";

/**
 * Mirrors `ScreenshotButton` frosted / inline legend styles (no screenshot tooltip).
 */
export const MapResetViewControl = styled(IconButton, {
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
