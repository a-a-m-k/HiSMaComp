import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { ThemeProvider } from "@mui/material";
import theme from "@/theme/theme";
import MapContainer from "@/components/containers/MapContainer";
import type { ReactNode } from "react";
import { Z_INDEX } from "@/constants/ui";
import { hasBackdropBlurStyles } from "../helpers/backdropFilter";

vi.mock("@/components/map/MapView/MapView", () => ({
  __esModule: true,
  default: () => <div data-testid="map-view">Map View</div>,
}));

vi.mock("@/components/controls/Timeline/Timeline", () => ({
  __esModule: true,
  default: ({ marks }: { marks: unknown[] }) => (
    <div data-testid="timeline">Timeline</div>
  ),
}));

vi.mock("@/components/controls/Legend/Legend", () => ({
  __esModule: true,
  default: ({ layers }: { layers: unknown[] }) => (
    <div data-testid="legend">Legend</div>
  ),
}));

vi.mock("@/context/AppContext", () => ({
  AppProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
  useApp: () => ({
    isLoading: false,
    error: "Data Loading Error.",
    retry: vi.fn(),
    center: { latitude: 50.0, longitude: 2.3522 },
    fitZoom: 4,
  }),
}));

vi.mock("@/hooks", () => ({
  useLegendLayers: () => [
    { layer: "small", color: "#ff0000" },
    { layer: "medium", color: "#00ff00" },
  ],
}));

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
}));

vi.mock("@/utils/zoom/zoomHelpers", () => ({
  isValidNumber: vi.fn(n => typeof n === "number" && !isNaN(n)),
  isValidCoordinate: vi.fn(() => true),
}));

vi.mock("@/hooks/ui", () => ({
  useResponsive: vi.fn(() => ({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isXLarge: false,
    theme: {
      breakpoints: { values: { xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536 } },
      spacing: () => 8,
    },
  })),
  useScreenDimensions: vi.fn(() => ({
    screenWidth: 1920,
    screenHeight: 1080,
  })),
  useResponsiveZoom: vi.fn(() => 4),
  useScreenshot: vi.fn(() => ({
    captureScreenshot: vi.fn(),
    isCapturing: false,
  })),
}));

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

vi.mock("@/utils/logger", () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

vi.mock("@/utils/accessibility", () => ({
  announce: vi.fn(),
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

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe("MapContainer Error Overlay", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should display error overlay when error state is set", async () => {
    // Test with empty towns array to trigger "No towns data available" error
    renderWithTheme(<MapContainer />);

    await waitFor(
      () => {
        expect(screen.getByText("Data Loading Error")).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it("should have fixed positioning covering full viewport", async () => {
    const { yearDataService } = await import("@/services");
    vi.mocked(yearDataService.getYearData).mockImplementationOnce(() => {
      throw new Error("Test error");
    });

    const { container } = renderWithTheme(<MapContainer />);

    await waitFor(
      () => {
        const errorOverlays = container.querySelectorAll(
          '[class*="MuiBox-root"]'
        );
        const errorOverlay = Array.from(errorOverlays).find(
          el =>
            window.getComputedStyle(el).position === "fixed" &&
            window.getComputedStyle(el).zIndex === String(Z_INDEX.ERROR)
        ) as HTMLElement;

        expect(errorOverlay).toBeInTheDocument();

        const styles = window.getComputedStyle(errorOverlay);
        expect(styles.position).toBe("fixed");
        expect(styles.top).toBe("0px");
        expect(styles.left).toBe("0px");
        expect(styles.right).toBe("0px");
        expect(styles.bottom).toBe("0px");
      },
      { timeout: 3000 }
    );
  });

  it("should have highest z-index to overlay all components", async () => {
    const { container } = renderWithTheme(<MapContainer />);

    await waitFor(
      () => {
        expect(screen.getByText("Data Loading Error")).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    const errorOverlays = container.querySelectorAll('[class*="MuiBox-root"]');
    const errorOverlay = Array.from(errorOverlays).find(el => {
      const styles = window.getComputedStyle(el);
      return (
        styles.position === "fixed" &&
        parseInt(styles.zIndex || "0", 10) === Z_INDEX.ERROR
      );
    }) as HTMLElement;

    expect(errorOverlay).toBeInTheDocument();
    const styles = window.getComputedStyle(errorOverlay);
    const zIndex = parseInt(styles.zIndex || "0", 10);

    expect(zIndex).toBe(Z_INDEX.ERROR);
    expect(zIndex).toBeGreaterThanOrEqual(99999);
  });

  it("should have backdrop with blur effect", async () => {
    const { container } = renderWithTheme(<MapContainer />);

    await waitFor(
      () => {
        expect(screen.getByText("Data Loading Error")).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    const errorOverlays = container.querySelectorAll('[class*="MuiBox-root"]');
    const errorOverlay = Array.from(errorOverlays).find(el => {
      const styles = window.getComputedStyle(el);
      return (
        styles.position === "fixed" &&
        parseInt(styles.zIndex || "0", 10) === Z_INDEX.ERROR
      );
    }) as HTMLElement;

    expect(errorOverlay).toBeInTheDocument();
    const styles = window.getComputedStyle(errorOverlay);

    expect(styles.backgroundColor).toContain("rgba");
    // backdropFilter may not be computed in test environment (jsdom limitation)
    const styleAttr = errorOverlay.getAttribute("style") || "";
    const hasBackdropFilterInStyle =
      styleAttr.includes("backdrop-filter") || styleAttr.includes("blur");
    const hasBackdropFilterInComputed =
      styles.backdropFilter && styles.backdropFilter.includes("blur");
    const hasBackdropFilterInEmotion = hasBackdropBlurStyles();
    expect(
      hasBackdropFilterInStyle ||
        hasBackdropFilterInComputed ||
        hasBackdropFilterInEmotion
    ).toBeTruthy();
  });

  it("should center error content on screen", async () => {
    const { container } = renderWithTheme(<MapContainer />);

    await waitFor(
      () => {
        expect(screen.getByText("Data Loading Error")).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    const errorOverlays = container.querySelectorAll('[class*="MuiBox-root"]');
    const errorOverlay = Array.from(errorOverlays).find(el => {
      const styles = window.getComputedStyle(el);
      return (
        styles.position === "fixed" &&
        parseInt(styles.zIndex || "0", 10) === Z_INDEX.ERROR
      );
    }) as HTMLElement;

    expect(errorOverlay).toBeInTheDocument();
    const styles = window.getComputedStyle(errorOverlay);

    expect(styles.display).toBe("flex");
    expect(styles.alignItems).toBe("center");
    expect(styles.justifyContent).toBe("center");
  });

  it("should hide other components when error is displayed", async () => {
    renderWithTheme(<MapContainer />);

    await waitFor(
      () => {
        expect(screen.getByText("Data Loading Error")).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    expect(screen.queryByTestId("timeline")).not.toBeInTheDocument();
    expect(screen.queryByTestId("legend")).not.toBeInTheDocument();
  });

  it("should show retry button when error is displayed", async () => {
    renderWithTheme(<MapContainer />);

    await waitFor(
      () => {
        const retryButton = screen.getByRole("button", { name: /try again/i });
        expect(retryButton).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });
});
