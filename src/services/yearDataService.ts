import { Town } from "@/common/types";

import {
  filterTownsByYear,
  getBounds,
  calculateAverageCenter,
  townsToGeoJSON,
} from "@/utils/utils";
import { LRUCache } from "@/utils/cache";

/**
 * Data structure containing processed year-specific information.
 */
interface YearData {
  /** Towns that exist and have population > 0 for the specified year */
  filteredTowns: Town[];
  /** Geographic bounds of filtered towns */
  bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number };
  /** Geographic center point (arithmetic mean) of filtered towns */
  center: { latitude: number; longitude: number };
  /** GeoJSON FeatureCollection for map rendering */
  geojson: GeoJSON.FeatureCollection;
}

/**
 * Service for processing and caching year-specific town data.
 * Uses LRU cache to optimize performance when switching between years.
 */
class YearDataService {
  private yearDataCache = new LRUCache<string, YearData>(50);
  private townsArrayIds = new WeakMap<Town[], number>();
  private nextTownsArrayId = 1;

  /**
   * Gets processed year data (filtered towns, bounds, center, GeoJSON) for a specific year.
   * Uses LRU cache to avoid redundant calculations when switching between previously viewed years.
   *
   * @param towns - Array of all town objects (across all time periods)
   * @param year - Year to filter by (e.g., 800, 1000, 1200)
   * @returns YearData object with filtered towns, bounds, center, and GeoJSON
   *
   * @example
   * ```ts
   * const year1200Data = yearDataService.getYearData(allTowns, 1200);
   * // Returns cached or newly computed data for year 1200
   * ```
   */
  getYearData(towns: Town[], year: number): YearData {
    const cacheKey = this.createCacheKey(towns, year);

    const cachedData = this.yearDataCache.get(cacheKey);
    if (cachedData !== undefined) {
      return cachedData;
    }

    const filteredTowns = filterTownsByYear(towns, year);
    const bounds = getBounds(filteredTowns);
    const center = calculateAverageCenter(filteredTowns);
    const geojson = townsToGeoJSON(filteredTowns);

    const yearData: YearData = {
      filteredTowns,
      bounds,
      center,
      geojson,
    };

    this.yearDataCache.set(cacheKey, yearData);
    return yearData;
  }

  /**
   * Clears all cached year data.
   * Useful for resetting cache when town data changes.
   */
  clearCache(): void {
    this.yearDataCache.clear();
  }

  /**
   * Gets cache statistics including size, max size, and utilization percentage.
   *
   * @returns Object with cache statistics
   *
   * @example
   * ```ts
   * const stats = yearDataService.getCacheStats();
   * // Returns: { yearDataCacheSize: 8, maxCacheSize: 50, utilization: 16 }
   * ```
   */
  getCacheStats() {
    const stats = this.yearDataCache.getStats();
    return {
      yearDataCacheSize: stats.size,
      maxCacheSize: stats.maxSize,
      utilization: stats.utilization,
    };
  }

  /**
   * Creates a cache key based on the towns array identity and year.
   * This avoids expensive sorting/hashing work on every request while still
   * producing stable keys for each towns dataset instance.
   *
   * @param towns - Array of town objects
   * @param year - Year to filter by
   * @returns Cache key string
   */
  private createCacheKey(towns: Town[], year: number): string {
    if (towns.length === 0) {
      return `empty-${year}`;
    }

    let townsId = this.townsArrayIds.get(towns);
    if (!townsId) {
      townsId = this.nextTownsArrayId++;
      this.townsArrayIds.set(towns, townsId);
    }
    return `${townsId}-${towns.length}-${year}`;
  }
}

export const yearDataService = new YearDataService();
