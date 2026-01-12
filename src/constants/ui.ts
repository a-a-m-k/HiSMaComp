import { Theme } from "@mui/material/styles";
import { SIZING_CONSTANTS } from "./sizing";
import theme from "@/theme/theme";

/**
 * Color constants exported from theme.
 * Use these for MapLibre controls and other non-theme-aware components.
 * For MUI components, prefer theme.custom.colors directly.
 */
export const COLORS = {
  FOCUS: theme.custom.colors.focus,
  FOCUS_HOVER: theme.custom.colors.focusHover,
  FOCUS_SHADOW: theme.custom.colors.focusShadow,
  FOCUS_SHADOW_INSET: theme.custom.colors.focusShadowInset,
  TEXT_BLACK: theme.custom.colors.textBlack,
  TOOLTIP_BACKGROUND: theme.custom.colors.tooltipBackground,
  TOOLTIP_TEXT: theme.custom.colors.tooltipText,
  BUTTON_BACKGROUND: theme.custom.colors.buttonBackground,
  BUTTON_HOVER: theme.custom.colors.buttonHover,
  BUTTON_ACTIVE: theme.custom.colors.buttonActive,
  FOCUS_BLUE: theme.custom.colors.focusBlue,
  CONTROL_BORDER: theme.custom.colors.controlBorder,
} as const;

/**
 * Z-index constants exported from theme.
 * Use these for MapLibre controls and other non-theme-aware components.
 * For MUI components, prefer theme.custom.zIndex directly.
 */
export const Z_INDEX = {
  MAP: theme.custom.zIndex.map,
  MAP_CONTAINER_FOCUS: theme.custom.zIndex.mapContainerFocus,
  MAP_CONTAINER_FOCUS_OVERLAY: theme.custom.zIndex.mapContainerFocusOverlay,
  LEGEND: theme.custom.zIndex.legend,
  TIMELINE: theme.custom.zIndex.timeline,
  FLOATING_BUTTON: theme.custom.zIndex.floatingButton,
  MODAL: theme.custom.zIndex.modal,
  TOOLTIP: theme.custom.zIndex.tooltip,
  TOOLTIP_ARROW: theme.custom.zIndex.tooltipArrow,
  PERFORMANCE_MONITOR: theme.custom.zIndex.performanceMonitor,
  FOCUSED_MARKER: theme.custom.zIndex.focusedMarker,
  FOCUSED_MARKER_LABEL: theme.custom.zIndex.focusedMarkerLabel,
} as const;

export const BORDER_RADIUS = {
  SMALL: 2,
  CONTROL: 4, // Match MapLibre control container
  MEDIUM: 8,
  LARGE: 12,
  CIRCULAR: "50%",
} as const;

export const SPACING = {
  XS: 0.5,
  SM: 1,
  MD: 1.5,
  LG: 2,
  XL: 3,
  XXL: 4,
} as const;

export const COMPONENT_WIDTHS = {
  MOBILE: "100%",
  TABLET: "80%",
  DESKTOP: "20%",
  DESKTOP_MIN: "240px",
} as const;

export const LEGEND_WIDTHS = {
  MOBILE: "100%",
  TABLET: "100%",
  DESKTOP: "22%",
  DESKTOP_MAX: "360px",
} as const;

export const LEGEND_WIDTH_CALCULATIONS = {
  LARGE_TABLET: { percentage: 0.21, min: 250 },
  DESKTOP: { percentage: 0.22, min: 260 },
} as const;

export const TIMELINE_WIDTHS = {
  MOBILE: "100%",
  TABLET: "85%",
  DESKTOP: "60%",
} as const;

export const RESPONSIVE_PADDING = {
  MOBILE: 0.75,
  TABLET: 1.5,
  DESKTOP: 2.25,
  XL: 2.75,
} as const;

/**
 * Transition constants exported from theme.
 * Use these for MapLibre controls and other non-theme-aware components.
 * For MUI components, prefer theme.custom.transitions directly.
 */
export const TRANSITIONS = {
  FAST: theme.custom.transitions.fast,
  NORMAL: theme.custom.transitions.normal,
  SLOW: theme.custom.transitions.slow,
  COLOR: theme.custom.transitions.color,
  OPACITY: theme.custom.transitions.opacity,
  TRANSFORM: theme.custom.transitions.transform,
  TOOLTIP: theme.custom.transitions.tooltip,
  BORDER: theme.custom.transitions.border,
} as const;

/**
 * Shadow constants exported from theme.
 * Use these for MapLibre controls and other non-theme-aware components.
 * For MUI components, prefer theme.custom.shadows directly.
 */
export const SHADOWS = {
  LIGHT: theme.custom.shadows.light,
  MEDIUM: theme.custom.shadows.medium,
  HEAVY: theme.custom.shadows.heavy,
  TOOLTIP: theme.custom.shadows.tooltip,
  BUTTON_HOVER: theme.custom.shadows.buttonHover,
  BUTTON_DEFAULT: theme.custom.shadows.buttonDefault,
  BUTTON_ACTIVE: theme.custom.shadows.buttonActive,
  CONTROL_OUTLINE: theme.custom.shadows.controlOutline,
} as const;

export const OPACITY = {
  DISABLED: 0.7,
  HOVER: 0.8,
  FOCUS: 0.9,
  ACTIVE: 1,
} as const;

export const NAVIGATION_CONTROL_STYLES = {
  BOTTOM_PADDING: SIZING_CONSTANTS.SPACING.BOTTOM_PADDING,
  BUTTON_SIZE: SIZING_CONSTANTS.NAVIGATION_CONTROL_SIZE,
  FONT_SIZE: {
    DEFAULT: 14,
    XL: 16,
  },
} as const;

/**
 * Tooltip style constants exported from theme.
 * Use these for MapLibre controls and other non-theme-aware components.
 * For MUI components, prefer theme.custom.tooltip directly.
 */
export const TOOLTIP_STYLES = {
  PADDING: theme.custom.tooltip.padding,
  BORDER_RADIUS: theme.custom.tooltip.borderRadius,
  FONT_SIZE: theme.custom.tooltip.fontSize,
  ARROW_SIZE: theme.custom.tooltip.arrowSize,
  OFFSET: theme.custom.tooltip.offset,
  ARROW_OFFSET: theme.custom.tooltip.arrowOffset,
} as const;

type TooltipPosition = "top" | "right";

interface TooltipStylesOptions {
  position: TooltipPosition;
  selector: string;
}

const getTooltipContentStyles = (options: TooltipStylesOptions): string => {
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
  } else {
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
};

const getTooltipArrowStyles = (options: TooltipStylesOptions): string => {
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
  } else {
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
};

export const getTooltipStyles = (
  options: TooltipStylesOptions,
  theme?: Theme
): string => {
  const { selector } = options;
  const mdBreakpoint = theme ? theme.breakpoints.values.md - 1 : 900;

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
};

export const getMapContainerStyles = (): string => `
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
    /* Blue outline matching MapLibre zoom buttons and screenshot button style - wider for map */
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

export const getNavigationControlStyles = (theme: Theme): string => {
  const mdBreakpoint = theme.breakpoints.values.md - 1;

  return `
  .maplibregl-ctrl-group {
    bottom: ${NAVIGATION_CONTROL_STYLES.BOTTOM_PADDING} !important;
    z-index: ${Z_INDEX.MAP + 10} !important;
    position: relative !important;
  }
    
    /* Ensure zoom buttons are clickable */
    .maplibregl-ctrl-group button {
      pointer-events: auto !important;
      z-index: ${Z_INDEX.MAP + 11} !important;
      position: relative !important;
      cursor: pointer !important;
    }
    .maplibregl-ctrl-group button[title] {
      position: relative;
    }
    .maplibregl-ctrl-group button[title]:hover::before,
    .maplibregl-ctrl-group button[title]:focus::before {
      content: none !important;
    }
    
    /* Tooltips for zoom buttons - positioned above */
    .maplibregl-ctrl-group button[data-tooltip]::after {
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
    
    .maplibregl-ctrl-group button[data-tooltip]::before {
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
    
    .maplibregl-ctrl-group button[data-tooltip]:focus-visible::after,
    .maplibregl-ctrl-group button[data-tooltip]:hover::after {
      opacity: 1;
      visibility: visible;
    }
    
    .maplibregl-ctrl-group button[data-tooltip]:focus-visible::before,
    .maplibregl-ctrl-group button[data-tooltip]:hover::before {
      opacity: 1;
      visibility: visible;
    }
    
    @media (max-width: ${mdBreakpoint}px) {
      .maplibregl-ctrl-group button[data-tooltip]::after,
      .maplibregl-ctrl-group button[data-tooltip]::before {
        display: none !important;
      }
    }
  `;
};

export const SIZES = {
  ICON_SMALL: 16,
  ICON_MEDIUM: 20,
  ICON_LARGE: 24,
  BUTTON_HEIGHT: 40,
  INPUT_HEIGHT: 48,
  CARD_MIN_HEIGHT: 200,
} as const;
