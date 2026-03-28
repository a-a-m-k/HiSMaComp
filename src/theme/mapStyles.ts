/**
 * Map-related style generators: container focus ring, navigation control, tooltips.
 * Split from constants/ui so theme and map tokens live with theme; constants stay pure.
 */
import { Theme, alpha } from "@mui/material/styles";
import {
  MAP_NAV_CONTROL_BUTTON_PX,
  MAP_NAV_CONTROL_ICON_PX,
} from "@/constants/map";
import { mapOverlayControlSurfaceBackground } from "@/theme/mapOverlayIconButtonSharedStyles";
import { getTooltipStyles } from "@/theme/mapTooltipShared";
import { Z_INDEX, TRANSITIONS } from "./themeValues";

export {
  getTooltipStyles,
  type MapTooltipPosition,
  type TooltipStylesOptions,
} from "@/theme/mapTooltipShared";

export function getMapContainerStyles(themeArg: Theme): string {
  const focusRing = themeArg.custom.colors.focusBlue;

  return `
  #map-container-area {
    position: relative;
  }
  #map-container-area::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border: 3px solid transparent;
    border-radius: 0;
    pointer-events: none;
    z-index: ${Z_INDEX.MAP_CONTAINER_FOCUS};
    transition: ${TRANSITIONS.BORDER};
    box-sizing: border-box;
  }
  #map-container-area:focus-visible {
    outline: none !important;
    box-shadow: 0 0 0 3px ${focusRing} !important;
  }
  #map-container-area:focus-visible::before {
    border: 3px solid ${focusRing} !important;
    box-shadow: 0 0 3px 3px ${focusRing} !important;
    z-index: ${Z_INDEX.MAP_CONTAINER_FOCUS_OVERLAY} !important;
  }
  #map-container-area:focus:not(:focus-visible)::before {
    border-color: transparent !important;
    box-shadow: none !important;
  }
  #map-container-area:focus {
    outline: none !important;
  }
`;
}

export function getNavigationControlStyles(themeArg: Theme): string {
  const gutter = themeArg.spacing(3);
  const info = themeArg.palette.info.main;
  const frostedSurface = mapOverlayControlSurfaceBackground(themeArg);
  const borderPaper = themeArg.palette.divider;
  const hoverBg = alpha(info, 0.12);
  const controlShadow =
    themeArg.custom?.shadows?.medium ?? "0 4px 20px rgba(0, 0, 0, 0.08)";

  const zoomInSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${MAP_NAV_CONTROL_ICON_PX}" height="${MAP_NAV_CONTROL_ICON_PX}" viewBox="0 0 24 24" fill="none" stroke="${info}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`;
  const zoomOutSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${MAP_NAV_CONTROL_ICON_PX}" height="${MAP_NAV_CONTROL_ICON_PX}" viewBox="0 0 24 24" fill="none" stroke="${info}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>`;
  const zoomInUrl = `url('data:image/svg+xml;charset=utf-8,${encodeURIComponent(zoomInSvg)}')`;
  const zoomOutUrl = `url('data:image/svg+xml;charset=utf-8,${encodeURIComponent(zoomOutSvg)}')`;

  return `
  .maplibregl-ctrl-bottom-right {
    bottom: ${gutter} !important;
    right: ${gutter} !important;
  }

  .maplibregl-ctrl-bottom-right .maplibregl-ctrl {
    margin: 0 !important;
  }

  .maplibregl-ctrl-group {
    z-index: ${Z_INDEX.MAP + 10} !important;
    position: relative !important;
    background: ${frostedSurface} !important;
    backdrop-filter: blur(16px) !important;
    -webkit-backdrop-filter: blur(16px) !important;
    border: 1px solid ${borderPaper} !important;
    box-shadow: ${controlShadow} !important;
    border-radius: ${themeArg.spacing(1)} !important;
    overflow: visible !important;
    display: flex !important;
    flex-direction: column !important;
    box-sizing: border-box !important;
  }

  .maplibregl-ctrl-group button {
    pointer-events: auto !important;
    z-index: ${Z_INDEX.MAP + 11} !important;
    position: relative !important;
    cursor: pointer !important;
    width: ${MAP_NAV_CONTROL_BUTTON_PX}px !important;
    height: ${MAP_NAV_CONTROL_BUTTON_PX}px !important;
    min-width: ${MAP_NAV_CONTROL_BUTTON_PX}px !important;
    min-height: ${MAP_NAV_CONTROL_BUTTON_PX}px !important;
    max-width: ${MAP_NAV_CONTROL_BUTTON_PX}px !important;
    max-height: ${MAP_NAV_CONTROL_BUTTON_PX}px !important;
    box-sizing: border-box !important;
    flex-shrink: 0 !important;
    flex-grow: 0 !important;
    margin: 0 !important;
    padding: 0 !important;
    background-color: transparent !important;
    border: none !important;
    transition: background-color 0.2s ease !important;
  }

  .maplibregl-ctrl-group button + button {
    border-top: 1px solid ${borderPaper} !important;
  }

  .maplibregl-ctrl-icon {
    background-size: ${MAP_NAV_CONTROL_ICON_PX}px !important;
    background-position: center !important;
  }

  .maplibregl-ctrl-zoom-in .maplibregl-ctrl-icon {
    background-image: ${zoomInUrl} !important;
  }

  .maplibregl-ctrl-zoom-out .maplibregl-ctrl-icon {
    background-image: ${zoomOutUrl} !important;
  }

  .maplibregl-ctrl-group button:hover {
    background-color: ${hoverBg} !important;
  }

  .maplibregl-ctrl-group button:focus {
    outline: none !important;
  }

  .maplibregl-ctrl-group button:focus-visible {
    outline: 2px solid ${info} !important;
    outline-offset: -2px !important;
  }

  .maplibregl-ctrl-group button[title] {
    position: relative;
  }
  .maplibregl-ctrl-group button[title]:hover::before,
  .maplibregl-ctrl-group button[title]:focus::before {
    content: none !important;
  }

  @media (max-width: 959px) {
    .maplibregl-ctrl-bottom-right {
      display: none !important;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .maplibregl-ctrl-group button {
      transition: none !important;
    }
  }

  /* Zoom-out button styled as disabled when at min zoom */
  [data-zoom-at-min] .maplibregl-ctrl-zoom-out {
    opacity: 0.5 !important;
    cursor: not-allowed !important;
    pointer-events: none !important;
  }
  [data-zoom-at-min] .maplibregl-ctrl-zoom-out[data-tooltip]::after,
  [data-zoom-at-min] .maplibregl-ctrl-zoom-out[data-tooltip]::before {
    display: none !important;
  }

  ${getTooltipStyles(
    {
      position: "left",
      selector: ".maplibregl-ctrl-group button[data-tooltip]",
    },
    themeArg
  )}
  `;
}

/** Hide zoom control when overlay buttons are hidden (e.g. during resize). Uses theme overlayFade transition. */
function getOverlayButtonsHiddenStyles(): string {
  return `
  [data-overlay-buttons-hidden] .maplibregl-ctrl-bottom-right {
    opacity: 0 !important;
    visibility: hidden !important;
    pointer-events: none !important;
    transition: ${TRANSITIONS.OVERLAY_FADE};
  }
`;
}

/** Combined map styles: container + navigation controls. Use a single <style> tag in MapView. */
export function getMapStyles(themeArg: Theme): string {
  return `${getNavigationControlStyles(themeArg)}\n${getMapContainerStyles(themeArg)}\n${getOverlayButtonsHiddenStyles()}`;
}
