import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { TownMarkerItem } from "@/components/map/MapView/TownMarkers/TownMarkerItem";
import type { Town } from "@/common/types";

const enableTownMarkerFocusSpy = vi.hoisted(() => vi.fn());

vi.mock("react-map-gl/maplibre", () => ({
  Marker: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="marker-wrapper">{children}</div>
  ),
}));

vi.mock("@/utils/markers", () => ({
  calculateMarkerDiameter: () => 24,
  calculateMarkerColor: () => "#1f77b4",
  generateTownMarkerAriaLabel: () => "Marker ARIA Label",
  enableTownMarkerFocus: (element: HTMLElement) =>
    enableTownMarkerFocusSpy(element),
}));

describe("TownMarkerItem", () => {
  const town: Town = {
    name: "Paris",
    latitude: 48.8566,
    longitude: 2.3522,
    populationByYear: { "1000": 35000 },
  };

  const baseProps = {
    town,
    markerId: "marker-Paris-0",
    isFocused: false,
    isHovered: false,
    onFocus: vi.fn(),
    onBlur: vi.fn(),
    onMouseEnter: vi.fn(),
    onMouseLeave: vi.fn(),
    onKeyDown: vi.fn(),
    selectedYear: 1000,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders marker with accessible role and aria-label", () => {
    render(<TownMarkerItem {...baseProps} />);

    const markerButton = screen.getByRole("button", {
      name: "Marker ARIA Label",
    });
    expect(markerButton).toBeInTheDocument();
    expect(markerButton).toHaveAttribute("data-marker-id", "marker-Paris-0");
  });

  it("emits focus and keyboard callbacks for marker interaction", () => {
    render(<TownMarkerItem {...baseProps} />);
    const markerButton = screen.getByRole("button", {
      name: "Marker ARIA Label",
    });

    fireEvent.focus(markerButton);
    expect(baseProps.onFocus).toHaveBeenCalledWith("marker-Paris-0");
    expect(enableTownMarkerFocusSpy).toHaveBeenCalled();

    fireEvent.keyDown(markerButton, { key: "Enter" });
    expect(baseProps.onKeyDown).toHaveBeenCalledWith(
      expect.any(Object),
      "marker-Paris-0"
    );
  });

  it("shows label details when marker is focused", () => {
    render(<TownMarkerItem {...baseProps} isFocused />);

    expect(screen.getByText("Paris")).toBeInTheDocument();
    expect(screen.getByText("35,000")).toBeInTheDocument();
  });

  it("focuses marker on click and triggers hover handlers", () => {
    render(<TownMarkerItem {...baseProps} />);
    const markerButton = screen.getByRole("button", {
      name: "Marker ARIA Label",
    }) as HTMLElement;

    fireEvent.mouseEnter(markerButton);
    expect(baseProps.onMouseEnter).toHaveBeenCalledWith("marker-Paris-0");

    fireEvent.click(markerButton);
    expect(enableTownMarkerFocusSpy).toHaveBeenCalledWith(markerButton);
  });
});
