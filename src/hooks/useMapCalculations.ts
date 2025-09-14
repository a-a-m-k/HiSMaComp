import { useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { getCenter, getFitZoom } from "@/utils/utils";

/**
 * Calculates map center and zoom based on the currently selected year
 * Grabs the year from context and figures out where to position the map
 */
export const useMapCalculations = () => {
  const { selectedYear, filteredTowns } = useApp();

  const center = useMemo(() => {
    try {
      if (filteredTowns.length === 0) return { latitude: 0, longitude: 0 };
      return getCenter(filteredTowns, selectedYear);
    } catch (error) {
      console.error("Error calculating map center:", error);
      return { latitude: 0, longitude: 0 };
    }
  }, [filteredTowns, selectedYear]);

  const fitZoom = useMemo(() => {
    try {
      if (filteredTowns.length === 0) return 4;
      return getFitZoom(filteredTowns, window.innerWidth, window.innerHeight);
    } catch (error) {
      console.error("Error calculating fit zoom:", error);
      return 4;
    }
  }, [filteredTowns]);

  return {
    center,
    fitZoom,
  };
};
