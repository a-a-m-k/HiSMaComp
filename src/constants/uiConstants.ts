/**
 * Pure UI constants: layout, spacing, sizes. No theme import.
 * Keeps tree-shaking and testing simple; theme-derived values live in theme/themeValues.
 */

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

/** Timeline height constants in pixels; used for overlay positioning (e.g. screenshot button). */
export const TIMELINE_HEIGHTS = {
  MOBILE: 87,
  TABLET: 120,
  DESKTOP: 120,
} as const;

/** Overlay spacing: edge and stacking distances for map controls. */
export const OVERLAY_SPACING = {
  EDGE_SPACING: 1.5,
  EDGE_SPACING_LG: 2,
  STACKING_SPACING: 1,
} as const;

/** Positioning constants for legend, timeline, screenshot button. */
export const OVERLAY_POSITIONS = {
  TIMELINE: {
    BOTTOM: 1,
    HORIZONTAL: 1,
  },
  LEGEND: {
    TOP_MOBILE_TABLET: 1,
    TOP_DESKTOP: 2,
    RIGHT_DESKTOP: 1,
  },
  SCREENSHOT_BUTTON: {
    LEFT_DESKTOP: 1,
    TOP_DESKTOP: 2,
    RIGHT_TABLET: 1,
    BOTTOM_TABLET_CALCULATED: TIMELINE_HEIGHTS.TABLET + 8 + 8,
  },
} as const;

export const RESPONSIVE_PADDING = {
  MOBILE: 0.75,
  TABLET: 1.5,
  DESKTOP: 2.25,
  XL: 2.75,
} as const;

export const OPACITY = {
  DISABLED: 0.7,
  HOVER: 0.8,
  FOCUS: 0.9,
  ACTIVE: 1,
} as const;

export const NAVIGATION_CONTROL_STYLES = {
  CONTAINER_HEIGHT_DESKTOP: TIMELINE_HEIGHTS.DESKTOP,
} as const;

export const SIZES = {
  ICON_SMALL: 16,
  ICON_MEDIUM: 20,
  ICON_LARGE: 24,
  BUTTON_HEIGHT: 40,
  INPUT_HEIGHT: 48,
  CARD_MIN_HEIGHT: 200,
} as const;
