import {
  MAP_LEGEND_COLORS,
  getLegendColorsForMapMode,
  MAX_MARKER_SIZE,
  MIN_MARKER_SIZE,
  NO_DATA_MARKER_SIZE,
  POPULATION_THRESHOLDS,
} from "@/constants";
import type { MapBaseStyleMode } from "@/utils/map/terrainStyle";

export interface MarkerScaleConfig {
  populationThresholds: number[];
  legendColors: string[];
  minMarkerSize: number;
  maxMarkerSize: number;
  noDataMarkerSize: number;
}

export const getDefaultMarkerScaleConfig = (): MarkerScaleConfig => ({
  populationThresholds: POPULATION_THRESHOLDS,
  legendColors: MAP_LEGEND_COLORS,
  minMarkerSize: MIN_MARKER_SIZE,
  maxMarkerSize: MAX_MARKER_SIZE,
  noDataMarkerSize: NO_DATA_MARKER_SIZE,
});

export const getMarkerScaleConfigForMapMode = (
  mode: MapBaseStyleMode
): MarkerScaleConfig => ({
  ...getDefaultMarkerScaleConfig(),
  legendColors: getLegendColorsForMapMode(mode),
});

export const getMarkerScaleBounds = (config: MarkerScaleConfig) => ({
  minPopulation: config.populationThresholds[0],
  maxPopulation:
    config.populationThresholds[config.populationThresholds.length - 1],
});

export const getMarkerColorStops = (
  config: MarkerScaleConfig
): Array<string | number> =>
  config.populationThresholds.flatMap((threshold, index) => [
    threshold,
    config.legendColors[index + 1],
  ]);

export const calculateMarkerRadiusFromPopulation = (
  population: number | null | undefined,
  config: MarkerScaleConfig
): number => {
  if (population == null || population === 0) {
    return config.noDataMarkerSize;
  }

  const { minPopulation, maxPopulation } = getMarkerScaleBounds(config);
  const clampedPop = Math.max(
    minPopulation,
    Math.min(maxPopulation, population)
  );
  const ratio = (clampedPop - minPopulation) / (maxPopulation - minPopulation);

  return (
    config.minMarkerSize + (config.maxMarkerSize - config.minMarkerSize) * ratio
  );
};

export const calculateMarkerColorFromPopulation = (
  population: number | null | undefined,
  config: MarkerScaleConfig
): string => {
  if (population == null) {
    return config.legendColors[0];
  }
  const pop = population;

  for (let i = config.populationThresholds.length - 1; i >= 0; i--) {
    if (pop >= config.populationThresholds[i]) {
      return config.legendColors[i + 1];
    }
  }

  /** 0…4999: visible grey — same as GeoJSON circles (not N/A white). */
  return config.legendColors[1];
};
