import type { ExpressionSpecification } from "maplibre-gl";
import { MAP_LEGEND_COLORS } from "@/constants";
import {
  POPULATION_SORT_KEY_NO_DATA,
  POPULATION_SORT_KEY_PROP,
} from "@/constants/map";
import {
  getDefaultMarkerScaleConfig,
  getMarkerColorStops,
  getMarkerScaleBounds,
} from "@/utils/markers/markerScale";

const DEFAULT_MARKER_SCALE = getDefaultMarkerScaleConfig();
const DEFAULT_MARKER_BOUNDS = getMarkerScaleBounds(DEFAULT_MARKER_SCALE);

/** Feature property set in `townsToGeoJSON` for the selected timeline year (flat; reliable in circle paint). */
export const POPULATION_FOR_YEAR_PROP = "populationForYear" as const;

/**
 * Population for the active year (see `townsToGeoJSON`). Nested `populationByYear` lookups
 * are unreliable in style expressions; use this flat property only.
 */
export const getPopulationExpression = (): ExpressionSpecification => [
  "get",
  POPULATION_FOR_YEAR_PROP,
];

/**
 * True when the feature has no numeric population for the selected year (`populationForYear` missing or null).
 */
export const getNoDataExpression = (): ExpressionSpecification => [
  "any",
  ["!", ["has", POPULATION_FOR_YEAR_PROP]],
  ["==", ["get", POPULATION_FOR_YEAR_PROP], ["literal", null]],
];

/**
 * Sort key for **circle** layers: higher value draws on top (MapLibre ascending sort).
 */
export const getPopulationSortKey = (): ExpressionSpecification => [
  "to-number",
  [
    "coalesce",
    ["get", POPULATION_SORT_KEY_PROP],
    getPopulationExpression(),
    POPULATION_SORT_KEY_NO_DATA,
  ],
];

/**
 * Builds a MapLibre expression to determine the circle radius for map markers based on population data for a given century.
 */
export const getCircleRadiusExpression = (
  minPopulation: number = DEFAULT_MARKER_BOUNDS.minPopulation,
  maxPopulation: number = DEFAULT_MARKER_BOUNDS.maxPopulation,
  minMarkerSize: number = DEFAULT_MARKER_SCALE.minMarkerSize,
  maxMarkerSize: number = DEFAULT_MARKER_SCALE.maxMarkerSize,
  noDataMarkerSize: number = DEFAULT_MARKER_SCALE.noDataMarkerSize
): ExpressionSpecification => [
  "case",
  getNoDataExpression(),
  noDataMarkerSize,
  [
    "interpolate",
    ["linear"],
    ["coalesce", getPopulationExpression(), 0],
    minPopulation,
    minMarkerSize,
    maxPopulation,
    maxMarkerSize,
  ],
];

/**
 * Generates a MapLibre GL expression for determining the circle color of map features
 * based on population thresholds for a selected century.
 */
export const getCircleColorExpression = (
  populationThresholds: number[] = DEFAULT_MARKER_SCALE.populationThresholds,
  legendColors: string[] = MAP_LEGEND_COLORS
): ExpressionSpecification => [
  "case",
  getNoDataExpression(),
  legendColors[0],
  [
    "step",
    ["coalesce", getPopulationExpression(), 0],
    // Below first threshold (5k): visible grey — not N/A white (historic towns are often <5k).
    legendColors[1],
    ...getMarkerColorStops({
      ...DEFAULT_MARKER_SCALE,
      populationThresholds,
      legendColors,
    }),
  ],
];
