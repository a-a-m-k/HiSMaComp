import { alpha, type Theme } from "@mui/material/styles";

import {
  MAP_NAV_CONTROL_BUTTON_PX,
  MAP_NAV_CONTROL_ICON_PX,
} from "@/constants/map";

/**
 * IconButton rules when nested in `MapOverlayToolsStack` (`data-map-overlay-tool-group`)
 * at `md+`: zoom-style column cells + first/last corner radii.
 * Used by `ScreenshotButton` and `MapResetViewControl` (single source; avoid drift).
 */
export function mapOverlayNavGroupIconButtonStyles(theme: Theme) {
  const accent = theme.palette.info.main;
  return {
    '[data-map-overlay-tool-group="true"] &&:not([data-variant="inline"])': {
      [theme.breakpoints.up("md")]: {
        borderRadius: 0,
        width: MAP_NAV_CONTROL_BUTTON_PX,
        height: MAP_NAV_CONTROL_BUTTON_PX,
        minWidth: MAP_NAV_CONTROL_BUTTON_PX,
        minHeight: MAP_NAV_CONTROL_BUTTON_PX,
        maxWidth: MAP_NAV_CONTROL_BUTTON_PX,
        maxHeight: MAP_NAV_CONTROL_BUTTON_PX,
        transition: "background-color 0.2s ease",
        backgroundColor: "transparent",
        backdropFilter: "none",
        border: "none",
        boxShadow: "none",
        "&, &:hover, &:focus, &:focus-visible, &:active": {
          borderRadius: 0,
        },
        "& .MuiTouchRipple-root": {
          borderRadius: 0,
        },
        "& .MuiTouchRipple-ripple": {
          borderRadius: 0,
        },
        "&:hover": {
          backgroundColor: alpha(accent, 0.12),
          borderColor: "transparent",
          outline: "none",
          boxShadow: "none",
        },
        "&:focus-visible": {
          outline: `2px solid ${accent}`,
          outlineOffset: "-2px",
          boxShadow: "none",
        },
        "&:active": {
          transform: "none",
        },
        "@media (prefers-reduced-motion: reduce)": {
          transition: "none",
        },
        "& .MuiSvgIcon-root": {
          fontSize: `${MAP_NAV_CONTROL_ICON_PX}px`,
        },
      },
    },
    '[data-map-overlay-tool-group="true"] > &:first-of-type': {
      [theme.breakpoints.up("md")]: {
        borderTopLeftRadius: theme.spacing(1),
        borderTopRightRadius: theme.spacing(1),
      },
    },
    '[data-map-overlay-tool-group="true"] > &:last-of-type': {
      [theme.breakpoints.up("md")]: {
        borderBottomLeftRadius: theme.spacing(1),
        borderBottomRightRadius: theme.spacing(1),
      },
    },
  };
}
