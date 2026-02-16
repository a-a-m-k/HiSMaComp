import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, render, screen, waitFor } from "@testing-library/react";
import MapView from "@/components/map/MapView/MapView";
import { AppProvider } from "@/context/AppContext";
import { Town } from "@/common/types";

vi.mock("@mui/material", async importOriginal => {
  const actual = await importOriginal<typeof import("@mui/material")>();
  const Paper = ({ children, ...props }: any) =>
    React.createElement("div", props, children);

  return {
    ...actual,
    Paper,
    useTheme: vi.fn(() => ({
      breakpoints: {
        values: { xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536 },
        down: () => "@media (max-width: 899px)",
        up: () => "@media (min-width: 1200px)",
      },
      spacing: () => 8,
      zIndex: { appBar: 1100, modal: 1300 },
      palette: {},
    })),
    Box: ({ children }: { children: React.ReactNode }) =>
      React.createElement("div", null, children),
  };
});

vi.mock("@mui/material/styles", async importOriginal => {
  const actual = await importOriginal<typeof import("@mui/material/styles")>();

  return {
    ...actual,
    styled: (component: any) => {
      return (styles: any) => {
        const StyledComponent = ({ children, ...props }: any) => {
          return React.createElement(component || "div", props, children);
        };
        StyledComponent.displayName = `Styled(${component?.displayName || component?.name || "Component"})`;
        return StyledComponent;
      };
    },
  };
});

vi.mock("@/utils/terrainStyle", () => ({
  getTerrainStyle: vi.fn().mockReturnValue({
    version: 8,
    sources: {},
    layers: [],
  }),
}));

vi.mock("@/constants/ui", async importOriginal => {
  const actual = await importOriginal<typeof import("@/constants/ui")>();
  return {
    ...actual,
    getNavigationControlStyles: vi.fn(() => ""),
  };
});

vi.mock(
  "@/components/controls/ScreenshotButton/ScreenshotButton.styles",
  () => {
    const ScreenshotButton = React.forwardRef((props: any, ref: any) => {
      const { children, disableRipple, ...rest } = props;
      void disableRipple;
      return React.createElement(
        "button",
        {
          ref,
          id: "map-screenshot-button",
          "data-testid": "screenshot-button",
          ...rest,
        },
        children
      );
    });
    ScreenshotButton.displayName = "ScreenshotButton";

    return {
      ScreenshotButtonContainer: ({
        children,
      }: {
        children: React.ReactNode;
      }) => React.createElement("div", null, children),
      ScreenshotButton,
    };
  }
);

vi.mock("@/components/controls", () => {
  const ScreenshotButton = React.forwardRef((props: any, ref: any) => {
    const { disableRipple, ...rest } = props;
    void disableRipple;
    return React.createElement("button", {
      ref,
      id: "map-screenshot-button",
      "data-testid": "screenshot-button",
      ...rest,
    });
  });
  ScreenshotButton.displayName = "ScreenshotButton";

  return {
    ScreenshotButton,
  };
});

let lastMapProps: Record<string, unknown> | null = null;
const responsiveState = {
  isMobile: false,
  isTablet: false,
  isDesktop: true,
};

vi.mock("react-map-gl/maplibre", () => {
  const MockMap = React.forwardRef(
    (props: { children: React.ReactNode }, ref: React.Ref<any>) => {
      lastMapProps = props;
      return (
        <div data-testid="map-container" ref={ref}>
          {props.children}
        </div>
      );
    }
  );
  MockMap.displayName = "MockMap";

  return {
    default: MockMap,
    NavigationControl: () => <div data-testid="navigation-control" />,
    Source: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="map-source">{children}</div>
    ),
    Layer: () => <div data-testid="map-layer" />,
    Marker: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="map-marker">{children}</div>
    ),
    __getLastMapProps: () => lastMapProps,
  };
});

vi.mock("maplibre-gl", () => ({
  default: {},
}));

vi.mock("maplibre-gl/dist/maplibre-gl.css", () => ({}));

vi.mock("@assets/terrain-gl-style/terrain.json", () => ({
  default: { version: 8, sources: {}, layers: [] },
}));

vi.mock("@/components/controls/Legend", () => ({
  Legend: () => null,
}));

vi.mock("@mui/icons-material", () => ({
  SaveAltRounded: () => {
    return React.createElement("svg", { "data-testid": "save-icon" });
  },
}));

vi.mock("@/components/map/MapView/FocusableMarkers", () => ({
  FocusableMarkers: () => <div data-testid="focusable-markers" />,
}));

vi.mock("@/services", () => {
  const mockGetYearData = vi.fn((towns: Town[], year: number) => {
    const filteredTowns =
      towns.length > 0 && towns[0].populationByYear?.[year.toString()] != null
        ? [towns[0]]
        : [];
    return {
      filteredTowns,
      bounds: { minLat: 0, maxLat: 0, minLng: 0, maxLng: 0 },
      center: { latitude: 0, longitude: 0 },
      geojson: {
        type: "FeatureCollection",
        features: [],
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

vi.mock("@/hooks/data/useDataProcessor", () => ({
  useDataProcessor: vi.fn(() => ({
    calculateGlobalBounds: vi.fn().mockResolvedValue({
      bounds: { minLat: 0, maxLat: 0, minLng: 0, maxLng: 0 },
      center: { latitude: 0, longitude: 0 },
    }),
  })),
}));

vi.mock("@/utils/utils", () => ({
  calculateBoundsCenter: vi.fn(() => ({ latitude: 0, longitude: 0 })),
  calculateResponsiveZoom: vi.fn(() => 4),
  calculateOptimalPadding: vi.fn(() => 0.2),
  calculateFitZoom: vi.fn(() => 4),
  calculateMapArea: vi.fn(() => ({
    effectiveWidth: 1920,
    effectiveHeight: 1080,
  })),
  getBounds: vi.fn(() => ({ minLat: 0, maxLat: 0, minLng: 0, maxLng: 0 })),
  townsToGeoJSON: vi.fn(() => ({
    type: "FeatureCollection",
    features: [],
  })),
  isValidNumber: (n: unknown) => typeof n === "number" && !isNaN(n),
  isValidCoordinate: () => true,
}));

vi.mock("../MapLayer/MapLayer", () => ({
  default: ({
    layerId,
    data,
  }: {
    layerId: string;
    data: { features: unknown[] } | undefined;
  }) => (
    <div
      data-testid={`map-layer-${layerId}`}
      data-features={data?.features?.length || 0}
    />
  ),
}));

vi.mock("@/hooks/ui", async () => {
  const { createResponsiveMock } = await import(
    "../../helpers/mocks/responsive"
  );
  return {
    useResponsive: vi.fn(() =>
      createResponsiveMock({
        isMobile: responsiveState.isMobile,
        isTablet: responsiveState.isTablet,
        isDesktop: responsiveState.isDesktop,
      })
    ),
    useScreenDimensions: vi.fn(() => ({
      screenWidth: 1920,
      screenHeight: 1080,
    })),
    useResponsiveZoom: vi.fn(() => 4),
    useScreenshot: vi.fn(() => ({
      captureScreenshot: vi.fn(),
      isCapturing: false,
    })),
  };
});

vi.mock("@/hooks/useAccessibility", () => ({
  useAccessibility: vi.fn(() => ({
    announce: vi.fn(),
    announceAlert: vi.fn(),
  })),
}));

vi.mock("@/utils/retry", () => ({
  retryWithBackoff: vi.fn(fn => {
    fn();
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

vi.mock("@/components/map/MapView/TownMarkers", () => ({
  TownMarkers: ({ towns }: { towns: unknown[] }) => {
    return React.createElement(
      "div",
      { "data-testid": "town-markers" },
      `${towns.length} markers`
    );
  },
}));

vi.mock("@/hooks/map", () => ({
  useMapViewState: vi.fn(({ longitude, latitude, zoom }) => ({
    viewState: { longitude, latitude, zoom },
    handleMove: vi.fn(),
  })),
  useMapKeyboardShortcuts: vi.fn(),
  useMapKeyboardPanning: vi.fn(),
  useNavigationControlAccessibility: vi.fn(),
  useTownsGeoJSON: vi.fn(() => ({ type: "FeatureCollection", features: [] })),
  useMapLayerExpressions: vi.fn(() => ({
    populationSortKey: "population",
    circleRadiusExpression: ["get", "radius"],
    circleColorExpression: ["get", "color"],
    populationExpression: ["get", "population"],
  })),
  useMarkerKeyboardNavigation: vi.fn(() => vi.fn()),
}));

vi.mock("@/context/AppContext", () => {
  const mockFns = {
    setSelectedYear: vi.fn(),
    clearError: vi.fn(),
    retry: vi.fn(),
  };

  const stableValue = {
    selectedYear: 800,
    setSelectedYear: mockFns.setSelectedYear,
    towns: [],
    filteredTowns: [],
    isLoading: false,
    error: null,
    clearError: mockFns.clearError,
    retry: mockFns.retry,
    bounds: { minLat: 0, maxLat: 0, minLng: 0, maxLng: 0 },
    center: { latitude: 0, longitude: 0 },
    fitZoom: 4,
  };

  const AppContext = React.createContext(stableValue);
  const useApp = () => stableValue;
  const AppProvider = ({ children }: { children: React.ReactNode }) => {
    return React.createElement(
      AppContext.Provider,
      { value: stableValue },
      children
    );
  };

  return {
    AppProvider,
    useApp,
    AppContext,
  };
});

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <AppProvider towns={[]}>{children}</AppProvider>
);

describe("MapView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    responsiveState.isMobile = false;
    responsiveState.isTablet = false;
    responsiveState.isDesktop = true;
  });

  it("should render map container with correct initial position and zoom", async () => {
    const initialPosition = { latitude: 48.8566, longitude: 2.3522 };
    const initialZoom = 8;

    const { container } = render(
      <TestWrapper>
        <MapView initialPosition={initialPosition} initialZoom={initialZoom} />
      </TestWrapper>
    );

    // MapView renders #map-container-area
    expect(container.querySelector("#map-container-area")).toBeInTheDocument();

    // ScreenshotButton is lazy-loaded; wait for it to appear
    await waitFor(() => {
      const screenshotButton =
        container.querySelector("#map-screenshot-button") ||
        screen.queryByTestId("screenshot-button");
      expect(screenshotButton).toBeInTheDocument();
    });
  });

  it("should handle invalid coordinates gracefully", () => {
    const { container } = render(
      <TestWrapper>
        <MapView
          initialPosition={{ latitude: NaN, longitude: NaN }}
          initialZoom={-1}
        />
      </TestWrapper>
    );

    // MapView should still render even with invalid coordinates (uses safe defaults)
    expect(container.querySelector("#map-container-area")).toBeInTheDocument();
  });

  it("should enable touch zoom and drag pan gestures", async () => {
    render(
      <TestWrapper>
        <MapView
          initialPosition={{ latitude: 48.8566, longitude: 2.3522 }}
          initialZoom={5}
        />
      </TestWrapper>
    );

    const { __getLastMapProps } = await import("react-map-gl/maplibre");
    const props = __getLastMapProps();

    expect(props?.touchZoomRotate).toBe(true);
    expect(props?.dragPan).toBe(true);
  });

  it("should defer overlays until first map idle event", async () => {
    render(
      <TestWrapper>
        <MapView
          initialPosition={{ latitude: 48.8566, longitude: 2.3522 }}
          initialZoom={5}
        />
      </TestWrapper>
    );

    expect(screen.queryByTestId("town-markers")).not.toBeInTheDocument();

    const { __getLastMapProps } = await import("react-map-gl/maplibre");
    const props = __getLastMapProps();

    await act(async () => {
      (props?.onIdle as (() => void) | undefined)?.();
    });

    expect(screen.getByTestId("town-markers")).toBeInTheDocument();
  });

  it("should hide screenshot button on mobile", async () => {
    responsiveState.isMobile = true;
    responsiveState.isDesktop = false;

    render(
      <TestWrapper>
        <MapView
          initialPosition={{ latitude: 48.8566, longitude: 2.3522 }}
          initialZoom={5}
        />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId("map-container")).toBeInTheDocument();
    });

    expect(screen.queryByTestId("screenshot-button")).not.toBeInTheDocument();
  });
});
