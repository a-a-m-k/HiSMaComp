import { ExpressionSpecification } from "maplibre-gl";
import {
  MAX_MARKER_SIZE,
  MIN_MARKER_SIZE,
  NO_DATA_MARKER_SIZE,
  MAP_LEGEND_COLORS,
  POPULATION_THRESHOLDS,
} from "@/constants";

/**
 * Generates a MapLibre GL expression to retrieve the population value for a given century.
 *
 * @param selectedCentury - The century for which to retrieve the population (e.g., "19th", "20th").
 * @returns An expression specification that accesses the population value for the specified century
 *          from the "populationByYear" property of a feature.
 */
export const getPopulationExpression = (
  selectedCentury: string
): ExpressionSpecification => [
  "get",
  selectedCentury,
  ["get", "populationByYear"],
];

/**
 * Generates a MapLibre expression that checks if there is no population data available
 * for the specified century in a feature's `populationByYear` property.
 *
 * The returned expression evaluates to `true` if either:
 * - The `populationByYear` object does not have the specified century as a property, or
 * - The population value for the specified century is `null`.
 *
 * @param selectedCentury - The century (as a string) to check for population data.
 * @returns An `ExpressionSpecification` that evaluates to `true` when no data is present for the given century.
 */
export const getNoDataExpression = (
  selectedCentury: string
): ExpressionSpecification => [
  "any",
  ["!", ["has", selectedCentury, ["get", "populationByYear"]]],
  ["==", getPopulationExpression(selectedCentury), ["literal", null]],
];

/**
 * Generates a MapLibre expression to be used as a sort key for population-based layers.
 *
 * The expression sorts features based on their population value for the specified century.
 * If the population data is missing (as determined by `getNoDataExpression`), the feature
 * is assigned `Number.POSITIVE_INFINITY` to ensure it appears last in the sort order.
 * Otherwise, the sort key is the negated population value, so higher populations are sorted first.
 *
 * @param selectedCentury - The century for which to retrieve and sort population data (e.g., "19th", "20th").
 * @returns A MapLibre `ExpressionSpecification` that can be used as a sort key in layer styling.
 */
export const getPopulationSortKey = (
  selectedCentury: string
): ExpressionSpecification => [
  "case",
  getNoDataExpression(selectedCentury),
  Number.POSITIVE_INFINITY,
  ["-", 0, getPopulationExpression(selectedCentury)],
];

/**
 * Builds a MapLibre expression to determine the circle radius for map markers based on population data for a given century.
 *
 * @param selectedCentury - The century for which to extract population data (used as a property key).
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
  selectedCentury: string,
  minPopulation: number = POPULATION_THRESHOLDS[0],
  maxPopulation: number = POPULATION_THRESHOLDS[
    POPULATION_THRESHOLDS.length - 1
  ],
  minMarkerSize: number = MIN_MARKER_SIZE,
  maxMarkerSize: number = MAX_MARKER_SIZE,
  noDataMarkerSize: number = NO_DATA_MARKER_SIZE
): ExpressionSpecification => [
  "case",
  getNoDataExpression(selectedCentury),
  noDataMarkerSize,
  [
    "interpolate",
    ["linear"],
    ["coalesce", getPopulationExpression(selectedCentury), 0],
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
 * @param selectedCentury - The century (as a string) for which to retrieve population data.
 * @param populationThresholds - An array of population thresholds that define the color steps. Defaults to POPULATION_THRESHOLDS.
 * @param legendColors - An array of colors corresponding to each population range. Defaults to MAP_LEGEND_COLORS.
 * @returns A MapLibre GL expression specification for circle color styling.
 */
export const getCircleColorExpression = (
  selectedCentury: string,
  populationThresholds: number[] = POPULATION_THRESHOLDS,
  legendColors = MAP_LEGEND_COLORS
): ExpressionSpecification => [
  "step",
  ["coalesce", getPopulationExpression(selectedCentury), 0],
  legendColors[0],
  ...populationThresholds.flatMap((threshold, i) => [
    threshold,
    legendColors[i + 1],
  ]),
];
