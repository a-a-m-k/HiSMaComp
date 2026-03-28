import type { MapBaseStyleMode } from "@/utils/map/terrainStyle";
import {
  MAP_GEO_LABEL_HALO_DARK,
  MAP_GEO_LABEL_HALO_LIGHT,
  MAP_GEO_LABEL_TEXT_DARK,
  MAP_GEO_LABEL_TEXT_LIGHT,
  MAP_MARKER_OUTLINE_DARK,
  MAP_MARKER_OUTLINE_LIGHT,
} from "@/theme/mapTokens";

/**
 * GeoJSON population layer marker styling (circle stroke + label colors) keyed by basemap mode.
 */
export const MAP_GEOJSON_MARKERS = {
  outline: {
    light: MAP_MARKER_OUTLINE_LIGHT,
    dark: MAP_MARKER_OUTLINE_DARK,
  },
  circleStrokeWidth: 1,
  labelLight: {
    text: MAP_GEO_LABEL_TEXT_LIGHT,
    halo: MAP_GEO_LABEL_HALO_LIGHT,
  },
  labelDark: {
    text: MAP_GEO_LABEL_TEXT_DARK,
    halo: MAP_GEO_LABEL_HALO_DARK,
  },
} as const;

/** MapLibre `symbol` layer paint for town name labels on a light basemap. */
export const MAP_TEXT_LABEL_PAINT_LIGHT = {
  "text-color": MAP_GEOJSON_MARKERS.labelLight.text,
  "text-halo-color": MAP_GEOJSON_MARKERS.labelLight.halo,
  "text-halo-width": 0.8,
} as const;

/** MapLibre `symbol` layer paint for town name labels on a dark basemap. */
export const MAP_TEXT_LABEL_PAINT_DARK = {
  "text-color": MAP_GEOJSON_MARKERS.labelDark.text,
  "text-halo-color": MAP_GEOJSON_MARKERS.labelDark.halo,
  "text-halo-width": 1,
  "text-halo-blur": 0,
};

/**
 * Resolves MapLibre text-layer paint for the current basemap mode.
 * @param mode - Basemap appearance (`MapStyleContext` / `MapBaseStyleMode`).
 */
export function getMapTextLabelPaint(
  mode: MapBaseStyleMode
): typeof MAP_TEXT_LABEL_PAINT_LIGHT | typeof MAP_TEXT_LABEL_PAINT_DARK {
  return mode === "dark"
    ? MAP_TEXT_LABEL_PAINT_DARK
    : MAP_TEXT_LABEL_PAINT_LIGHT;
}
