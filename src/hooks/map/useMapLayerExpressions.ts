import { useMemo } from "react";
import {
  POPULATION_THRESHOLDS,
  MIN_MARKER_SIZE,
  MAX_MARKER_SIZE,
} from "@/constants";
import { getLegendColorsForMapMode } from "@/constants/population";
import {
  getCircleColorExpression,
  getCircleRadiusExpression,
  getPopulationSortKey,
} from "@/components/map/MapView/MapLayer/expressions";
import type { MapBaseStyleMode } from "@/utils/map/terrainStyle";

interface UseMapLayerExpressionsOptions {
  mapStyleMode: MapBaseStyleMode;
  minPopulation?: number;
  maxPopulation?: number;
  minMarkerSize?: number;
  maxMarkerSize?: number;
}

/**
 * Memoized MapLibre expressions for the GeoJSON population layer (radius, color, sort, population field).
 */
export const useMapLayerExpressions = ({
  mapStyleMode,
  minPopulation = POPULATION_THRESHOLDS[0],
  maxPopulation = POPULATION_THRESHOLDS[POPULATION_THRESHOLDS.length - 1],
  minMarkerSize = MIN_MARKER_SIZE,
  maxMarkerSize = MAX_MARKER_SIZE,
}: UseMapLayerExpressionsOptions) => {
  const legendColors = useMemo(
    () => getLegendColorsForMapMode(mapStyleMode),
    [mapStyleMode]
  );

  const populationSortKey = useMemo(() => getPopulationSortKey(), []);

  const circleRadiusExpression = useMemo(
    () =>
      getCircleRadiusExpression(
        minPopulation,
        maxPopulation,
        minMarkerSize,
        maxMarkerSize
      ),
    [minPopulation, maxPopulation, minMarkerSize, maxMarkerSize]
  );

  const circleColorExpression = useMemo(
    () => getCircleColorExpression(POPULATION_THRESHOLDS, legendColors),
    [legendColors]
  );

  return {
    populationSortKey,
    circleRadiusExpression,
    circleColorExpression,
  };
};
