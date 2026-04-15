import {
  calculateMarkerRadiusFromPopulation,
  getDefaultMarkerScaleConfig,
} from "./markerScale";

/**
 * Calculates marker radius from the shared marker scale model.
 *
 * @param population - Population value for the town (can be null/undefined for no data)
 * @returns Marker radius in pixels
 */
export const calculateMarkerRadius = (
  population: number | null | undefined
): number => {
  return calculateMarkerRadiusFromPopulation(
    population,
    getDefaultMarkerScaleConfig()
  );
};

/**
 * Calculates marker diameter (for button size).
 * Pass through `null`/`undefined` for no data (small hit target), same as radius.
 */
export const calculateMarkerDiameter = (
  population: number | null | undefined
): number => {
  return calculateMarkerRadius(population) * 2;
};
