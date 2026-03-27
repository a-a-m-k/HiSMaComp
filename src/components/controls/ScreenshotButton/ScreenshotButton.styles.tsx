import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import { styled } from "@mui/material/styles";

import { SCREENSHOT_BUTTON_DESKTOP_SIZE } from "@/constants/map";
import { OVERLAY_POSITIONS } from "@/constants/ui";

/**
 * Container for the screenshot button with responsive positioning.
 *
 * Positioning Strategy:
 * - Desktop: Fixed at top-left corner
 * - Tablet: Fixed at bottom-left, above timeline — same horizontal inset as Timeline (`sm` ≈ 2rem)
 * - Mobile: Not rendered (handled in MapView component)
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
  [theme.breakpoints.between("sm", "md")]: {
    "&&": {
      left: theme.spacing(OVERLAY_POSITIONS.SCREENSHOT_BUTTON.LEFT_TABLET),
      right: "auto",
      bottom: "var(--screenshot-button-tablet-bottom)",
      top: "auto",
    },
  },
}));

/** Visual style aligned with map export control (frosted circular control + slate accent). */
export const ScreenshotButton = styled(IconButton, {
  shouldForwardProp: () => true,
})(({ theme }) => {
  const accent = theme.palette.info.main;
  return {
    "&&": {
      borderRadius: "50%",
      width: 44,
      height: 44,
      minWidth: 44,
      minHeight: 44,
      padding: 0,
      [theme.breakpoints.up("md")]: {
        width: SCREENSHOT_BUTTON_DESKTOP_SIZE,
        height: SCREENSHOT_BUTTON_DESKTOP_SIZE,
        minWidth: SCREENSHOT_BUTTON_DESKTOP_SIZE,
        minHeight: SCREENSHOT_BUTTON_DESKTOP_SIZE,
      },
      color: accent,
      backgroundColor: "rgba(255, 255, 255, 0.97)",
      backdropFilter: "blur(16px)",
      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
      border: "1px solid",
      borderColor: "rgba(226, 232, 240, 1)",
      position: "relative",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      transition: "all 0.2s ease",
    },
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
  };
});
