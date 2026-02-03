import { useMemo } from "react";
import { Town } from "@/common/types";
import { townsToGeoJSON } from "@/utils/utils";
import { logger } from "@/utils/logger";

/**
 * Custom hook for converting towns array to GeoJSON format.
 * Handles edge cases and errors gracefully.
 *
 * @param towns - Array of town objects to convert to GeoJSON
 * @returns GeoJSON FeatureCollection object
 */
export const useTownsGeoJSON = (towns: Town[] | undefined) => {
  return useMemo(() => {
    try {
      if (!towns || !Array.isArray(towns) || towns.length === 0) {
        return {
          type: "FeatureCollection" as const,
          features: [],
        };
      }

      return townsToGeoJSON(towns);
    } catch (error) {
      logger.error("Error getting GeoJSON:", error);
      return {
        type: "FeatureCollection" as const,
        features: [],
      };
    }
  }, [towns]);
};
