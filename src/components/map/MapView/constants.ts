export const DEFAULT_MAP_CONTAINER_PROPS = {
  maxZoom: 8,
};

/** Viewport-focused tile cache: one zoom level, 128-tile cap per source. */
export const TILE_LOADING_OPTIONS = {
  maxTileCacheZoomLevels: 1,
  maxTileCacheSize: 128,
} as const;
