import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act, waitFor } from "@testing-library/react";
import { AppProvider, useApp } from "@/context/AppContext";
import { mockTownsMinimal } from "../../helpers/testUtils";

vi.mock("@/utils/utils", () => ({
  calculateBoundsCenter: vi.fn(() => ({
    latitude: 48.8566,
    longitude: 2.3522,
  })),
  calculateResponsiveZoom: vi.fn(() => 4),
  calculateOptimalPadding: vi.fn(() => 0.2),
  calculateFitZoom: vi.fn(() => 4),
  calculateMapArea: vi.fn(() => ({
    effectiveWidth: 1920,
    effectiveHeight: 1080,
  })),
  getBounds: vi.fn(() => ({
    minLat: 48.0,
    maxLat: 52.0,
    minLng: 2.0,
    maxLng: 12.0,
  })),
  townsToGeoJSON: vi.fn(() => ({
    type: "FeatureCollection",
    features: [],
  })),
  isValidNumber: (n: unknown) => typeof n === "number" && !isNaN(n),
  isValidCoordinate: () => true,
}));

vi.mock("@/services", () => {
  const mockGetYearData = vi.fn((towns: any[], year: number) => {
    const filteredTowns = towns.filter(
      town => town.populationByYear?.[year.toString()] != null
    );
    return {
      filteredTowns,
      bounds: { minLat: 48.0, maxLat: 52.0, minLng: 2.0, maxLng: 12.0 },
      center: { latitude: 50.0, longitude: 2.3522 },
      geojson: {
        type: "FeatureCollection",
        features: filteredTowns.map(town => ({
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [town.longitude, town.latitude],
          },
          properties: town,
        })),
      },
    };
  });

  return {
    yearDataService: {
      getYearData: mockGetYearData,
      clearCache: vi.fn(),
      getCacheStats: vi.fn(() => ({ yearDataCacheSize: 0, maxCacheSize: 50 })),
    },
  };
});

vi.mock("@/hooks/ui", async () => {
  const { createResponsiveMock } = await import(
    "../../helpers/mocks/responsive"
  );
  const viewportShape = () => {
    const mock = createResponsiveMock();
    return {
      ...mock,
      screenWidth: 1920,
      screenHeight: 1080,
      rawScreenWidth: 1920,
      rawScreenHeight: 1080,
      isMobileLayout: false,
      isTabletLayout: false,
      isDesktopLayout: true,
      isXLargeLayout: false,
      isBelowMinViewport: false,
    };
  };
  return {
    useViewport: vi.fn(viewportShape),
    useResponsive: vi.fn(() => createResponsiveMock()),
    useResizeDebounced: vi.fn(() => ({ width: 1920, height: 1080 })),
    useNarrowLayout: vi.fn(() => false),
    useOverlayButtonsVisible: vi.fn(() => true),
    useScreenshot: vi.fn(() => ({
      captureScreenshot: vi.fn(),
      isCapturing: false,
    })),
  };
});

vi.mock("@/utils/retry", () => ({
  retryWithBackoff: vi.fn(fn => {
    try {
      fn();
    } catch (e) {
      // Ignore errors
    }
    return Promise.resolve();
  }),
}));

const mockLogger = vi.hoisted(() => ({
  error: vi.fn(),
  warn: vi.fn(),
  info: vi.fn(),
  debug: vi.fn(),
}));

vi.mock("@/utils/logger", () => ({
  logger: mockLogger,
}));

const TestComponent = () => {
  const { selectedYear, setSelectedYear, filteredTowns } = useApp();

  return (
    <div>
      <div data-testid="selected-year">{selectedYear}</div>
      <div data-testid="filtered-count">{filteredTowns.length}</div>
      <div data-testid="town-names">
        {filteredTowns.map(town => town.name).join(", ")}
      </div>
      <button data-testid="change-year" onClick={() => setSelectedYear(1200)}>
        Change Year
      </button>
    </div>
  );
};

describe("AppContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should provide default values and filter towns correctly", async () => {
    const { container } = render(
      <AppProvider towns={mockTownsMinimal}>
        <TestComponent />
      </AppProvider>
    );

    await waitFor(
      () => {
        const yearEl = container.querySelector('[data-testid="selected-year"]');
        expect(yearEl).toBeInTheDocument();
        expect(yearEl).toHaveTextContent("800");
      },
      { timeout: 100, interval: 5 }
    );

    expect(screen.getByTestId("filtered-count")).toHaveTextContent("1");
    expect(screen.getByTestId("town-names")).toHaveTextContent("Paris");
  });

  it("should update selected year and show correct towns", async () => {
    const { container } = render(
      <AppProvider towns={mockTownsMinimal}>
        <TestComponent />
      </AppProvider>
    );

    await waitFor(
      () => {
        expect(
          container.querySelector('[data-testid="selected-year"]')
        ).toBeInTheDocument();
      },
      { timeout: 100, interval: 5 }
    );

    const changeButton = screen.getByTestId("change-year");

    act(() => {
      changeButton.click();
    });

    await waitFor(
      () => {
        const yearEl = container.querySelector('[data-testid="selected-year"]');
        expect(yearEl).toHaveTextContent("1200");
      },
      { timeout: 100, interval: 5 }
    );

    expect(screen.getByTestId("filtered-count")).toHaveTextContent("2");
    expect(screen.getByTestId("town-names")).toHaveTextContent("Paris, London");
  });

  it("should throw error when used outside provider", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow("useApp must be used within an AppProvider");

    consoleSpy.mockRestore();
  });

  it("should handle empty towns array", async () => {
    const { container } = render(
      <AppProvider towns={[]}>
        <TestComponent />
      </AppProvider>
    );

    await waitFor(
      () => {
        const countEl = container.querySelector(
          '[data-testid="filtered-count"]'
        );
        expect(countEl).toBeInTheDocument();
        expect(countEl).toHaveTextContent("0");
      },
      { timeout: 100, interval: 5 }
    );
  });

  it("should handle invalid year gracefully", () => {
    const TestComponentWithInvalidYear = () => {
      const { setSelectedYear } = useApp();

      return (
        <button data-testid="invalid-year" onClick={() => setSelectedYear(-1)}>
          Set Invalid Year
        </button>
      );
    };

    render(
      <AppProvider towns={mockTownsMinimal}>
        <TestComponentWithInvalidYear />
      </AppProvider>
    );

    const button = screen.getByTestId("invalid-year");
    expect(() => {
      act(() => {
        button.click();
      });
    }).not.toThrow();
  });
});
