export const DEFAULT_CENTER = { latitude: 50.0, longitude: 10.0 };
export const DEFAULT_ZOOM = 4;
/** Slightly zoom out from fit so the initial view isn’t tight. */
export const INITIAL_ZOOM_OUT_OFFSET = 0.25;

export const MAP_LAYER_ID = "towns-population-layer";

export const WORLD_DIMENSIONS = { width: 256, height: 256 };
export const MAX_ZOOM_LEVEL = 20;
export const DEGREES_IN_CIRCLE = 360;

export const COORDINATE_LIMITS = {
  LATITUDE: { min: -90, max: 90 },
  LONGITUDE: { min: -180, max: 180 },
} as const;

export const FLOATING_BUTTON_SIZE = 45;
/** Larger on desktop for easier click. */
export const SCREENSHOT_BUTTON_DESKTOP_SIZE = 56;
