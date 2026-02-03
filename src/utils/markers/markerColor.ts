import { MAP_LEGEND_COLORS, POPULATION_THRESHOLDS } from "@/constants";

/**
 * Calculates marker color based on population
 * Reuses the same logic as getCircleColorExpression in expressions.ts
 * Uses step function to assign colors based on population thresholds
 *
 * @param population - Population value for the town
 * @param populationThresholds - Array of population thresholds (defaults to POPULATION_THRESHOLDS)
 * @param legendColors - Array of colors corresponding to each range (defaults to MAP_LEGEND_COLORS)
 * @returns Color string for the marker
 */
export const calculateMarkerColor = (
  population: number | null | undefined,
  populationThresholds: number[] = POPULATION_THRESHOLDS,
  legendColors = MAP_LEGEND_COLORS
): string => {
  const pop = population ?? 0;

  for (let i = populationThresholds.length - 1; i >= 0; i--) {
    if (pop >= populationThresholds[i]) {
      return legendColors[i + 1];
    }
  }

  return legendColors[0];
};
