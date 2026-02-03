import {
  MIN_MARKER_SIZE,
  MAX_MARKER_SIZE,
  NO_DATA_MARKER_SIZE,
  POPULATION_THRESHOLDS,
} from "@/constants";

/**
 * Calculates marker radius based on population
 * Reuses the same logic as getCircleRadiusExpression in expressions.ts
 * Matches the interpolation logic used by the map layer
 *
 * @param population - Population value for the town (can be null/undefined for no data)
 * @param minPopulation - Minimum population threshold (defaults to first threshold)
 * @param maxPopulation - Maximum population threshold (defaults to last threshold)
 * @param minMarkerSize - Minimum marker size (defaults to MIN_MARKER_SIZE)
 * @param maxMarkerSize - Maximum marker size (defaults to MAX_MARKER_SIZE)
 * @param noDataMarkerSize - Marker size when no data (defaults to NO_DATA_MARKER_SIZE)
 * @returns Marker radius in pixels
 */
export const calculateMarkerRadius = (
  population: number | null | undefined,
  minPopulation: number = POPULATION_THRESHOLDS[0],
  maxPopulation: number = POPULATION_THRESHOLDS[
    POPULATION_THRESHOLDS.length - 1
  ],
  minMarkerSize: number = MIN_MARKER_SIZE,
  maxMarkerSize: number = MAX_MARKER_SIZE,
  noDataMarkerSize: number = NO_DATA_MARKER_SIZE
): number => {
  if (population == null || population === 0) {
    return noDataMarkerSize;
  }

  const clampedPop = Math.max(
    minPopulation,
    Math.min(maxPopulation, population)
  );
  const ratio = (clampedPop - minPopulation) / (maxPopulation - minPopulation);
  return minMarkerSize + (maxMarkerSize - minMarkerSize) * ratio;
};

/**
 * Calculates marker diameter (for button size)
 */
export const calculateMarkerDiameter = (population: number): number => {
  return calculateMarkerRadius(population) * 2;
};
