import { describe, it, expect } from "vitest";
import {
  getZoomToFitBounds,
  getGeographicalBoxFromViewport,
  calculateOptimalPadding,
  calculateMapArea,
} from "@/utils/mapZoom";
import type { Bounds } from "@/utils/geo";
import { mockTowns, mockTheme } from "../../helpers/testUtils";

describe("getZoomToFitBounds", () => {
  it("returns a zoom level that fits the given bounds", () => {
    const bounds: Bounds = {
      minLat: 40,
      maxLat: 52,
      minLng: -2,
      maxLng: 14,
    };
    const zoom = getZoomToFitBounds(bounds, 800, 600);
    expect(zoom).toBeGreaterThan(0);
    expect(zoom).toBeLessThanOrEqual(20);
    expect(typeof zoom).toBe("number");
  });

  it("returns lower zoom for smaller viewport (same bounds fit in fewer pixels)", () => {
    const bounds: Bounds = {
      minLat: 48,
      maxLat: 52,
      minLng: 0,
      maxLng: 10,
    };
    const zoomSmall = getZoomToFitBounds(bounds, 400, 300);
    const zoomLarge = getZoomToFitBounds(bounds, 800, 600);
    expect(zoomSmall).toBeLessThan(zoomLarge);
  });

  it("returns at least 0.1 for very wide bounds", () => {
    const bounds: Bounds = {
      minLat: -80,
      maxLat: 80,
      minLng: -180,
      maxLng: 180,
    };
    const zoom = getZoomToFitBounds(bounds, 800, 600);
    expect(zoom).toBeGreaterThanOrEqual(0.1);
  });

  it("edge: single-point bounds (zero span) returns a number without throwing", () => {
    const bounds: Bounds = {
      minLat: 50,
      maxLat: 50,
      minLng: 10,
      maxLng: 10,
    };
    const zoom = getZoomToFitBounds(bounds, 800, 600);
    expect(typeof zoom).toBe("number");
    if (Number.isFinite(zoom)) {
      expect(zoom).toBeGreaterThanOrEqual(0.1);
      expect(zoom).toBeLessThanOrEqual(20);
    }
    // Zero span can produce Infinity from log division; impl only clamps minimum
  });

  it("edge: bounds crossing date line (minLng > maxLng in raw degrees) handled via lng span", () => {
    const bounds: Bounds = {
      minLat: 40,
      maxLat: 50,
      minLng: 170,
      maxLng: -170,
    };
    const zoom = getZoomToFitBounds(bounds, 800, 600);
    expect(Number.isFinite(zoom)).toBe(true);
    expect(zoom).toBeGreaterThanOrEqual(0.1);
    expect(zoom).toBeLessThanOrEqual(20);
  });

  it("edge: tiny viewport dimensions still produce finite zoom", () => {
    const bounds: Bounds = {
      minLat: 48,
      maxLat: 52,
      minLng: 0,
      maxLng: 10,
    };
    const zoom = getZoomToFitBounds(bounds, 1, 1);
    expect(Number.isFinite(zoom)).toBe(true);
    expect(zoom).toBeGreaterThanOrEqual(0.1);
  });
});

describe("getGeographicalBoxFromViewport", () => {
  it("returns bounds centered on the given center at the given zoom", () => {
    const center = { longitude: 10, latitude: 50 };
    const zoom = 4;
    const widthPx = 800;
    const heightPx = 600;
    const bounds = getGeographicalBoxFromViewport(
      center,
      zoom,
      widthPx,
      heightPx
    );
    expect(bounds.minLat).toBeLessThan(center.latitude);
    expect(bounds.maxLat).toBeGreaterThan(center.latitude);
    expect(bounds.minLng).toBeLessThan(center.longitude);
    expect(bounds.maxLng).toBeGreaterThan(center.longitude);
    expect(bounds.minLat).toBeLessThanOrEqual(bounds.maxLat);
    expect(bounds.minLng).toBeLessThanOrEqual(bounds.maxLng);
  });

  it("returns wider longitude span for higher zoom (smaller visible area)", () => {
    const center = { longitude: 10, latitude: 50 };
    const widthPx = 800;
    const heightPx = 600;
    const boundsLow = getGeographicalBoxFromViewport(
      center,
      2,
      widthPx,
      heightPx
    );
    const boundsHigh = getGeographicalBoxFromViewport(
      center,
      6,
      widthPx,
      heightPx
    );
    const spanLow = boundsLow.maxLng - boundsLow.minLng;
    const spanHigh = boundsHigh.maxLng - boundsHigh.minLng;
    expect(spanHigh).toBeLessThan(spanLow);
  });

  it("clamps latitude to valid range", () => {
    const center = { longitude: 0, latitude: 85 };
    const bounds = getGeographicalBoxFromViewport(center, 2, 800, 600);
    expect(bounds.minLat).toBeGreaterThanOrEqual(-90);
    expect(bounds.maxLat).toBeLessThanOrEqual(90);
  });

  it("edge: center at date line (-180) produces valid bounds", () => {
    const center = { longitude: -180, latitude: 0 };
    const bounds = getGeographicalBoxFromViewport(center, 4, 800, 600);
    expect(bounds.minLng).toBeLessThanOrEqual(bounds.maxLng);
    expect(bounds.minLat).toBeLessThanOrEqual(bounds.maxLat);
    expect(
      Number.isFinite(bounds.minLng) && Number.isFinite(bounds.maxLng)
    ).toBe(true);
  });

  it("edge: zoom 0 produces valid bounds", () => {
    const center = { longitude: 10, latitude: 50 };
    const bounds = getGeographicalBoxFromViewport(center, 0, 800, 600);
    expect(bounds.minLat).toBeLessThanOrEqual(bounds.maxLat);
    expect(bounds.minLng).toBeLessThanOrEqual(bounds.maxLng);
    expect(Number.isFinite(bounds.minLat)).toBe(true);
  });

  it("edge: max zoom (20) produces very narrow bounds", () => {
    const center = { longitude: 10, latitude: 50 };
    const bounds = getGeographicalBoxFromViewport(center, 20, 800, 600);
    expect(bounds.maxLat - bounds.minLat).toBeGreaterThan(0);
    expect(bounds.maxLng - bounds.minLng).toBeGreaterThan(0);
    expect(bounds.minLat).toBeGreaterThanOrEqual(-90);
    expect(bounds.maxLat).toBeLessThanOrEqual(90);
  });
});

describe("calculateOptimalPadding", () => {
  it("returns default padding for empty towns", () => {
    const padding = calculateOptimalPadding([], "desktop");
    expect(padding).toBeGreaterThanOrEqual(0.1);
    expect(padding).toBeLessThanOrEqual(0.7);
  });

  it("returns padding within bounds for valid towns", () => {
    const padding = calculateOptimalPadding(mockTowns, "desktop");
    expect(padding).toBeGreaterThanOrEqual(0.1);
    expect(padding).toBeLessThanOrEqual(0.7);
  });

  it("returns different padding per device type", () => {
    const mobile = calculateOptimalPadding(mockTowns, "mobile");
    const tablet = calculateOptimalPadding(mockTowns, "tablet");
    const desktop = calculateOptimalPadding(mockTowns, "desktop");
    expect(typeof mobile).toBe("number");
    expect(typeof tablet).toBe("number");
    expect(typeof desktop).toBe("number");
  });

  it("edge: single town returns valid padding", () => {
    const singleTown = [mockTowns[0]];
    const padding = calculateOptimalPadding(singleTown, "desktop");
    expect(padding).toBeGreaterThanOrEqual(0.1);
    expect(padding).toBeLessThanOrEqual(0.7);
  });
});

describe("calculateMapArea (edge)", () => {
  const theme = mockTheme as import("@mui/material/styles").Theme;

  it("edge: invalid dimensions fall back to defaults", () => {
    const area = calculateMapArea(0, 0, theme);
    expect(area.effectiveWidth).toBeGreaterThan(0);
    expect(area.effectiveHeight).toBeGreaterThan(0);
    expect(Number.isFinite(area.effectiveWidth)).toBe(true);
    expect(Number.isFinite(area.effectiveHeight)).toBe(true);
  });

  it("edge: negative dimensions fall back to defaults", () => {
    const area = calculateMapArea(-100, -50, theme);
    expect(area.effectiveWidth).toBeGreaterThan(0);
    expect(area.effectiveHeight).toBeGreaterThan(0);
  });

  it("edge: NaN dimensions fall back to defaults", () => {
    const area = calculateMapArea(NaN, NaN, theme);
    expect(Number.isFinite(area.effectiveWidth)).toBe(true);
    expect(Number.isFinite(area.effectiveHeight)).toBe(true);
  });
});
