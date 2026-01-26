import { useMemo } from "react";
import {
  POPULATION_THRESHOLDS,
  MIN_MARKER_SIZE,
  MAX_MARKER_SIZE,
} from "@/constants";
import {
  getCircleColorExpression,
  getCircleRadiusExpression,
  getPopulationExpression,
  getPopulationSortKey,
} from "@/components/map/MapView/MapLayer/expressions";

interface UseMapLayerExpressionsOptions {
  selectedYear: number;
  minPopulation?: number;
  maxPopulation?: number;
  minMarkerSize?: number;
  maxMarkerSize?: number;
}

export const useMapLayerExpressions = ({
  selectedYear,
  minPopulation = POPULATION_THRESHOLDS[0],
  maxPopulation = POPULATION_THRESHOLDS[POPULATION_THRESHOLDS.length - 1],
  minMarkerSize = MIN_MARKER_SIZE,
  maxMarkerSize = MAX_MARKER_SIZE,
}: UseMapLayerExpressionsOptions) => {
  const selectedCentury = String(selectedYear);

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
    () => getCircleColorExpression(selectedCentury),
    [selectedCentury]
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
