import { useCallback, useRef } from "react";
import { Town, PopulationStats } from "@/common/types";
import {
  filterTownsByYear as filterTownsByYearUtil,
  getPopulationStats as getPopulationStatsUtil,
  getCenter as getCenterUtil,
  getBounds as getBoundsUtil,
} from "@/utils/utils";
import { MAX_CALCULATION_CACHE_SIZE } from "@/constants";

/**
 * Hook for working with town data - filters, stats, and calculations
 * Caches results to avoid recalculating the same stuff over and over
 */
export const useTownData = (towns: Town[]) => {
  const townCache = useRef<Map<string, Town[]>>(new Map());
  const statsCache = useRef<Map<string, PopulationStats>>(new Map());

  const filterTownsByYear = useCallback(
    (towns: Town[], year: number): Town[] => {
      const cacheKey = `filter-${year}-${towns.length}`;

      if (townCache.current.has(cacheKey)) {
        return townCache.current.get(cacheKey)!;
      }

      const filtered = filterTownsByYearUtil(towns, year);

      townCache.current.set(cacheKey, filtered);

      // Prevent memory leaks
      if (townCache.current.size > MAX_CALCULATION_CACHE_SIZE) {
        const firstKey = townCache.current.keys().next().value;
        townCache.current.delete(firstKey);
      }

      return filtered;
    },
    []
  );

  const getPopulationStats = useCallback((towns: Town[], year: number) => {
    const cacheKey = `stats-${year}-${towns.length}`;

    if (statsCache.current.has(cacheKey)) {
      return statsCache.current.get(cacheKey)!;
    }

    const stats = getPopulationStatsUtil(towns, year);

    statsCache.current.set(cacheKey, stats);
    return stats;
  }, []);

  const getCenter = useCallback(
    (year?: number) => getCenterUtil(towns, year),
    [towns]
  );

  const getBounds = useCallback(
    (year?: number) => getBoundsUtil(towns, year),
    [towns]
  );

  const clearCache = useCallback(() => {
    townCache.current.clear();
    statsCache.current.clear();
  }, []);

  return {
    filterTownsByYear,
    getPopulationStats,
    getCenter,
    getBounds,
    clearCache,
  };
};
