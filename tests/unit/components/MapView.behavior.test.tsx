import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import MapView from "@/components/map/MapView/MapView";
import type { Town } from "@/common/types";
import { lightTheme } from "@/theme/theme";

const mapCanvasStackSpy = vi.hoisted(() => vi.fn());
const useViewportMock = vi.hoisted(() => vi.fn());
const useMapViewStateMock = vi.hoisted(() => vi.fn());
const useMapStyleSwitchLoaderMock = vi.hoisted(() => vi.fn());

vi.mock("@mui/material/styles", async importOriginal => {
  const actual = await importOriginal<typeof import("@mui/material/styles")>();
  return {
    ...actual,
    useTheme: () => lightTheme,
  };
});

vi.mock("@/context/MapStyleContext", () => ({
  useMapStyleMode: () => ({
    mode: "light" as const,
    toggleMode: vi.fn(),
  }),
}));

vi.mock("@/hooks/ui", () => ({
  useViewport: useViewportMock,
  usePrefersReducedMotion: () => false,
}));

vi.mock("@/hooks/map", () => ({
  useMapViewState: useMapViewStateMock,
  useAnimateCameraToFit: vi.fn(),
  useMapKeyboardShortcuts: vi.fn(),
  useMapKeyboardPanning: vi.fn(),
  useNavigationControlAccessibility: vi.fn(),
  useTownsGeoJSON: vi.fn(() => ({ type: "FeatureCollection", features: [] })),
  useMapContainerResize: vi.fn(() => null),
  useMapViewLibreEffects: vi.fn(() => ({
    handleOverlayMapLoad: vi.fn(),
    handleBasemapLoad: vi.fn(),
  })),
  useMapStyleSwitchLoader: useMapStyleSwitchLoaderMock,
}));

vi.mock("@/components/map/MapView/useMapViewConfig", () => ({
  useMapViewConfig: vi.fn(() => ({
    safeProps: { longitude: 2.3522, latitude: 48.8566, zoom: 5 },
    effectiveMinZoom: 3,
  })),
  useSharedViewProps: vi.fn(() => ({
    longitude: 2.3522,
    latitude: 48.8566,
    zoom: 5,
  })),
}));

vi.mock("@/components/map/MapView/useMapCameraLifecycle", () => ({
  useMapCameraLifecycle: vi.fn(() => ({ isScreenshotCapturing: false })),
}));

vi.mock("@/components/map/MapView/MapViewShell", () => ({
  MapViewShell: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="map-view-shell">{children}</div>
  ),
}));

vi.mock("@/components/map/MapView/MapCanvasStack", () => ({
  MapCanvasStack: (props: unknown) => {
    mapCanvasStackSpy(props);
    return <div data-testid="map-canvas-stack" />;
  },
}));

const makeTown = (name: string): Town => ({
  name,
  latitude: 48.8566,
  longitude: 2.3522,
  populationByYear: { "800": 10000 },
});

describe("MapView behavior", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useViewportMock.mockReturnValue({
      isMobile: false,
      isDesktop: true,
      isTablet: false,
      screenWidth: 1440,
      screenHeight: 900,
      rawScreenWidth: 1440,
    });
    useMapViewStateMock.mockReturnValue({
      viewState: { longitude: 2.3522, latitude: 48.8566, zoom: 5 },
      handleMove: vi.fn(),
      cameraFitTarget: null,
      onCameraFitComplete: vi.fn(),
      syncViewStateFromMap: vi.fn(),
      cameraFitTargetRefForSync: { current: null },
      requestCameraFitTo: vi.fn(),
    });
    useMapStyleSwitchLoaderMock.mockReturnValue({
      isStyleSwitching: false,
      onOverlayIdle: vi.fn(),
      onBasemapIdle: vi.fn(),
    });
  });

  it("renders shell and canvas stack", () => {
    render(
      <MapView
        towns={[makeTown("Paris")]}
        selectedYear={800}
        initialPosition={{ latitude: 48.8566, longitude: 2.3522 }}
        initialZoom={5}
      />
    );

    expect(screen.getByTestId("map-view-shell")).toBeInTheDocument();
    expect(screen.getByTestId("map-canvas-stack")).toBeInTheDocument();
  });

  it("passes desktop interaction flags to map canvas stack", () => {
    render(
      <MapView
        towns={[makeTown("Paris")]}
        selectedYear={800}
        initialPosition={{ latitude: 48.8566, longitude: 2.3522 }}
        initialZoom={5}
      />
    );

    const props = mapCanvasStackSpy.mock.calls[0][0] as Record<string, unknown>;
    expect(props.enableZoomControls).toBe(true);
    expect(props.showZoomButtons).toBe(true);
    expect(props.isMobile).toBe(false);
  });

  it("disables zoom controls on mobile", () => {
    useViewportMock.mockReturnValue({
      isMobile: true,
      isDesktop: false,
      isTablet: false,
      screenWidth: 390,
      screenHeight: 844,
      rawScreenWidth: 390,
    });

    render(
      <MapView
        towns={[makeTown("Paris")]}
        selectedYear={800}
        initialPosition={{ latitude: 48.8566, longitude: 2.3522 }}
        initialZoom={5}
      />
    );

    const props = mapCanvasStackSpy.mock.calls[0][0] as Record<string, unknown>;
    expect(props.enableZoomControls).toBe(false);
    expect(props.showZoomButtons).toBe(false);
    expect(props.isMobile).toBe(true);
  });
});
