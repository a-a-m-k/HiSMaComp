export const DEFAULT_MAP_CONTAINER_PROPS = {
  maxZoom: 8,
};

/**
 * Tile loading: limit cache to viewport so only visible tiles are kept.
 * maxTileCacheZoomLevels=1 → cache size ≈ tiles in view (no extra zoom levels).
 * maxTileCacheSize caps total tiles per source (fallback if viewport is large).
 */
export const TILE_LOADING_OPTIONS = {
  /** Only cache tiles for the current zoom (viewport-focused). Default in MapLibre is 5. */
  maxTileCacheZoomLevels: 1,
  /** Cap tiles per source. Viewport at zoom 4–8 is typically ~4–64 tiles; 128 allows small buffer. */
  maxTileCacheSize: 128,
} as const;
