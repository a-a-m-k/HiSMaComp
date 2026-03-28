export const DEFAULT_CENTER = { latitude: 50.0, longitude: 10.0 };
export const DEFAULT_ZOOM = 4;
/** Slightly zoom out from fit so the initial view isn’t tight. */
export const INITIAL_ZOOM_OUT_OFFSET = 0.25;

/**
 * Muted slate for night overlay country borders & legend attribution.
 * Equivalent to `#94a3b180` — `rgb(93, 99, 105)` at alpha `128/255`.
 */
export const MAP_MUTED_SLATE_RGBA = `rgba(93, 99, 105, ${128 / 255})`;

export const MAP_LAYER_ID = "towns-population-layer";

/**
 * CSS `filter` on the split dark terrain basemap (see `MapView`). Exposed so screenshot export can
 * bake the same look — html2canvas does not apply parent `filter` to WebGL canvases.
 */
export const MAP_DARK_BASEMAP_FILTER =
  "brightness(0.9) invert(1) contrast(0.6) hue-rotate(200deg) saturate(0.25) brightness(0.65)";

/** Dispatched to return the map to its initial center and zoom (`MapView` listens). */
export const MAP_RESET_CAMERA_EVENT = "hismacomp:map-reset-camera";

export const WORLD_DIMENSIONS = { width: 256, height: 256 };
export const MAX_ZOOM_LEVEL = 20;
export const DEGREES_IN_CIRCLE = 360;

export const COORDINATE_LIMITS = {
  LATITUDE: { min: -90, max: 90 },
  LONGITUDE: { min: -180, max: 180 },
} as const;

export const FLOATING_BUTTON_SIZE = 45;
/** Circular save / reset on map overlay below `md` (matches compact mobile row). */
export const SCREENSHOT_BUTTON_SIZE = 36;
/** Floating snapshot + reset on map overlay at `md+` (slightly larger targets). */
export const MAP_OVERLAY_FLOATING_TOOL_SIZE_DESKTOP = 40;
/**
 * Shared hit area for `.maplibregl-ctrl-group` zoom buttons and `MapOverlayToolsStack` (md+).
 * Keep in sync with `getNavigationControlStyles` in theme/mapStyles.ts.
 */
export const MAP_NAV_CONTROL_BUTTON_PX = 40;
/** Zoom glyph / overlay icon size (scales with button; baseline was 18×36). */
export const MAP_NAV_CONTROL_ICON_PX = Math.round(
  (18 * MAP_NAV_CONTROL_BUTTON_PX) / 36
);
