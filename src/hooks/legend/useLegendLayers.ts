import { useMemo } from "react";
import { useMediaQuery, useTheme } from "@mui/material";

import {
  MAP_LEGEND_COLORS,
  POPULATION_THRESHOLDS,
  POPULATION_THRESHOLDS_MOBILE,
} from "@/constants";

type LegendLayer = {
  color: string;
  layer: string;
};

const getPopulationThresholds = (isMobile: boolean): (string | number)[] =>
  isMobile ? POPULATION_THRESHOLDS_MOBILE : POPULATION_THRESHOLDS;

const createPopulationLayers = (
  thresholds: (string | number)[],
  colors: string[]
): LegendLayer[] => {
  return thresholds.map((threshold, index) => {
    const isLast = index === thresholds.length - 1;
    const nextThreshold = thresholds[index + 1];

    return {
      color: colors[index + 1],
      layer: isLast ? `${threshold}+` : `${threshold}-${nextThreshold}`,
    };
  });
};

const createNoDataLayer = (isMobile: boolean, color: string): LegendLayer => ({
  color,
  layer: isMobile ? "No data" : "No data for the current time period",
});

export const useLegendLayers = (
  legendColors: string[] = MAP_LEGEND_COLORS
): LegendLayer[] => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return useMemo(() => {
    const thresholds = getPopulationThresholds(isMobile);
    const populationLayers = createPopulationLayers(thresholds, legendColors);
    const noDataLayer = createNoDataLayer(isMobile, legendColors[0]);

    return [noDataLayer, ...populationLayers];
  }, [isMobile, legendColors]);
};
