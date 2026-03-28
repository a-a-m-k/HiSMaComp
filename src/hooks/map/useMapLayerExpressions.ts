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
  getPopulationExpression,
  getPopulationSortKey,
} from "@/components/map/MapView/MapLayer/expressions";
import type { MapBaseStyleMode } from "@/utils/map/terrainStyle";

interface UseMapLayerExpressionsOptions {
  selectedYear: number;
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
  selectedYear,
  mapStyleMode,
  minPopulation = POPULATION_THRESHOLDS[0],
  maxPopulation = POPULATION_THRESHOLDS[POPULATION_THRESHOLDS.length - 1],
  minMarkerSize = MIN_MARKER_SIZE,
  maxMarkerSize = MAX_MARKER_SIZE,
}: UseMapLayerExpressionsOptions) => {
  const selectedCentury = String(selectedYear);

  const legendColors = useMemo(
    () => getLegendColorsForMapMode(mapStyleMode),
    [mapStyleMode]
  );

  const populationSortKey = useMemo(
    () => getPopulationSortKey(selectedCentury),
    [selectedCentury]
  );

  const circleRadiusExpression = useMemo(
    () =>
      getCircleRadiusExpression(
        selectedCentury,
        minPopulation,
        maxPopulation,
        minMarkerSize,
        maxMarkerSize
      ),
    [
      selectedCentury,
      minPopulation,
      maxPopulation,
      minMarkerSize,
      maxMarkerSize,
    ]
  );

  const circleColorExpression = useMemo(
    () =>
      getCircleColorExpression(
        selectedCentury,
        POPULATION_THRESHOLDS,
        legendColors
      ),
    [selectedCentury, legendColors]
  );

  const populationExpression = useMemo(
    () => getPopulationExpression(selectedCentury),
    [selectedCentury]
  );

  return {
    populationSortKey,
    circleRadiusExpression,
    circleColorExpression,
    populationExpression,
  };
};
