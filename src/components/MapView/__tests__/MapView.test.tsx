import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import MapView from "../MapView";
import { AppProvider } from "@/context/AppContext";
import { Town } from "@/common/types";
import { mockTownsMinimal } from "../../../test/testUtils";

// Mock react-map-gl components for testing
vi.mock("react-map-gl/maplibre", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="map-container">{children}</div>
  ),
  NavigationControl: () => <div data-testid="navigation-control" />,
}));

// Mock maplibre-gl library
vi.mock("maplibre-gl", () => ({
  default: {},
}));

// Mock CSS imports
vi.mock("maplibre-gl/dist/maplibre-gl.css", () => ({}));

// Mock terrain style configuration
vi.mock("@assets/terrain-gl-style/terrain.json", () => ({
  default: { version: 8, sources: {}, layers: [] },
}));

// Mock screenshot button component
vi.mock("../../ScreenshotButton/ScreenshotButton", () => ({
  default: () => <div data-testid="screenshot-button" />,
}));

// Mock map layer component with data validation
vi.mock("../MapLayer/MapLayer", () => ({
  default: ({
    layerId,
    data,
  }: {
    layerId: string;
    data: { features: unknown[] };
  }) => (
    <div
      data-testid={`map-layer-${layerId}`}
      data-features={data.features.length}
    />
  ),
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <AppProvider towns={mockTownsMinimal}>{children}</AppProvider>
);

describe("MapView", () => {
  it("should render map container", () => {
    render(
      <TestWrapper>
        <MapView
          initialPosition={{ latitude: 48.8566, longitude: 2.3522 }}
          initialZoom={8}
        />
      </TestWrapper>
    );

    expect(screen.getByTestId("map-container")).toBeInTheDocument();
  });

  it("should render screenshot button", () => {
    render(
      <TestWrapper>
        <MapView
          initialPosition={{ latitude: 48.8566, longitude: 2.3522 }}
          initialZoom={8}
        />
      </TestWrapper>
    );

    expect(screen.getByTestId("screenshot-button")).toBeInTheDocument();
  });

  it("should render map layer with correct data", () => {
    render(
      <TestWrapper>
        <MapView
          initialPosition={{ latitude: 48.8566, longitude: 2.3522 }}
          initialZoom={8}
        />
      </TestWrapper>
    );

    const mapLayer = screen.getByTestId("map-layer-towns-population-layer");
    expect(mapLayer).toBeInTheDocument();
    expect(mapLayer).toHaveAttribute("data-features", "1"); // Only Paris has data for 800
  });

  it("should handle empty towns gracefully", () => {
    const EmptyWrapper = ({ children }: { children: React.ReactNode }) => (
      <AppProvider towns={[]}>{children}</AppProvider>
    );

    render(
      <EmptyWrapper>
        <MapView
          initialPosition={{ latitude: 48.8566, longitude: 2.3522 }}
          initialZoom={8}
        />
      </EmptyWrapper>
    );

    const mapLayer = screen.getByTestId("map-layer-towns-population-layer");
    expect(mapLayer).toHaveAttribute("data-features", "0");
  });

  it("should handle GeoJSON conversion errors gracefully", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    // Test with invalid data to trigger error handling
    const InvalidWrapper = ({ children }: { children: React.ReactNode }) => (
      <AppProvider towns={null as unknown as Town[]}>{children}</AppProvider>
    );

    render(
      <InvalidWrapper>
        <MapView
          initialPosition={{ latitude: 48.8566, longitude: 2.3522 }}
          initialZoom={8}
        />
      </InvalidWrapper>
    );

    // Should still render the map layer with empty features
    const mapLayer = screen.getByTestId("map-layer-towns-population-layer");
    expect(mapLayer).toBeInTheDocument();

    consoleSpy.mockRestore();
  });
});
