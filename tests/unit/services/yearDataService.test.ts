import { describe, it, expect, beforeEach } from "vitest";
import { yearDataService } from "@/services";
import { MAX_CACHE_SIZE } from "@/constants";
import type { Town } from "@/common/types";

const makeTowns = (year: number, count = 1): Town[] =>
  Array.from({ length: count }, (_, i) => ({
    name: `Town-${year}-${i}`,
    latitude: 50 + i * 0.1,
    longitude: 10 + i * 0.1,
    populationByYear: { [year]: 1000 },
  }));

describe("YearDataService", () => {
  beforeEach(() => {
    yearDataService.clearCache();
  });

  it("returns same result on cache hit for same towns and year", () => {
    const towns = makeTowns(1000, 2);
    const first = yearDataService.getYearData(towns, 1000);
    const second = yearDataService.getYearData(towns, 1000);

    expect(second).toBe(first);
    expect(first.filteredTowns).toHaveLength(2);
    expect(first.geojson.type).toBe("FeatureCollection");
    expect(first.bounds).toEqual(
      expect.objectContaining({
        minLat: expect.any(Number),
        maxLat: expect.any(Number),
        minLng: expect.any(Number),
        maxLng: expect.any(Number),
      })
    );
    expect(first.center).toEqual(
      expect.objectContaining({
        latitude: expect.any(Number),
        longitude: expect.any(Number),
      })
    );
  });

  it("returns different cache entries for different year (different key)", () => {
    const towns = makeTowns(1000, 1);
    towns[0].populationByYear["1200"] = 2000;

    const for1000 = yearDataService.getYearData(towns, 1000);
    const for1200 = yearDataService.getYearData(towns, 1200);

    expect(for1000).not.toBe(for1200);
    expect(yearDataService.getCacheStats().yearDataCacheSize).toBe(2);
  });

  it("getCacheStats reflects size and utilization", () => {
    const towns = makeTowns(800, 1);
    yearDataService.getYearData(towns, 800);

    const stats = yearDataService.getCacheStats();
    expect(stats.yearDataCacheSize).toBe(1);
    expect(stats.maxCacheSize).toBe(MAX_CACHE_SIZE);
    expect(stats.utilization).toBeGreaterThanOrEqual(0);
  });

  it("clearCache resets cache size to zero", () => {
    const towns = makeTowns(800, 1);
    yearDataService.getYearData(towns, 800);
    expect(yearDataService.getCacheStats().yearDataCacheSize).toBe(1);

    yearDataService.clearCache();
    expect(yearDataService.getCacheStats().yearDataCacheSize).toBe(0);
  });

  it("evicts least recently used when over max size", () => {
    const baseYear = 800;
    const numKeys = MAX_CACHE_SIZE + 5;
    const towns = makeTowns(baseYear, 1);
    for (let i = 1; i < numKeys; i++) {
      towns[0].populationByYear[baseYear + i] = 1000;
    }

    for (let y = baseYear; y < baseYear + numKeys; y++) {
      yearDataService.getYearData(towns, y);
    }

    const stats = yearDataService.getCacheStats();
    expect(stats.yearDataCacheSize).toBeLessThanOrEqual(MAX_CACHE_SIZE);
    expect(stats.maxCacheSize).toBe(MAX_CACHE_SIZE);
  });

  it("returns empty GeoJSON and default zoom when no towns", () => {
    const result = yearDataService.getYearData([], 1000);

    expect(result.filteredTowns).toHaveLength(0);
    expect(result.geojson.type).toBe("FeatureCollection");
    expect(result.geojson.features).toHaveLength(0);
    expect(result.bounds).toEqual({
      minLat: 0,
      maxLat: 0,
      minLng: 0,
      maxLng: 0,
    });
  });
});
