/**
 * Tests for useInitialMapState hook.
 * Computes initial map center, fit zoom, and viewport bounds from towns and map area.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useInitialMapState } from "@/hooks/map/useInitialMapState";
import { DEFAULT_ZOOM } from "@/constants";
import { mockTheme, mockTowns } from "../../helpers/testUtils";

vi.mock("@/hooks/ui", () => ({
  useViewport: vi.fn(),
}));
vi.mock("@mui/material/styles", async importOriginal => {
  const actual = await importOriginal<typeof import("@mui/material/styles")>();
  return {
    ...actual,
    useTheme: vi.fn(),
  };
});

import { useViewport } from "@/hooks/ui";
import { useTheme } from "@mui/material/styles";

describe("useInitialMapState", () => {
  beforeEach(() => {
    vi.mocked(useViewport).mockReturnValue({
      screenWidth: 1024,
      screenHeight: 768,
      rawScreenWidth: 1024,
      rawScreenHeight: 768,
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      isXLarge: false,
      isMobileLayout: false,
      isTabletLayout: false,
      isDesktopLayout: true,
      isXLargeLayout: false,
      isBelowMinViewport: false,
    });
    vi.mocked(useTheme).mockReturnValue(
      mockTheme as ReturnType<typeof useTheme>
    );
  });

  it("returns default fitZoom and no center/bounds when towns are empty", () => {
    const { result } = renderHook(() => useInitialMapState([], undefined));

    expect(result.current.center).toBeUndefined();
    expect(result.current.fitZoom).toBe(DEFAULT_ZOOM);
    expect(result.current.bounds).toBeUndefined();
  });

  it("returns center, fitZoom, and bounds for valid towns", () => {
    const { result } = renderHook(() =>
      useInitialMapState(mockTowns, undefined)
    );

    expect(result.current.center).toBeDefined();
    expect(result.current.center!.latitude).toBeGreaterThanOrEqual(-90);
    expect(result.current.center!.latitude).toBeLessThanOrEqual(90);
    expect(result.current.center!.longitude).toBeGreaterThanOrEqual(-180);
    expect(result.current.center!.longitude).toBeLessThanOrEqual(180);

    expect(typeof result.current.fitZoom).toBe("number");
    expect(result.current.fitZoom).toBeGreaterThanOrEqual(1);
    expect(result.current.fitZoom).toBeLessThanOrEqual(20);

    expect(result.current.bounds).toBeDefined();
    expect(result.current.bounds!.minLat).toBeLessThanOrEqual(
      result.current.bounds!.maxLat
    );
    expect(result.current.bounds!.minLng).toBeLessThanOrEqual(
      result.current.bounds!.maxLng
    );
  });

  it("uses provided mapArea when given", () => {
    const mapArea = { effectiveWidth: 600, effectiveHeight: 400 };
    const { result } = renderHook(() => useInitialMapState(mockTowns, mapArea));

    expect(result.current.center).toBeDefined();
    expect(result.current.fitZoom).toBeGreaterThanOrEqual(1);
    expect(result.current.bounds).toBeDefined();
  });

  it("falls back to default when viewport dimensions are invalid", () => {
    vi.mocked(useViewport).mockReturnValue({
      screenWidth: 0,
      screenHeight: 0,
      rawScreenWidth: 0,
      rawScreenHeight: 0,
      isMobile: true,
      isTablet: false,
      isDesktop: false,
      isXLarge: false,
      isMobileLayout: true,
      isTabletLayout: false,
      isDesktopLayout: false,
      isXLargeLayout: false,
      isBelowMinViewport: true,
    });

    const { result } = renderHook(() =>
      useInitialMapState(mockTowns, undefined)
    );

    expect(result.current.center).toBeDefined();
    expect(result.current.fitZoom).toBeGreaterThanOrEqual(1);
    expect(result.current.bounds).toBeDefined();
  });

  it("edge: single town returns valid center and bounds", () => {
    const singleTown = [mockTowns[0]];
    const { result } = renderHook(() =>
      useInitialMapState(singleTown, undefined)
    );

    expect(result.current.center).toBeDefined();
    expect(result.current.center!.latitude).toBe(mockTowns[0].latitude);
    expect(result.current.center!.longitude).toBe(mockTowns[0].longitude);
    expect(result.current.fitZoom).toBeGreaterThanOrEqual(1);
    expect(result.current.bounds).toBeDefined();
  });

  it("edge: mapArea with zero effective dimensions does not throw", () => {
    const mapArea = { effectiveWidth: 0, effectiveHeight: 0 };
    const { result } = renderHook(() => useInitialMapState(mockTowns, mapArea));

    expect(result.current.center).toBeDefined();
    expect(result.current.fitZoom).toBeGreaterThanOrEqual(1);
    expect(result.current.bounds).toBeDefined();
  });

  it("edge: null/undefined towns treated as empty", () => {
    const { result } = renderHook(() =>
      useInitialMapState(null as unknown as typeof mockTowns, undefined)
    );
    expect(result.current.center).toBeUndefined();
    expect(result.current.fitZoom).toBe(DEFAULT_ZOOM);
    expect(result.current.bounds).toBeUndefined();
  });
});
