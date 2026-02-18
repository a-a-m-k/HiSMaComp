/**
 * Theme-derived constants for use outside MUI (e.g. MapLibre, style generators).
 * For MUI components, prefer theme.custom.* directly.
 */
import theme from "./theme";

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
  ERROR: theme.custom.zIndex.error,
} as const;

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

export const TOOLTIP_STYLES = {
  PADDING: theme.custom.tooltip.padding,
  BORDER_RADIUS: theme.custom.tooltip.borderRadius,
  FONT_SIZE: theme.custom.tooltip.fontSize,
  ARROW_SIZE: theme.custom.tooltip.arrowSize,
  OFFSET: theme.custom.tooltip.offset,
  ARROW_OFFSET: theme.custom.tooltip.arrowOffset,
} as const;
