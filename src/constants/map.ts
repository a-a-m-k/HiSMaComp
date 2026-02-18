/** Default map center when no towns or loading (latitude, longitude) */
export const DEFAULT_CENTER = { latitude: 50.0, longitude: 10.0 };
/** Default zoom when no towns or loading */
export const DEFAULT_ZOOM = 4;

/** Below this width/height the app is fixed and no longer responsive */
export const APP_MIN_WIDTH = 300;
export const APP_MIN_HEIGHT = 300;
export const MAP_LAYER_ID = "towns-population-layer";

export const WORLD_DIMENSIONS = { width: 256, height: 256 };
export const MAX_ZOOM_LEVEL = 20;
export const DEGREES_IN_CIRCLE = 360;

export const COORDINATE_LIMITS = {
  LATITUDE: { min: -90, max: 90 },
  LONGITUDE: { min: -180, max: 180 },
} as const;

export const SPATIAL_INDEX_PRECISION = 10;
export const MIN_ZOOM_CALCULATION = 2;
export const MAX_ZOOM_CALCULATION = 15;
export const ZOOM_CALCULATION_BASE = 10;
export const FLOATING_BUTTON_SIZE = 45;
/** Screenshot button size on desktop (md and up); larger than default for easier click. */
export const SCREENSHOT_BUTTON_DESKTOP_SIZE = 56;

/** View-state thresholds (reserved for future use, e.g. programmatic fit or animation) */
export const ZOOM_CHANGE_THRESHOLD = 0.1;
export const TRANSIENT_RESIZE_HEIGHT_THRESHOLD = 50;
export const TRANSIENT_RESIZE_WIDTH_THRESHOLD = 40;
export const PROGRAMMATIC_TARGET_ZOOM_EPS = 0.05;
export const PROGRAMMATIC_TARGET_LATLNG_EPS = 0.0002;
