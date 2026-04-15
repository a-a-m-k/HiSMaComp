import type { MapBaseStyleMode } from "@/utils/map/terrainStyle";

/** Legend and choropleth ramp for a light basemap (one color per population band, plus N/A). */
export const MAP_LEGEND_COLORS = [
  "#ffffff", // N/A (no data)
  "#cccccc", // 5,000 - 20,000
  "#9ba7b8", // 20,000 - 50,000
  "#5d7596", // 50,000 - 100,000
  "#2362a3", // 100,000 - 200,000
  "#12407e", // 200,000 -500,000
  "#011638", // 500,000
];

/** Legend and choropleth ramp for a dark basemap. */
export const MAP_LEGEND_COLORS_DARK = [
  "#242a31", // N/A (slightly lifted)
  "#434a53",
  "#556575",
  "#4b6985",
  "#436689",
  "#36577a",
  "#27476a",
] as const;

/** Basemap mode for legend ramp selection; same as `MapBaseStyleMode`. */
export type MapLegendColorMode = MapBaseStyleMode;

/**
 * Returns the population legend color list for the given basemap mode.
 * @param mode - `"light"` or `"dark"` (same as map style context).
 */
export function getLegendColorsForMapMode(mode: MapLegendColorMode): string[] {
  return mode === "dark" ? [...MAP_LEGEND_COLORS_DARK] : [...MAP_LEGEND_COLORS];
}

export const POPULATION_THRESHOLDS_MOBILE = [
  "5k",
  "20k",
  "50k",
  "100k",
  "200k",
  "500k",
];

export const POPULATION_THRESHOLDS = [
  5000, 20000, 50000, 100000, 200000, 500000,
];

export const NO_DATA_MARKER_SIZE = 1;
export const MIN_MARKER_SIZE = 5;
export const MAX_MARKER_SIZE = 15;
