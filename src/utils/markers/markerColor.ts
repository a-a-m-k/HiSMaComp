import {
  calculateMarkerColorFromPopulation,
  getDefaultMarkerScaleConfig,
} from "./markerScale";

/**
 * Calculates marker color from the shared marker scale model.
 *
 * @param population - Population value for the town
 * @returns Color string for the marker
 */
export const calculateMarkerColor = (
  population: number | null | undefined
): string => {
  return calculateMarkerColorFromPopulation(
    population,
    getDefaultMarkerScaleConfig()
  );
};
