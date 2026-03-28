import type { ExpressionSpecification } from "maplibre-gl";
import { MAP_LEGEND_COLORS } from "@/constants";
import {
  getDefaultMarkerScaleConfig,
  getMarkerColorStops,
  getMarkerScaleBounds,
} from "@/utils/markers/markerScale";

const DEFAULT_MARKER_SCALE = getDefaultMarkerScaleConfig();
const DEFAULT_MARKER_BOUNDS = getMarkerScaleBounds(DEFAULT_MARKER_SCALE);

/** Feature property set in `townsToGeoJSON` for the selected timeline year (flat; reliable in symbol layers). */
export const POPULATION_FOR_YEAR_PROP = "populationForYear" as const;

/**
 * Population for the active year (see `townsToGeoJSON`). Nested `populationByYear` lookups
 * often fail to evaluate in symbol `text-field` / paint; use this flat property only.
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
 * Sort key for circles/symbols: larger populations first; no-data last.
 */
export const getPopulationSortKey = (): ExpressionSpecification => [
  "case",
  getNoDataExpression(),
  Number.POSITIVE_INFINITY,
  ["-", 0, getPopulationExpression()],
];

/**
 * Builds a MapLibre expression to determine the circle radius for map markers based on population data for a given century.
 *
 * @param minPopulation - The minimum population value for scaling marker size. Defaults to the lowest value in POPULATION_THRESHOLDS.
 * @param maxPopulation - The maximum population value for scaling marker size. Defaults to the highest value in POPULATION_THRESHOLDS.
 * @param minMarkerSize - The minimum marker size (radius) for the smallest population. Defaults to MIN_MARKER_SIZE.
 * @param maxMarkerSize - The maximum marker size (radius) for the largest population. Defaults to MAX_MARKER_SIZE.
 * @param noDataMarkerSize - The marker size (radius) to use when population data is missing. Defaults to NO_DATA_MARKER_SIZE.
 * @returns A MapLibre ExpressionSpecification that sets the marker radius based on population, or a fallback size if data is missing.
 *
 * The returned expression has the following logic:
 * - If there is no population data for the selected century, use `noDataMarkerSize`.
 * - Otherwise, interpolate the marker size linearly between `minMarkerSize` and `maxMarkerSize` based on the population value between `minPopulation` and `maxPopulation`.
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
 *
 * The expression uses a "step" function to assign colors from the populationLegendColors array
 * according to the population value for the given century. If the population value is missing,
 * it defaults to 0. Each threshold in populationThresholds defines the lower bound for the next color.
 *
 * @param populationThresholds - An array of population thresholds that define the color steps. Defaults to POPULATION_THRESHOLDS.
 * @param legendColors - An array of colors corresponding to each population range. Defaults to MAP_LEGEND_COLORS.
 * @returns A MapLibre GL expression specification for circle color styling.
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
