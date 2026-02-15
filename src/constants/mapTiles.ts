/**
 * Device-aware tile loading settings for MapLibre GL.
 * Used to limit cache size and parallel requests so visible tiles get priority.
 *
 * Tuning: These values can be adjusted from real user data (e.g. RUM, analytics).
 * For example, lower `parallel` on slow networks or low-end devices if you see
 * tile load delays; increase `cache` on desktop if panning feels starved.
 */
export const TILE_OPTIMIZATION_SETTINGS = {
  mobile: { cache: 20, parallel: 4, perTile: 1 },
  tablet: { cache: 25, parallel: 5, perTile: 2 },
  desktop: { cache: 30, parallel: 6, perTile: 2 },
} as const;

export type DeviceTileSetting = keyof typeof TILE_OPTIMIZATION_SETTINGS;
