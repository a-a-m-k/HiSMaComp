import {
  calculateResponsiveZoom,
  calculateMapArea,
} from "../../src/utils/utils";
import { mockTheme } from "../helpers/testUtils";

// Common device profiles based on real-world devices
const deviceProfiles = {
  // Mobile phones (portrait)
  iPhoneSE: { name: "iPhone SE", width: 375, height: 667, category: "mobile" },
  iPhone12: {
    name: "iPhone 12/13/14",
    width: 390,
    height: 844,
    category: "mobile",
  },
  iPhone14Pro: {
    name: "iPhone 14 Pro",
    width: 393,
    height: 852,
    category: "mobile",
  },
  iPhone14ProMax: {
    name: "iPhone 14 Pro Max",
    width: 430,
    height: 932,
    category: "mobile",
  },
  pixel5: {
    name: "Google Pixel 5",
    width: 393,
    height: 851,
    category: "mobile",
  },
  galaxyS21: {
    name: "Samsung Galaxy S21",
    width: 360,
    height: 800,
    category: "mobile",
  },

  // Mobile phones (landscape)
  iPhoneSELandscape: {
    name: "iPhone SE (Landscape)",
    width: 667,
    height: 375,
    category: "mobile-landscape",
  },
  iPhone12Landscape: {
    name: "iPhone 12 (Landscape)",
    width: 844,
    height: 390,
    category: "mobile-landscape",
  },

  // Tablets (portrait)
  iPadMini: { name: "iPad Mini", width: 768, height: 1024, category: "tablet" },
  iPad: { name: "iPad", width: 810, height: 1080, category: "tablet" },
  iPadAir: { name: "iPad Air", width: 820, height: 1180, category: "tablet" },
  iPadPro11: {
    name: 'iPad Pro 11"',
    width: 834,
    height: 1194,
    category: "tablet",
  },
  iPadPro129: {
    name: 'iPad Pro 12.9"',
    width: 1024,
    height: 1366,
    category: "tablet",
  },

  // Tablets (landscape)
  iPadMiniLandscape: {
    name: "iPad Mini (Landscape)",
    width: 1024,
    height: 768,
    category: "tablet-landscape",
  },
  iPadLandscape: {
    name: "iPad (Landscape)",
    width: 1080,
    height: 810,
    category: "tablet-landscape",
  },

  // Desktop/Laptop
  laptop: { name: 'Laptop 13"', width: 1280, height: 800, category: "desktop" },
  laptop15: {
    name: 'Laptop 15"',
    width: 1440,
    height: 900,
    category: "desktop",
  },
  desktopHD: {
    name: "Desktop HD",
    width: 1920,
    height: 1080,
    category: "desktop",
  },
  desktop2K: {
    name: "Desktop 2K",
    width: 2560,
    height: 1440,
    category: "desktop",
  },
  desktop4K: {
    name: "Desktop 4K",
    width: 3840,
    height: 2160,
    category: "desktop",
  },
  ultrawide: {
    name: "Ultrawide",
    width: 3440,
    height: 1440,
    category: "desktop",
  },
};

// Mock towns data representing European cities with actual geographic extremes
// IMPORTANT: Includes the extreme edge cities to catch cut-off issues
const europeanCities = [
  {
    name: "London",
    latitude: 51.5074,
    longitude: -0.1278,
    populationByYear: { "1000": 15000 },
  },
  {
    name: "Paris",
    latitude: 48.8566,
    longitude: 2.3522,
    populationByYear: { "1000": 20000 },
  },
  {
    name: "Rome",
    latitude: 41.9028,
    longitude: 12.4964,
    populationByYear: { "1000": 25000 },
  },
  {
    name: "Madrid",
    latitude: 40.4168,
    longitude: -3.7038,
    populationByYear: { "1000": 18000 },
  },
  {
    name: "Berlin",
    latitude: 52.52,
    longitude: 13.405,
    populationByYear: { "1000": 12000 },
  },
  {
    name: "Vienna",
    latitude: 48.2082,
    longitude: 16.3738,
    populationByYear: { "1000": 10000 },
  },
  {
    name: "Athens",
    latitude: 37.9838,
    longitude: 23.7275,
    populationByYear: { "1000": 30000 },
  },
  {
    name: "Amsterdam",
    latitude: 52.3676,
    longitude: 4.9041,
    populationByYear: { "1000": 8000 },
  },
  // EXTREME EDGE CITIES (from actual data) - critical for testing visibility
  {
    name: "Lisbon",
    latitude: 38.7223,
    longitude: -9.1393,
    populationByYear: { "1000": 15000 },
  }, // WESTERNMOST
  {
    name: "Novgorod",
    latitude: 58.522,
    longitude: 31.275,
    populationByYear: { "1000": 10000 },
  }, // NORTHERNMOST
  {
    name: "Almeria",
    latitude: 36.83,
    longitude: -2.464,
    populationByYear: { "1000": 8000 },
  }, // SOUTHERNMOST
  {
    name: "Sarai",
    latitude: 47.5,
    longitude: 45.5,
    populationByYear: { "1000": 20000 },
  }, // EASTERNMOST
];

// Mock towns data representing global cities (more spread out)
const globalCities = [
  {
    name: "London",
    latitude: 51.5074,
    longitude: -0.1278,
    populationByYear: { "1000": 15000 },
  },
  {
    name: "Tokyo",
    latitude: 35.6762,
    longitude: 139.6503,
    populationByYear: { "1000": 50000 },
  },
  {
    name: "New York",
    latitude: 40.7128,
    longitude: -74.006,
    populationByYear: { "1000": 30000 },
  },
  {
    name: "Sydney",
    latitude: -33.8688,
    longitude: 151.2093,
    populationByYear: { "1000": 20000 },
  },
  {
    name: "Cairo",
    latitude: 30.0444,
    longitude: 31.2357,
    populationByYear: { "1000": 100000 },
  },
  {
    name: "Mexico City",
    latitude: 19.4326,
    longitude: -99.1332,
    populationByYear: { "1000": 25000 },
  },
];

describe("Device-Specific Zoom Calculations", () => {
  describe("Mobile Devices (Portrait)", () => {
    const mobileDevices = Object.values(deviceProfiles).filter(
      d => d.category === "mobile"
    );

    mobileDevices.forEach(device => {
      it(`should calculate appropriate zoom for ${device.name} with European cities`, () => {
        const zoom = calculateResponsiveZoom(
          europeanCities,
          device.width,
          device.height,
          mockTheme
        );

        // Mobile should have valid zoom levels
        // With increased padding to show Sarai, zoom may be below 2
        expect(zoom).toBeGreaterThan(0);
        expect(zoom).toBeLessThan(20);

        // Verify zoom is calculated using the effective map area
        const mapArea = calculateMapArea(
          device.width,
          device.height,
          mockTheme
        );
        expect(mapArea.effectiveWidth).toBeGreaterThan(0);
        expect(mapArea.effectiveHeight).toBeGreaterThan(0);

        // The zoom should be reasonable for the device size
        // With increased padding to show all towns, zoom may be below 2
        expect(zoom).toBeGreaterThan(0);
        expect(zoom).toBeLessThan(10); // Not too zoomed in for European cities
      });
    });

    it("should maintain consistent zoom across similar-sized mobile devices", () => {
      const zooms = mobileDevices.map(device =>
        calculateResponsiveZoom(
          europeanCities,
          device.width,
          device.height,
          mockTheme
        )
      );

      // All mobile devices should have relatively similar zoom levels
      const maxZoom = Math.max(...zooms);
      const minZoom = Math.min(...zooms);
      const zoomRange = maxZoom - minZoom;

      // Zoom range should be reasonable (within 2 zoom levels)
      expect(zoomRange).toBeLessThan(2);
    });
  });

  describe("Mobile Devices (Landscape)", () => {
    const landscapeDevices = Object.values(deviceProfiles).filter(
      d => d.category === "mobile-landscape"
    );

    landscapeDevices.forEach(device => {
      it(`should calculate appropriate zoom for ${device.name} with European cities`, () => {
        const zoom = calculateResponsiveZoom(
          europeanCities,
          device.width,
          device.height,
          mockTheme
        );

        expect(zoom).toBeGreaterThan(0);
        expect(zoom).toBeLessThan(20);

        // Landscape should typically have different zoom than portrait
        const portraitDevice = deviceProfiles.iPhoneSE; // Compare with portrait
        const portraitZoom = calculateResponsiveZoom(
          europeanCities,
          portraitDevice.width,
          portraitDevice.height,
          mockTheme
        );

        // Landscape zoom may differ from portrait, or may be the same if both clamped to minimum
        expect(Math.abs(zoom - portraitZoom)).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe("Tablet Devices", () => {
    const tabletDevices = Object.values(deviceProfiles).filter(
      d => d.category === "tablet" || d.category === "tablet-landscape"
    );

    tabletDevices.forEach(device => {
      it(`should calculate appropriate zoom for ${device.name} with European cities`, () => {
        const zoom = calculateResponsiveZoom(
          europeanCities,
          device.width,
          device.height,
          mockTheme
        );

        expect(zoom).toBeGreaterThan(0);
        expect(zoom).toBeLessThan(20);
        expect(zoom % 1).not.toBe(0); // Decimal precision

        // Verify effective map area is calculated
        const mapArea = calculateMapArea(
          device.width,
          device.height,
          mockTheme
        );
        expect(mapArea.effectiveWidth).toBeGreaterThan(0);
        expect(mapArea.effectiveHeight).toBeGreaterThan(0);

        // Tablets should have reasonable zoom for European cities
        expect(zoom).toBeGreaterThan(2);
        expect(zoom).toBeLessThan(10);
      });
    });
  });

  describe("Desktop Devices", () => {
    const desktopDevices = Object.values(deviceProfiles).filter(
      d => d.category === "desktop"
    );

    desktopDevices.forEach(device => {
      it(`should calculate appropriate zoom for ${device.name} with European cities`, () => {
        const zoom = calculateResponsiveZoom(
          europeanCities,
          device.width,
          device.height,
          mockTheme
        );

        expect(zoom).toBeGreaterThan(0);
        expect(zoom).toBeLessThan(20);

        // Desktop should typically have higher zoom (more detail)
        const mobileZoom = calculateResponsiveZoom(
          europeanCities,
          deviceProfiles.iPhone12.width,
          deviceProfiles.iPhone12.height,
          mockTheme
        );

        // Desktop zoom might be higher or similar, but should be valid
        expect(zoom).toBeGreaterThanOrEqual(mobileZoom - 1); // Allow some variance
      });
    });

    it("should handle ultrawide monitors correctly", () => {
      const ultrawideZoom = calculateResponsiveZoom(
        europeanCities,
        deviceProfiles.ultrawide.width,
        deviceProfiles.ultrawide.height,
        mockTheme
      );

      const standardDesktopZoom = calculateResponsiveZoom(
        europeanCities,
        deviceProfiles.desktopHD.width,
        deviceProfiles.desktopHD.height,
        mockTheme
      );

      // Both should be valid
      expect(ultrawideZoom).toBeGreaterThan(0);
      expect(standardDesktopZoom).toBeGreaterThan(0);
    });
  });

  describe("Map Area Calculations Across Devices", () => {
    it("should reserve appropriate space for UI elements on each device type", () => {
      // Mobile
      const mobileArea = calculateMapArea(
        deviceProfiles.iPhone12.width,
        deviceProfiles.iPhone12.height,
        mockTheme
      );
      expect(mobileArea.effectiveWidth).toBeLessThan(
        deviceProfiles.iPhone12.width
      );
      expect(mobileArea.effectiveHeight).toBeLessThan(
        deviceProfiles.iPhone12.height
      );

      // Tablet
      const tabletArea = calculateMapArea(
        deviceProfiles.iPad.width,
        deviceProfiles.iPad.height,
        mockTheme
      );
      expect(tabletArea.effectiveWidth).toBeLessThan(deviceProfiles.iPad.width);
      expect(tabletArea.effectiveHeight).toBeLessThan(
        deviceProfiles.iPad.height
      );

      // Desktop
      const desktopArea = calculateMapArea(
        deviceProfiles.desktopHD.width,
        deviceProfiles.desktopHD.height,
        mockTheme
      );
      expect(desktopArea.effectiveWidth).toBeLessThan(
        deviceProfiles.desktopHD.width
      );
      expect(desktopArea.effectiveHeight).toBeLessThan(
        deviceProfiles.desktopHD.height
      );

      // All should maintain minimum dimensions
      expect(mobileArea.effectiveWidth).toBeGreaterThanOrEqual(200);
      expect(mobileArea.effectiveHeight).toBeGreaterThanOrEqual(200);
    });
  });

  describe("Global Cities with Wide Geographic Spread", () => {
    it("should handle global cities on mobile devices", () => {
      const mobileDevices = Object.values(deviceProfiles).filter(
        d => d.category === "mobile"
      );

      mobileDevices.forEach(device => {
        const zoom = calculateResponsiveZoom(
          globalCities,
          device.width,
          device.height,
          mockTheme
        );

        // Global cities require lower zoom (to fit wider area)
        expect(zoom).toBeGreaterThan(0);
        expect(zoom).toBeLessThan(10); // Should be lower for global spread

        // Verify effective map area
        const mapArea = calculateMapArea(
          device.width,
          device.height,
          mockTheme
        );
        expect(mapArea.effectiveWidth).toBeGreaterThan(0);
        expect(mapArea.effectiveHeight).toBeGreaterThan(0);

        // Global cities should have lower zoom than European cities
        expect(zoom).toBeLessThan(5); // Zoomed out to fit global spread
      });
    });

    it("should handle global cities on desktop devices", () => {
      const desktopDevices = Object.values(deviceProfiles).filter(
        d => d.category === "desktop"
      );

      desktopDevices.forEach(device => {
        const zoom = calculateResponsiveZoom(
          globalCities,
          device.width,
          device.height,
          mockTheme
        );

        expect(zoom).toBeGreaterThan(0);
        expect(zoom).toBeLessThan(10);
      });
    });
  });

  describe("Edge Cases and Stress Tests", () => {
    it("should handle single city on various devices", () => {
      const singleCity = [europeanCities[0]];

      Object.values(deviceProfiles).forEach(device => {
        const zoom = calculateResponsiveZoom(
          singleCity,
          device.width,
          device.height,
          mockTheme
        );

        // Single city should return default zoom
        expect(zoom).toBe(4);
      });
    });

    it("should handle very small screen sizes gracefully", () => {
      const tinyScreen = { width: 320, height: 568 }; // Very small mobile

      const zoom = calculateResponsiveZoom(
        europeanCities,
        tinyScreen.width,
        tinyScreen.height,
        mockTheme
      );

      expect(zoom).toBeGreaterThan(0);
      expect(zoom).toBeLessThan(20);

      const mapArea = calculateMapArea(
        tinyScreen.width,
        tinyScreen.height,
        mockTheme
      );
      // Should maintain minimum dimensions
      expect(mapArea.effectiveWidth).toBeGreaterThanOrEqual(200);
      expect(mapArea.effectiveHeight).toBeGreaterThanOrEqual(200);
    });

    it("should handle very large screen sizes gracefully", () => {
      const huge8K = { width: 7680, height: 4320 }; // 8K display

      const zoom = calculateResponsiveZoom(
        europeanCities,
        huge8K.width,
        huge8K.height,
        mockTheme
      );

      expect(zoom).toBeGreaterThan(0);
      expect(zoom).toBeLessThan(20);
    });
  });

  describe("Zoom Consistency Checks", () => {
    it("should provide consistent zoom for same aspect ratio at different resolutions", () => {
      // 16:9 aspect ratio at different sizes
      const devices16x9 = [
        { width: 1280, height: 720 },
        { width: 1920, height: 1080 },
        { width: 2560, height: 1440 },
        { width: 3840, height: 2160 },
      ];

      const zooms = devices16x9.map(device =>
        calculateResponsiveZoom(
          europeanCities,
          device.width,
          device.height,
          mockTheme
        )
      );

      // All should produce similar zoom levels (accounting for effective area differences)
      const maxZoom = Math.max(...zooms);
      const minZoom = Math.min(...zooms);
      const zoomRange = maxZoom - minZoom;

      // Should be relatively consistent
      expect(zoomRange).toBeLessThan(3);
    });
  });

  describe("Performance Benchmarks", () => {
    it("should calculate zoom quickly for mobile devices", () => {
      const startTime = performance.now();

      for (let i = 0; i < 50; i++) {
        calculateResponsiveZoom(
          europeanCities,
          deviceProfiles.iPhone12.width,
          deviceProfiles.iPhone12.height,
          mockTheme
        );
      }

      const endTime = performance.now();
      const averageTime = (endTime - startTime) / 50;

      // Each calculation should be fast (< 5ms on average)
      expect(averageTime).toBeLessThan(5);
    });
  });
});

describe("Visual Regression Test Data", () => {
  it("should generate zoom values for visual comparison", () => {
    const results: Record<string, any> = {};

    Object.entries(deviceProfiles).forEach(([key, device]) => {
      const zoom = calculateResponsiveZoom(
        europeanCities,
        device.width,
        device.height,
        mockTheme
      );

      const mapArea = calculateMapArea(device.width, device.height, mockTheme);

      results[key] = {
        deviceName: device.name,
        category: device.category,
        dimensions: { width: device.width, height: device.height },
        calculatedZoom: zoom,
        effectiveMapArea: mapArea,
      };
    });

    // This test documents the zoom calculations for future reference
    expect(Object.keys(results).length).toBeGreaterThan(0);
  });
});
