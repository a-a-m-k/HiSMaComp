/** Layout, spacing, sizes (no theme); theme-derived values are in theme/themeValues. */

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
  /**
   * md–lg desktop: at ~1091px, 22% ≈ 240px and nowrap N/A labels (e.g. “No data for the
   * current time period”) clip. Min width ensures the legend can grow past the percentage.
   */
  DESKTOP_MIN: "250px",
} as const;

export const LEGEND_WIDTH_CALCULATIONS = {
  LARGE_TABLET: { percentage: 0.21, min: 250 },
  /** Keep in sync with `LEGEND_WIDTHS.DESKTOP_MIN` for `calculateMapArea` / zoom fitting. */
  DESKTOP: { percentage: 0.22, min: 300 },
} as const;

export const TIMELINE_WIDTHS = {
  MOBILE: "100%",
  TABLET: "85%",
  DESKTOP: "60%",
} as const;

/**
 * Approximate rendered height of `#timeline` (outer nav Box) from getBoundingClientRect.
 * Recheck after Timeline layout changes; keep in sync with `--timeline-height-*` in index.css.
 * Reference viewports: mobile below 600px, tablet 600–899px, desktop 900px+ (see getDeviceType).
 */
export const TIMELINE_HEIGHTS = {
  MOBILE: 138,
  TABLET: 81,
  DESKTOP: 92,
} as const;

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
