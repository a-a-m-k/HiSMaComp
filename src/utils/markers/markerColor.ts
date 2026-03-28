import type { MapBaseStyleMode } from "@/utils/map/terrainStyle";

import {
  calculateMarkerColorFromPopulation,
  getMarkerScaleConfigForMapMode,
} from "./markerScale";

/**
 * Calculates marker color from the shared marker scale model (light vs dark ramp).
 *
 * @param population - Population value for the town
 * @param mapStyleMode - Basemap mode; dark uses `MAP_LEGEND_COLORS_DARK`
 */
export const calculateMarkerColor = (
  population: number | null | undefined,
  mapStyleMode: MapBaseStyleMode = "light"
): string => {
  return calculateMarkerColorFromPopulation(
    population,
    getMarkerScaleConfigForMapMode(mapStyleMode)
  );
};
