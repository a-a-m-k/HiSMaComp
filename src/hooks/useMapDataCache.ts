import { useMemo, useCallback, useRef } from "react";
import { Town } from "@/common/types";

export const useMapDataCache = () => {
  const calculationCache = useRef<Map<string, any>>(new Map());

  const filterTownsByYear = useCallback(
    (towns: Town[], year: number): Town[] => {
      const cacheKey = `filter-${year}-${towns.length}`;

      if (calculationCache.current.has(cacheKey)) {
        return calculationCache.current.get(cacheKey);
      }

      const filtered = towns.filter(
        (town) =>
          town.populationByCentury &&
          town.populationByCentury[year] !== undefined &&
          town.populationByCentury[year] !== null,
      );

      calculationCache.current.set(cacheKey, filtered);

      // Prevent memory leaks
      if (calculationCache.current.size > 20) {
        const firstKey = calculationCache.current.keys().next().value;
        calculationCache.current.delete(firstKey);
      }

      return filtered;
    },
    [],
  );

  const getPopulationStats = useCallback((towns: Town[], year: number) => {
    const cacheKey = `stats-${year}-${towns.length}`;

    if (calculationCache.current.has(cacheKey)) {
      return calculationCache.current.get(cacheKey);
    }

    const populations = towns
      .map((town) => town.populationByCentury[year])
      .filter((pop) => pop !== null && pop !== undefined) as number[];

    const stats = {
      total: populations.length,
      min: Math.min(...populations),
      max: Math.max(...populations),
      average:
        populations.reduce((sum, pop) => sum + pop, 0) / populations.length,
      median: populations.sort((a, b) => a - b)[
        Math.floor(populations.length / 2)
      ],
    };

    calculationCache.current.set(cacheKey, stats);
    return stats;
  }, []);

  const clearCache = useCallback(() => {
    calculationCache.current.clear();
  }, []);

  return {
    filterTownsByYear,
    getPopulationStats,
    clearCache,
  };
};
