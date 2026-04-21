import { Town } from "@/common/types";
import { MAX_CACHE_SIZE } from "@/constants";
import {
  filterTownsByYear,
  getBounds,
  calculateAverageCenter,
  townsToGeoJSON,
} from "@/utils/utils";
import { LRUCache } from "@/utils/cache";

interface YearData {
  filteredTowns: Town[];
  bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number };
  center: { latitude: number; longitude: number };
  geojson: GeoJSON.FeatureCollection;
}

/** Caches computed year data (filtered towns, bounds, center, GeoJSON) so switching centuries is cheap. */
class YearDataService {
  private yearDataCache = new LRUCache<string, YearData>(MAX_CACHE_SIZE);
  private filteredTownsCache = new LRUCache<string, Town[]>(MAX_CACHE_SIZE);

  /**
   * Context-facing API: only return year-filtered towns without map-specific derived data.
   */
  getFilteredTowns(towns: Town[], year: number): Town[] {
    const cacheKey = this.createCacheKey(towns, year);
    const cachedData = this.filteredTownsCache.get(cacheKey);
    if (cachedData !== undefined) {
      return cachedData;
    }
    const filteredTowns = filterTownsByYear(towns, year);
    this.filteredTownsCache.set(cacheKey, filteredTowns);
    return filteredTowns;
  }

  getYearData(towns: Town[], year: number): YearData {
    const cacheKey = this.createCacheKey(towns, year);

    const cachedData = this.yearDataCache.get(cacheKey);
    if (cachedData !== undefined) {
      return cachedData;
    }

    const filteredTowns = filterTownsByYear(towns, year);
    const bounds = getBounds(filteredTowns);
    const center = calculateAverageCenter(filteredTowns);
    const geojson = townsToGeoJSON(filteredTowns, year);

    const yearData: YearData = {
      filteredTowns,
      bounds,
      center,
      geojson,
    };

    this.yearDataCache.set(cacheKey, yearData);
    return yearData;
  }

  clearCache(): void {
    this.yearDataCache.clear();
    this.filteredTownsCache.clear();
  }

  getCacheStats() {
    const stats = this.yearDataCache.getStats();
    const filteredStats = this.filteredTownsCache.getStats();
    return {
      yearDataCacheSize: stats.size,
      filteredTownsCacheSize: filteredStats.size,
      maxCacheSize: stats.maxSize,
      utilization: stats.utilization,
    };
  }

  /**
   * Robust deterministic fingerprint of town content + year.
   * Uses canonical ordering to avoid order-dependent cache misses and keeps full precision.
   */
  private createCacheKey(towns: Town[], year: number): string {
    if (towns.length === 0) {
      return `empty-${year}`;
    }

    const canonicalTowns = [...towns]
      .sort((a, b) => {
        const nameCmp = a.name.localeCompare(b.name);
        if (nameCmp !== 0) return nameCmp;
        if (a.latitude !== b.latitude) return a.latitude - b.latitude;
        return a.longitude - b.longitude;
      })
      .map(town => ({
        name: town.name,
        latitude: town.latitude,
        longitude: town.longitude,
        nameVariants: town.nameVariants ? [...town.nameVariants] : [],
        populationByYear: Object.entries(town.populationByYear ?? {})
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([y, p]) => [y, p] as const),
      }));

    return `${year}:${JSON.stringify(canonicalTowns)}`;
  }
}

export const yearDataService = new YearDataService();
