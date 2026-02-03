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
   * Creates a deterministic cache key based on towns array content and year.
   * Uses a hash function to prevent collisions when different town arrays
   * might have similar sampled names.
   *
   * @param towns - Array of town objects
   * @param year - Year to filter by
   * @returns Cache key string
   */
  private createCacheKey(towns: Town[], year: number): string {
    if (towns.length === 0) {
      return `empty-${year}`;
    }

    const sortedTowns = [...towns].sort((a, b) => {
      if (a.name !== b.name) {
        return a.name.localeCompare(b.name);
      }
      if (a.latitude !== b.latitude) {
        return a.latitude - b.latitude;
      }
      return a.longitude - b.longitude;
    });

    const townIdentifiers = sortedTowns
      .map(t => `${t.name}:${t.latitude.toFixed(4)}:${t.longitude.toFixed(4)}`)
      .join("|");

    const hash = this.simpleHash(townIdentifiers);
    return `${hash}-${towns.length}-${year}`;
  }

  /**
   * Simple hash function to convert string to hash string.
   * Based on djb2 algorithm for deterministic hashing.
   *
   * @param str - String to hash
   * @returns Hash string value
   */
  private simpleHash(str: string): string {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) + hash + str.charCodeAt(i);
      hash = hash | 0; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36); // Convert to base36 string for shorter key
  }
}

export const yearDataService = new YearDataService();
