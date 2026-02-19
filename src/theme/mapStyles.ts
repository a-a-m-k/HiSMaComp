/**
 * Map-related style generators: container focus ring, navigation control, tooltips.
 * Split from constants/ui so theme and style logic live with theme; constants stay pure.
 */
import { Theme } from "@mui/material/styles";
import {
  COLORS,
  Z_INDEX,
  TRANSITIONS,
  SHADOWS,
  TOOLTIP_STYLES,
} from "./themeValues";
import {
  OVERLAY_POSITIONS,
  NAVIGATION_CONTROL_STYLES,
} from "@/constants/uiConstants";

type TooltipPosition = "top" | "right";

export interface TooltipStylesOptions {
  position: TooltipPosition;
  selector: string;
}

function getTooltipContentStyles(options: TooltipStylesOptions): string {
  const { position, selector } = options;

  if (position === "top") {
    return `
      ${selector}::after {
        content: attr(data-tooltip);
        position: absolute;
        bottom: calc(100% + ${TOOLTIP_STYLES.OFFSET}px);
        right: 0;
        background-color: ${COLORS.TOOLTIP_BACKGROUND};
        color: ${COLORS.TOOLTIP_TEXT};
        padding: ${TOOLTIP_STYLES.PADDING};
        border-radius: ${TOOLTIP_STYLES.BORDER_RADIUS};
        font-size: ${TOOLTIP_STYLES.FONT_SIZE};
        white-space: nowrap;
        pointer-events: none;
        opacity: 0;
        visibility: hidden;
        transition: ${TRANSITIONS.TOOLTIP};
        z-index: ${Z_INDEX.TOOLTIP};
        box-shadow: ${SHADOWS.TOOLTIP};
      }
    `;
  }
  return `
    ${selector}::after {
      content: attr(data-tooltip);
      position: absolute;
      left: calc(100% + ${TOOLTIP_STYLES.OFFSET + 2}px);
      top: 50%;
      transform: translateY(-50%);
      background-color: ${COLORS.TOOLTIP_BACKGROUND};
      color: ${COLORS.TOOLTIP_TEXT};
      padding: ${TOOLTIP_STYLES.PADDING};
      border-radius: ${TOOLTIP_STYLES.BORDER_RADIUS};
      font-size: ${TOOLTIP_STYLES.FONT_SIZE};
      white-space: nowrap;
      pointer-events: none;
      opacity: 0;
      visibility: hidden;
      transition: ${TRANSITIONS.TOOLTIP};
      z-index: ${Z_INDEX.TOOLTIP};
      box-shadow: ${SHADOWS.TOOLTIP};
    }
  `;
}

function getTooltipArrowStyles(options: TooltipStylesOptions): string {
  const { position, selector } = options;

  if (position === "top") {
    return `
      ${selector}::before {
        content: '';
        position: absolute;
        bottom: calc(100% + ${TOOLTIP_STYLES.OFFSET - 6}px);
        right: ${TOOLTIP_STYLES.ARROW_OFFSET}px;
        width: 0;
        height: 0;
        border-left: ${TOOLTIP_STYLES.ARROW_SIZE}px solid transparent;
        border-right: ${TOOLTIP_STYLES.ARROW_SIZE}px solid transparent;
        border-top: ${TOOLTIP_STYLES.ARROW_SIZE}px solid ${COLORS.TOOLTIP_BACKGROUND};
        opacity: 0;
        visibility: hidden;
        transition: ${TRANSITIONS.TOOLTIP};
        z-index: ${Z_INDEX.TOOLTIP_ARROW};
      }
    `;
  }
  return `
    ${selector}::before {
      content: '';
      position: absolute;
      left: calc(100% + ${TOOLTIP_STYLES.OFFSET - 6}px);
      top: 50%;
      transform: translateY(-50%);
      width: 0;
      height: 0;
      border-top: ${TOOLTIP_STYLES.ARROW_SIZE}px solid transparent;
      border-bottom: ${TOOLTIP_STYLES.ARROW_SIZE}px solid transparent;
      border-right: ${TOOLTIP_STYLES.ARROW_SIZE}px solid ${COLORS.TOOLTIP_BACKGROUND};
      opacity: 0;
      visibility: hidden;
      transition: ${TRANSITIONS.TOOLTIP};
      z-index: ${Z_INDEX.TOOLTIP_ARROW};
    }
  `;
}

export function getTooltipStyles(
  options: TooltipStylesOptions,
  themeArg?: Theme
): string {
  const { selector } = options;
  const mdBreakpoint = themeArg ? themeArg.breakpoints.values.md - 1 : 900;

  return `
    ${getTooltipContentStyles(options)}
    ${getTooltipArrowStyles(options)}
    @media (max-width: ${mdBreakpoint}px) {
      ${selector}::after,
      ${selector}::before {
        display: none !important;
      }
    }
    ${selector}:focus-visible::after,
    ${selector}:hover::after {
      opacity: 1;
      visibility: visible;
    }
    ${selector}:focus-visible::before,
    ${selector}:hover::before {
      opacity: 1;
      visibility: visible;
    }
  `;
}

export function getMapContainerStyles(): string {
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
    box-shadow: 0 0 0 3px ${COLORS.FOCUS_BLUE} !important;
  }
  #map-container-area:focus-visible::before {
    border: 3px solid ${COLORS.FOCUS_BLUE} !important;
    box-shadow: 0 0 3px 3px ${COLORS.FOCUS_BLUE} !important;
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
  const timelineBottomSpacing = themeArg.spacing(
    OVERLAY_POSITIONS.TIMELINE.BOTTOM
  );
  const navigationButtonHeight = `calc(${NAVIGATION_CONTROL_STYLES.CONTAINER_HEIGHT_DESKTOP}px / 3)`;

  return `
  .maplibregl-ctrl-bottom-right {
    bottom: ${timelineBottomSpacing} !important;
    right: ${themeArg.spacing(OVERLAY_POSITIONS.TIMELINE.HORIZONTAL)} !important;
  }

  .maplibregl-ctrl-bottom-right .maplibregl-ctrl {
    margin: 0 !important;
  }
  
  .maplibregl-ctrl-group {
    z-index: ${Z_INDEX.MAP + 10} !important;
    position: relative !important;
    height: ${NAVIGATION_CONTROL_STYLES.CONTAINER_HEIGHT_DESKTOP}px !important;
    max-height: ${NAVIGATION_CONTROL_STYLES.CONTAINER_HEIGHT_DESKTOP}px !important;
    box-sizing: border-box !important;
    overflow: visible !important;
    display: flex !important;
    flex-direction: column !important;
    justify-content: flex-end !important;
  }
    
    .maplibregl-ctrl-group button {
      pointer-events: auto !important;
      z-index: ${Z_INDEX.MAP + 11} !important;
      position: relative !important;
      cursor: pointer !important;
      width: ${navigationButtonHeight} !important;
      height: ${navigationButtonHeight} !important;
      min-width: ${navigationButtonHeight} !important;
      min-height: ${navigationButtonHeight} !important;
      max-width: ${navigationButtonHeight} !important;
      max-height: ${navigationButtonHeight} !important;
      box-sizing: border-box !important;
      flex-shrink: 0 !important;
      flex-grow: 0 !important;
      border: none !important;
      margin: 0 !important;
      padding: 0 !important;
    }
    .maplibregl-ctrl-group button[title] {
      position: relative;
    }
    .maplibregl-ctrl-group button[title]:hover::before,
    .maplibregl-ctrl-group button[title]:focus::before {
      content: none !important;
    }

    ${getTooltipStyles({
      position: "top",
      selector: ".maplibregl-ctrl-group button[data-tooltip]",
    })}
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
  return `${getNavigationControlStyles(themeArg)}\n${getMapContainerStyles()}\n${getOverlayButtonsHiddenStyles()}`;
}
