export const DEFAULT_MAP_CONTAINER_PROPS = {
  maxZoom: 8,
};

/** Viewport-focused tile cache: one zoom level, 128-tile cap per source. */
export const TILE_LOADING_OPTIONS = {
  maxTileCacheZoomLevels: 1,
  maxTileCacheSize: 128,
} as const;

/**
 * Split dark basemap (full terrain underlay): cache more zoom levels and tiles so the passive map
 * does not constantly refetch while the overlay is panned/zoomed.
 */
export const SPLIT_BASEMAP_TILE_OPTIONS = {
  maxTileCacheZoomLevels: 3,
  maxTileCacheSize: 256,
} as const;

/** Interactive overlay in split mode: modest bump so borders/population layers reuse tiles. */
export const SPLIT_OVERLAY_TILE_OPTIONS = {
  maxTileCacheZoomLevels: 2,
  maxTileCacheSize: 192,
} as const;
