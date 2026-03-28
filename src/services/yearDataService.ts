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
  }

  getCacheStats() {
    const stats = this.yearDataCache.getStats();
    return {
      yearDataCacheSize: stats.size,
      maxCacheSize: stats.maxSize,
      utilization: stats.utilization,
    };
  }

  /** Deterministic key from town content + year; linear hash so we don’t sort. */
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
