import { Town } from "@/common/types";
import { MAX_CACHE_SIZE } from "@/constants";
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
  private yearDataCache = new LRUCache<string, YearData>(MAX_CACHE_SIZE);

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
   * Creates a deterministic cache key from town content and year.
   * Uses a linear-time hash over town fields to avoid expensive O(n log n) sort
   * while still reflecting in-place data mutations.
   *
   * @param towns - Array of town objects
   * @param year - Year to filter by
   * @returns Cache key string
   */
  private createCacheKey(towns: Town[], year: number): string {
    if (towns.length === 0) {
      return `empty-${year}`;
    }

    let hash = 2166136261;

    for (const town of towns) {
      hash = this.fnv1aString(hash, town.name);
      hash = this.fnv1aString(hash, `${town.latitude.toFixed(4)}`);
      hash = this.fnv1aString(hash, `${town.longitude.toFixed(4)}`);

      if (town.populationByYear) {
        for (const [k, v] of Object.entries(town.populationByYear)) {
          hash = this.fnv1aString(hash, k);
          hash = this.fnv1aString(hash, `${v}`);
        }
      }
    }

    return `${(hash >>> 0).toString(36)}-${towns.length}-${year}`;
  }

  /**
   * FNV-1a string hash step.
   *
   * @param seed - Current hash seed
   * @param input - Text to hash
   * @returns Updated hash
   */
  private fnv1aString(seed: number, input: string): number {
    let hash = seed;
    for (let i = 0; i < input.length; i++) {
      hash ^= input.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return hash;
  }
}

export const yearDataService = new YearDataService();
