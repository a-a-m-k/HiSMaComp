import { describe, it, expect } from "vitest";
import {
  getBounds,
  calculateAverageCenter,
  calculateFitZoom,
  filterTownsByYear,
  townsToGeoJSON,
} from "../../src/utils/utils";
import { Town } from "../../src/common/types";
import { mockTowns } from "../helpers/testUtils";

describe("getBounds", () => {
  it("should calculate correct bounds for valid towns", () => {
    const bounds = getBounds(mockTowns);

    // Test bounds calculation for Rome, Paris, and London
    expect(bounds.minLat).toBeCloseTo(41.9028, 4); // Rome latitude
    expect(bounds.maxLat).toBeCloseTo(51.5074, 4); // London latitude
    expect(bounds.minLng).toBeCloseTo(-0.1278, 4); // London longitude
    expect(bounds.maxLng).toBeCloseTo(12.4964, 4); // Rome longitude
  });

  it("should return zero bounds for empty array", () => {
    const bounds = getBounds([]);

    expect(bounds).toEqual({ minLat: 0, maxLat: 0, minLng: 0, maxLng: 0 });
  });

  it("should throw error for invalid input", () => {
    expect(() => getBounds(null as unknown as Town[])).toThrow(
      "Towns must be an array"
    );
  });
});

describe("calculateFitZoom", () => {
  it("should calculate appropriate zoom level", () => {
    const zoom = calculateFitZoom(mockTowns, 800, 600);

    // Zoom should be within valid MapLibre range
    expect(zoom).toBeGreaterThan(0);
    expect(zoom).toBeLessThanOrEqual(20);
  });

  it("should return default zoom for single town", () => {
    const zoom = calculateFitZoom([mockTowns[0]], 800, 600);

    expect(zoom).toBe(4);
  });
});

describe("filterTownsByYear", () => {
  it("should filter towns with valid population data", () => {
    const filtered = filterTownsByYear(mockTowns, 1000);

    expect(filtered).toHaveLength(3); // All mock towns have data for 1000
    expect(
      filtered.every(
        town =>
          town.populationByYear[1000] !== null &&
          town.populationByYear[1000]! > 0
      )
    ).toBe(true);
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

describe("townsToGeoJSON", () => {
  it("should convert towns to valid GeoJSON", () => {
    const geoJSON = townsToGeoJSON(mockTowns);

    // Verify GeoJSON structure and content
    expect(geoJSON.type).toBe("FeatureCollection");
    expect(geoJSON.features).toHaveLength(3);
    expect(geoJSON.features[0].type).toBe("Feature");
    expect(geoJSON.features[0].geometry.type).toBe("Point");
    expect(geoJSON.features[0].properties).toBeTruthy();
    expect(geoJSON.features[0].properties?.name).toBe("Paris");
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

describe("calculateAverageCenter", () => {
  it("should calculate simple average center correctly", () => {
    const towns: Town[] = [
      {
        name: "Town 1",
        latitude: 40.0,
        longitude: 10.0,
        populationByYear: {},
      },
      {
        name: "Town 2",
        latitude: 50.0,
        longitude: 20.0,
        populationByYear: {},
      },
    ];

    const center = calculateAverageCenter(towns);

    expect(center.latitude).toBeCloseTo(45.0, 1);
    expect(center.longitude).toBeCloseTo(15.0, 1);
  });

  it("should return zero center for empty array", () => {
    const center = calculateAverageCenter([]);
    expect(center).toEqual({ latitude: 0, longitude: 0 });
  });

  it("should filter out invalid coordinates", () => {
    const towns: Town[] = [
      {
        name: "Valid Town",
        latitude: 40.0,
        longitude: 10.0,
        populationByYear: {},
      },
      {
        name: "Invalid Town",
        latitude: 200,
        longitude: 200,
        populationByYear: {},
      } as Town,
    ];

    const center = calculateAverageCenter(towns);

    // Should only use the valid town
    expect(center.latitude).toBeCloseTo(40.0, 1);
    expect(center.longitude).toBeCloseTo(10.0, 1);
  });
});

describe("Center Calculation Comprehensive Tests", () => {
  describe("calculateAverageCenter - Arithmetic Mean", () => {
    it("should calculate simple arithmetic mean of all valid coordinates", () => {
      const towns: Town[] = [
        { name: "Town1", latitude: 10, longitude: 20, populationByYear: {} },
        { name: "Town2", latitude: 20, longitude: 30, populationByYear: {} },
        { name: "Town3", latitude: 30, longitude: 40, populationByYear: {} },
      ];

      const center = calculateAverageCenter(towns);

      // Simple average: lat (10+20+30)/3=20, lng (20+30+40)/3=30
      expect(center.latitude).toBeCloseTo(20.0, 1);
      expect(center.longitude).toBeCloseTo(30.0, 1);
    });

    it("should ignore towns with invalid coordinates", () => {
      const towns: Town[] = [
        { name: "Valid1", latitude: 10, longitude: 20, populationByYear: {} },
        { name: "Invalid", latitude: NaN, longitude: 30, populationByYear: {} },
        { name: "Valid2", latitude: 30, longitude: 40, populationByYear: {} },
        {
          name: "Invalid2",
          latitude: 50,
          longitude: NaN,
          populationByYear: {},
        },
      ];

      const center = calculateAverageCenter(towns);

      // Should only use valid towns: lat (10+30)/2=20, lng (20+40)/2=30
      expect(center.latitude).toBeCloseTo(20.0, 1);
      expect(center.longitude).toBeCloseTo(30.0, 1);
    });

    it("should handle towns with extreme but valid coordinates", () => {
      const towns: Town[] = [
        { name: "MaxLat", latitude: 90, longitude: 0, populationByYear: {} },
        { name: "MinLat", latitude: -90, longitude: 0, populationByYear: {} },
        { name: "MaxLng", latitude: 0, longitude: 180, populationByYear: {} },
        { name: "MinLng", latitude: 0, longitude: -180, populationByYear: {} },
      ];

      const center = calculateAverageCenter(towns);

      // Should handle extreme coordinates: lat (90-90+0+0)/4=0, lng (0+0+180-180)/4=0
      expect(center.latitude).toBeCloseTo(0.0, 1);
      expect(center.longitude).toBeCloseTo(0.0, 1);
    });

    it("should return zero center when all towns have invalid coordinates", () => {
      const towns: Town[] = [
        {
          name: "Invalid1",
          latitude: NaN,
          longitude: NaN,
          populationByYear: {},
        },
        {
          name: "Invalid2",
          latitude: 91,
          longitude: 181,
          populationByYear: {},
        }, // Out of bounds
        {
          name: "Invalid3",
          latitude: -91,
          longitude: -181,
          populationByYear: {},
        }, // Out of bounds
      ];

      const center = calculateAverageCenter(towns);

      expect(center).toEqual({ latitude: 0, longitude: 0 });
    });
  });
});
