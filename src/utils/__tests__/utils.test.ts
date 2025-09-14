import { describe, it, expect } from "vitest";
import {
  getBounds,
  getCenter,
  getFitZoom,
  filterTownsByYear,
  getPopulationStats,
  townsToGeoJSON,
} from "../utils";
import { Town } from "@/common/types";
import { mockTowns } from "../../test/testUtils";

describe("getBounds", () => {
  it("should calculate correct bounds for valid towns", () => {
    const bounds = getBounds(mockTowns, 1000);

    // Test bounds calculation for Rome, Paris, and London
    expect(bounds.minLat).toBeCloseTo(41.9028, 4); // Rome latitude
    expect(bounds.maxLat).toBeCloseTo(51.5074, 4); // London latitude
    expect(bounds.minLng).toBeCloseTo(-0.1278, 4); // London longitude
    expect(bounds.maxLng).toBeCloseTo(12.4964, 4); // Rome longitude
  });

  it("should return zero bounds for empty array", () => {
    const bounds = getBounds([], 1000);

    expect(bounds).toEqual({ minLat: 0, maxLat: 0, minLng: 0, maxLng: 0 });
  });

  it("should throw error for invalid input", () => {
    expect(() => getBounds(null as unknown as Town[], 1000)).toThrow(
      "Towns must be an array"
    );
    expect(() => getBounds(mockTowns, -1)).toThrow(
      "Year must be a valid positive number"
    );
  });
});

describe("getCenter", () => {
  it("should calculate correct center point", () => {
    const center = getCenter(mockTowns, 1000);

    // Center should be the midpoint of all town coordinates
    expect(center.latitude).toBeCloseTo(46.7051, 4);
    expect(center.longitude).toBeCloseTo(6.1843, 4);
  });

  it("should return zero center for empty array", () => {
    const center = getCenter([], 1000);

    expect(center).toEqual({ latitude: 0, longitude: 0 });
  });
});

describe("getFitZoom", () => {
  it("should calculate appropriate zoom level", () => {
    const zoom = getFitZoom(mockTowns, 800, 600);

    // Zoom should be within valid MapLibre range
    expect(zoom).toBeGreaterThan(0);
    expect(zoom).toBeLessThanOrEqual(20);
  });

  it("should return default zoom for single town", () => {
    const zoom = getFitZoom([mockTowns[0]], 800, 600);

    expect(zoom).toBe(4);
  });
});

describe("filterTownsByYear", () => {
  it("should filter towns with valid population data", () => {
    const filtered = filterTownsByYear(mockTowns, 1000);

    expect(filtered).toHaveLength(3); // All mock towns have data for 1000
    expect(filtered.every(town => town.populationByYear[1000] > 0)).toBe(true);
  });

  it("should return empty array for year with no data", () => {
    const filtered = filterTownsByYear(mockTowns, 1800);

    expect(filtered).toHaveLength(0);
  });

  it("should throw error for invalid input", () => {
    expect(() => filterTownsByYear(null as unknown as Town[], 1000)).toThrow(
      "Towns must be an array"
    );
    expect(() => filterTownsByYear(mockTowns, -1)).toThrow(
      "Year must be a valid positive number"
    );
  });
});

describe("getPopulationStats", () => {
  it("should calculate correct population statistics", () => {
    const stats = getPopulationStats(mockTowns, 1000);

    // Test population statistics calculation
    expect(stats.total).toBe(3); // Total towns with data
    expect(stats.min).toBe(15000); // Rome population
    expect(stats.max).toBe(35000); // London population
    expect(stats.average).toBeCloseTo(23333.33, 2); // Average of all populations
    expect(stats.median).toBe(20000); // Paris population (middle value)
  });

  it("should return zero stats for empty data", () => {
    const stats = getPopulationStats([], 1000);

    expect(stats).toEqual({ total: 0, min: 0, max: 0, average: 0, median: 0 });
  });

  it("should throw error for invalid input", () => {
    expect(() => getPopulationStats(null as unknown as Town[], 1000)).toThrow(
      "Towns must be an array"
    );
    expect(() => getPopulationStats(mockTowns, -1)).toThrow(
      "Year must be a valid positive number"
    );
  });
});

describe("townsToGeoJSON", () => {
  it("should convert towns to valid GeoJSON", () => {
    const geoJSON = townsToGeoJSON(mockTowns);

    // Verify GeoJSON structure and content
    expect(geoJSON.type).toBe("FeatureCollection");
    expect(geoJSON.features).toHaveLength(3);
    expect(geoJSON.features[0].type).toBe("Feature");
    expect(geoJSON.features[0].geometry.type).toBe("Point");
    expect(geoJSON.features[0].properties.name).toBe("Paris");
  });

  it("should filter out invalid towns", () => {
    const invalidTowns = [
      ...mockTowns,
      { name: "", latitude: 0, longitude: 0, populationByYear: {} } as Town,
      {
        name: "Invalid",
        latitude: 200,
        longitude: 200,
        populationByYear: {},
      } as Town,
    ];

    const geoJSON = townsToGeoJSON(invalidTowns);

    expect(geoJSON.features).toHaveLength(3); // Only valid towns should be included
  });

  it("should throw error for invalid input", () => {
    expect(() => townsToGeoJSON(null as unknown as Town[])).toThrow(
      "Localities must be an array"
    );
  });
});
