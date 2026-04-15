import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import { styled } from "@mui/material/styles";

import { MAP_NAV_CONTROL_BUTTON_PX } from "@/constants/map";
import { OVERLAY_POSITIONS } from "@/constants/ui";
import {
  mapOverlayControlSurfaceBackground,
  mapOverlayIconButtonFloatingStyles,
  mapOverlayIconButtonInlineStyles,
  mapOverlayIconButtonRootStyles,
} from "@/theme/mapOverlayIconButtonSharedStyles";
import { mapOverlayNavGroupIconButtonStyles } from "@/theme/mapOverlayNavGroupStyles";

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

/**
 * Snapshot + reset + map style: phone = right-aligned column above timeline; `sm`–`md` = row; `md+` = column grouped like MapLibre zoom (`.maplibregl-ctrl-group`).
 * Phone: bottom-right (safe area), stacked above the fixed timeline (see `--timeline-height-mobile` in index.css).
 */
export const MapOverlayToolsStack = styled(Box)(({ theme }) => ({
  position: "fixed",
  zIndex: theme.custom.zIndex.floatingButton,
  transition: theme.custom.transitions.normal,
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  flexDirection: "row",
  left: theme.spacing(OVERLAY_POSITIONS.SCREENSHOT_BUTTON.LEFT_DESKTOP),
  top: theme.spacing(OVERLAY_POSITIONS.SCREENSHOT_BUTTON.TOP_DESKTOP),
  [theme.breakpoints.down("sm")]: {
    left: "auto",
    top: "auto",
    right: `max(${theme.spacing(2)}, env(safe-area-inset-right, 0px))`,
    transform: "none",
    /** Timeline uses bottom: max(8px, safe-area); lift stack by timeline height + gap. */
    bottom: `calc(var(--timeline-height-mobile) + max(${theme.spacing(1)}, env(safe-area-inset-bottom, 0px)) + ${theme.spacing(1.5)})`,
    flexDirection: "column",
    alignItems: "flex-end",
    justifyContent: "center",
  },
  [theme.breakpoints.up("md")]: {
    flexDirection: "column",
    alignItems: "stretch",
    gap: 0,
    alignSelf: "flex-start",
    width: MAP_NAV_CONTROL_BUTTON_PX,
    backgroundColor: mapOverlayControlSurfaceBackground(theme),
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    border: `1px solid ${theme.palette.divider}`,
    boxShadow: theme.custom.shadows.medium,
    borderRadius: theme.spacing(1),
    overflow: "visible",
    "& > .MuiIconButton-root + .MuiIconButton-root": {
      borderTop: `1px solid ${theme.palette.divider}`,
    },
  },
}));

/**
 * `data-variant="inline"` — legend header (tablet): matches collapse `IconButton`.
 * Default / floating — frosted circles on small screens; in `MapOverlayToolsStack` at `md+`, matches zoom `.maplibregl-ctrl-group`.
 */
export const ScreenshotButton = styled(IconButton, {
  shouldForwardProp: () => true,
})(({ theme }) => ({
  ...mapOverlayIconButtonRootStyles(theme),
  ...mapOverlayIconButtonFloatingStyles(theme),
  ...mapOverlayNavGroupIconButtonStyles(theme),
  ...mapOverlayIconButtonInlineStyles(theme),
}));
