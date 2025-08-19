import { useMediaQuery, useTheme } from "@mui/material";
import {
  MAP_LEGEND_COLORS,
  POPULATION_TRESHOLDS,
  POPULATION_TRESHOLDS_MOBILE,
} from "../constants";
import { useMemo } from "react";

const getPopulationThresholds = (isMobile: boolean): (string | number)[] =>
  isMobile ? POPULATION_TRESHOLDS_MOBILE : POPULATION_TRESHOLDS;

export const useLegendLayers = (
  legendColors: string[] = MAP_LEGEND_COLORS,
): { color: string; layer: string }[] => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const thresholds = useMemo(
    () => getPopulationThresholds(isMobile),
    [isMobile],
  );

  const legendLayers = useMemo(() => {
    const layers = thresholds.map((threshold, idx, arr) => ({
      color: legendColors[idx + 1],
      layer:
        idx === arr.length - 1
          ? `${threshold}+`
          : `${threshold}-${arr[idx + 1]}`,
    }));

    layers.unshift({
      color: legendColors[0],
      layer: isMobile ? "No data" : "No data for the current time period",
    });

    return layers;
  }, [thresholds, legendColors, isMobile]);

  return legendLayers;
};
