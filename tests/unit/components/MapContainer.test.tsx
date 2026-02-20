import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider } from "@mui/material";

import type { Town } from "@/common/types";
import theme from "@/theme/theme";
import { MapContainer } from "@/components/containers";

const mapViewSpy = vi.hoisted(() => vi.fn());
const retrySpy = vi.hoisted(() => vi.fn());

const viewportState = vi.hoisted(() => ({
  isBelowMinViewport: false,
  rawScreenWidth: 1024,
}));
const overlayState = vi.hoisted(() => ({
  showOverlayButtons: true,
  isResizing: false,
}));

const state = vi.hoisted(() => ({
  townsData: {
    towns: [
      {
        name: "Paris",
        latitude: 48.8566,
        longitude: 2.3522,
        populationByYear: { "800": 20000, "1000": 35000 },
      } as Town,
    ],
    isLoading: false,
    error: null as string | null,
    retry: vi.fn(),
  },
  appData: {
    towns: [] as Town[],
    isLoading: false,
    error: null as string | null,
    retry: retrySpy,
    selectedYear: 800,
    setSelectedYear: vi.fn(),
    filteredTowns: [] as Town[],
    clearError: vi.fn(),
  },
  initialMapState: {
    center: { latitude: 48.8566, longitude: 2.3522 } as {
      latitude: number;
      longitude: number;
    },
    fitZoom: 6,
  },
  legendLayers: [
    { layer: "small", color: "#ff0000" },
    { layer: "large", color: "#00ff00" },
  ],
}));

vi.mock("@/components/map/MapView/MapView", () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    mapViewSpy(props);
    return <div data-testid="map-view">Map View</div>;
  },
}));

vi.mock("@/components/controls/Timeline/Timeline", () => ({
  __esModule: true,
  default: ({ marks }: { marks: unknown[] }) => (
    <div data-testid="timeline">{`Timeline marks: ${marks.length}`}</div>
  ),
}));

vi.mock("@/components/controls/Legend/Legend", () => ({
  __esModule: true,
  default: ({ layers }: { layers: unknown[] }) => (
    <div data-testid="legend">{`Legend layers: ${layers.length}`}</div>
  ),
}));

vi.mock("@/context/AppContext", async () => {
  const { createPassthroughAppProvider } = await import(
    "../../helpers/mocks/appContext"
  );
  return {
    ...createPassthroughAppProvider(),
    useApp: () => state.appData,
  };
});

vi.mock("@/hooks", () => ({
  useLegendLayers: () => state.legendLayers,
  useTownsData: () => state.townsData,
}));

vi.mock("@/hooks/ui", () => ({
  useViewport: () => ({
    isBelowMinViewport: viewportState.isBelowMinViewport,
    rawScreenWidth: viewportState.rawScreenWidth,
    isMobile: false,
    isTablet: false,
    screenWidth: 1024,
    screenHeight: 768,
  }),
  useNarrowLayout: () => false,
  useOverlayButtonsVisible: () => overlayState,
}));

vi.mock("@/hooks/map", () => ({
  useInitialMapState: vi.fn(() => state.initialMapState),
  useMapViewState: vi.fn(() => ({
    viewState: { longitude: 2.3522, latitude: 48.8566, zoom: 6 },
    handleMove: vi.fn(),
    programmaticTarget: null,
    onProgrammaticAnimationEnd: vi.fn(),
    syncViewStateFromMap: vi.fn(),
    programmaticTargetRefForSync: { current: null },
  })),
  useProgrammaticMapFit: vi.fn(() => ({ current: false })),
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

const mockLogger = vi.hoisted(() => ({
  error: vi.fn(),
  warn: vi.fn(),
  info: vi.fn(),
  debug: vi.fn(),
}));

vi.mock("@/utils/logger", () => ({
  logger: mockLogger,
}));

const renderWithTheme = () =>
  render(
    <ThemeProvider theme={theme}>
      <MapContainer />
    </ThemeProvider>
  );

describe("MapContainer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    viewportState.isBelowMinViewport = false;
    viewportState.rawScreenWidth = 1024;
    overlayState.showOverlayButtons = true;
    overlayState.isResizing = false;
    const defaultTowns = [
      {
        name: "Paris",
        latitude: 48.8566,
        longitude: 2.3522,
        populationByYear: { "800": 20000, "1000": 35000 },
      } as Town,
    ];
    state.townsData = {
      towns: defaultTowns,
      isLoading: false,
      error: null,
    };
    state.appData = {
      towns: defaultTowns,
      isLoading: false,
      error: null,
      retry: retrySpy,
      selectedYear: 800,
      setSelectedYear: vi.fn(),
      filteredTowns: defaultTowns,
      clearError: vi.fn(),
    };
    state.initialMapState = {
      center: { latitude: 48.8566, longitude: 2.3522 },
      fitZoom: 6,
    };
    state.legendLayers = [
      { layer: "small", color: "#ff0000" },
      { layer: "large", color: "#00ff00" },
    ];
  });

  it("renders controls and map in normal flow", async () => {
    renderWithTheme();

    expect(await screen.findByTestId("timeline")).toBeInTheDocument();
    expect(screen.getByTestId("legend")).toBeInTheDocument();
    expect(screen.getByTestId("map-view")).toBeInTheDocument();
  });

  it("shows source data error overlay when towns loading fails", async () => {
    state.townsData.error = "Network error";

    renderWithTheme();

    expect(await screen.findByText("Data Loading Error")).toBeInTheDocument();
    expect(screen.getByText("Network error")).toBeInTheDocument();
    expect(screen.queryByTestId("timeline")).not.toBeInTheDocument();
    expect(screen.queryByTestId("legend")).not.toBeInTheDocument();
  });

  it("shows app error overlay and triggers retry callback", async () => {
    state.appData.error = "Failed to process towns";

    renderWithTheme();

    expect(await screen.findByText("Data Loading Error")).toBeInTheDocument();
    const retryButton = screen.getByRole("button", { name: /try again/i });
    await userEvent.click(retryButton);
    expect(retrySpy).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId("timeline")).not.toBeInTheDocument();
    expect(screen.queryByTestId("legend")).not.toBeInTheDocument();
  });

  it("uses default map coordinates while source towns are loading", async () => {
    state.townsData.isLoading = true;
    state.townsData.towns = [];
    state.appData.towns = [];

    renderWithTheme();
    await waitFor(() => expect(mapViewSpy).toHaveBeenCalled());

    const latestProps = mapViewSpy.mock.calls.at(-1)?.[0] as {
      initialPosition: { latitude: number; longitude: number };
      initialZoom: number;
    };

    expect(latestProps.initialPosition).toEqual({
      latitude: 50,
      longitude: 10,
    });
    expect(latestProps.initialZoom).toBe(4);
  });

  it("falls back to default map settings for invalid initial map params", async () => {
    state.initialMapState.fitZoom = Number.NaN;

    renderWithTheme();
    await waitFor(() => expect(mapViewSpy).toHaveBeenCalled());

    const latestProps = mapViewSpy.mock.calls.at(-1)?.[0] as {
      initialPosition: { latitude: number; longitude: number };
      initialZoom: number;
    };

    expect(mockLogger.error).toHaveBeenCalledWith("Invalid map parameters:", {
      center: { latitude: 48.8566, longitude: 2.3522 },
      fitZoom: Number.NaN,
    });
    expect(latestProps.initialPosition).toEqual({
      latitude: 50,
      longitude: 10,
    });
    expect(latestProps.initialZoom).toBe(4);
  });

  it("passes showOverlayButtons from useOverlayButtonsVisible to MapView", async () => {
    overlayState.showOverlayButtons = false;
    overlayState.isResizing = true;

    renderWithTheme();
    await waitFor(() => expect(mapViewSpy).toHaveBeenCalled());

    const latestProps = mapViewSpy.mock.calls.at(-1)?.[0] as {
      showOverlayButtons: boolean;
    };
    expect(latestProps.showOverlayButtons).toBe(false);
  });

  it("does not show resize spinner when viewport is below min width", async () => {
    viewportState.isBelowMinViewport = true;
    overlayState.isResizing = true;
    overlayState.showOverlayButtons = false;

    renderWithTheme();

    expect(screen.queryByText("Resizing map...")).not.toBeInTheDocument();
  });

  it("shows resize spinner when resizing and viewport above min", async () => {
    viewportState.isBelowMinViewport = false;
    overlayState.isResizing = true;

    renderWithTheme();

    expect(await screen.findByText("Resizing map...")).toBeInTheDocument();
  });
});
