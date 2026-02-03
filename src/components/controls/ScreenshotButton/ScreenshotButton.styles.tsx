import { Box, IconButton, styled } from "@mui/material";

import { FLOATING_BUTTON_SIZE } from "@/constants";
import { BORDER_RADIUS, OVERLAY_POSITIONS } from "@/constants/ui";
import { SIZING_CONSTANTS } from "@/constants/sizing";

/**
 * Container for the screenshot button with responsive positioning.
 *
 * Positioning Strategy:
 * - Desktop: Fixed at top-left corner
 * - Tablet: Fixed at bottom-right, above timeline (uses CSS variable for bottom calculation)
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
      right: theme.spacing(OVERLAY_POSITIONS.SCREENSHOT_BUTTON.RIGHT_TABLET),
      bottom: "var(--screenshot-button-tablet-bottom)",
      top: "auto",
      left: "auto",
    },
  },
}));

/**
 * Styled screenshot button matching MapLibre control container appearance.
 * Border radius matches MapLibre controls (4px) for visual consistency.
 */
export const ScreenshotButton = styled(IconButton, {
  shouldForwardProp: () => true,
})(({ theme }) => ({
  "&&": {
    borderRadius: `${BORDER_RADIUS.CONTROL}px`,
    width: FLOATING_BUTTON_SIZE,
    height: FLOATING_BUTTON_SIZE,
    minWidth: FLOATING_BUTTON_SIZE,
    minHeight: FLOATING_BUTTON_SIZE,
    padding: 0,
    color: theme.palette.text.primary,
    background: theme.custom.colors.buttonBackground,
    boxShadow: theme.custom.shadows.controlOutline,
    border: `1px solid ${theme.custom.colors.controlBorder}`,
    position: "relative",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    transition: theme.custom.transitions.normal,
  },
  "&, &:hover, &:focus, &:focus-visible, &:active": {
    borderRadius: `${BORDER_RADIUS.CONTROL}px`,
  },
  "& .MuiTouchRipple-root": {
    borderRadius: `${BORDER_RADIUS.CONTROL}px`,
  },
  "& .MuiTouchRipple-ripple": {
    borderRadius: `${BORDER_RADIUS.CONTROL}px`,
  },
  "&:hover": {
    backgroundColor: theme.custom.colors.buttonHover,
    border: `1px solid ${theme.custom.colors.controlBorder}`,
    outline: "none",
    boxShadow: theme.custom.shadows.controlOutline,
  },
  "&:focus": {
    backgroundColor: theme.custom.colors.buttonHover,
    outline: "none",
    boxShadow: theme.custom.shadows.controlOutline,
  },
  "&:focus-visible": {
    outline: "none",
    boxShadow: `0 0 2px 2px ${theme.custom.colors.focusBlue}`,
  },
  "&:active": {
    backgroundColor: theme.custom.colors.buttonActive,
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
  [theme.breakpoints.up("xl")]: {
    width: FLOATING_BUTTON_SIZE * SIZING_CONSTANTS.XL_SIZE_MULTIPLIER,
    height: FLOATING_BUTTON_SIZE * SIZING_CONSTANTS.XL_SIZE_MULTIPLIER,
    minWidth: FLOATING_BUTTON_SIZE * SIZING_CONSTANTS.XL_SIZE_MULTIPLIER,
    minHeight: FLOATING_BUTTON_SIZE * SIZING_CONSTANTS.XL_SIZE_MULTIPLIER,
  },
}));
