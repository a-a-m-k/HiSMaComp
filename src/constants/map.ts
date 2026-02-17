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
