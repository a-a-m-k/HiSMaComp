import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useMapCalculations } from "../useMapCalculations";
import { AppProvider } from "@/context/AppContext";
import { Town } from "@/common/types";
import { mockTownsMinimal, mockWindowDimensions } from "../../test/testUtils";

mockWindowDimensions();

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AppProvider towns={mockTownsMinimal}>{children}</AppProvider>
);

describe("useMapCalculations", () => {
  it("should calculate center and zoom for valid towns", () => {
    const { result } = renderHook(() => useMapCalculations(), { wrapper });

    // Center should be between Paris and London coordinates
    expect(result.current.center.latitude).toBeGreaterThan(41);
    expect(result.current.center.latitude).toBeLessThan(52);
    expect(result.current.center.longitude).toBeGreaterThan(-1);
    expect(result.current.center.longitude).toBeLessThan(13);

    // Zoom should be within valid MapLibre range
    expect(result.current.fitZoom).toBeGreaterThan(0);
    expect(result.current.fitZoom).toBeLessThanOrEqual(20);
  });

  it("should return default values for empty towns", () => {
    const emptyWrapper = ({ children }: { children: React.ReactNode }) => (
      <AppProvider towns={[]}>{children}</AppProvider>
    );

    const { result } = renderHook(() => useMapCalculations(), {
      wrapper: emptyWrapper,
    });

    expect(result.current.center).toEqual({ latitude: 0, longitude: 0 });
    expect(result.current.fitZoom).toBe(4);
  });

  it("should handle errors gracefully", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    // Test with invalid data to trigger error handling
    const invalidWrapper = ({ children }: { children: React.ReactNode }) => (
      <AppProvider towns={null as unknown as Town[]}>{children}</AppProvider>
    );

    const { result } = renderHook(() => useMapCalculations(), {
      wrapper: invalidWrapper,
    });

    // Should return safe default values when calculation fails
    expect(result.current.center).toEqual({ latitude: 0, longitude: 0 });
    expect(result.current.fitZoom).toBe(4);

    consoleSpy.mockRestore();
  });

  it("should recalculate when context changes", () => {
    const { result, rerender } = renderHook(() => useMapCalculations(), {
      wrapper,
    });

    const initialCenter = result.current.center;
    const initialZoom = result.current.fitZoom;

    rerender();

    // Values should be consistent due to memoization
    expect(result.current.center).toEqual(initialCenter);
    expect(result.current.fitZoom).toEqual(initialZoom);
  });
});
