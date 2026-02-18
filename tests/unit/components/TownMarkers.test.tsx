import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { TownMarkers } from "@/components/map/MapView/TownMarkers/TownMarkers";
import type { Town } from "@/common/types";

const disableTownMarkerFocusSpy = vi.hoisted(() => vi.fn());
const keyDownSpy = vi.hoisted(() => vi.fn());

vi.mock("@/utils/markers", () => ({
  disableTownMarkerFocus: (element: HTMLElement) =>
    disableTownMarkerFocusSpy(element),
}));

vi.mock("@/hooks/map", () => ({
  useMarkerKeyboardNavigation:
    () => (e: React.KeyboardEvent, markerId: string) =>
      keyDownSpy(e, markerId),
}));

vi.mock("@/components/map/MapView/TownMarkers/TownMarkerItem", () => ({
  TownMarkerItem: ({
    town,
    markerId,
    isFocused,
    isHovered,
    onFocus,
    onBlur,
    onMouseEnter,
    onMouseLeave,
    onKeyDown,
  }: {
    town: Town;
    markerId: string;
    isFocused: boolean;
    isHovered: boolean;
    onFocus: (id: string) => void;
    onBlur: (e: React.FocusEvent) => void;
    onMouseEnter: (id: string) => void;
    onMouseLeave: () => void;
    onKeyDown: (e: React.KeyboardEvent, id: string) => void;
  }) => (
    <button
      data-testid={`marker-${town.name}`}
      data-marker-id={markerId}
      data-focused={isFocused ? "true" : "false"}
      data-hovered={isHovered ? "true" : "false"}
      onFocus={() => onFocus(markerId)}
      onBlur={e => onBlur(e)}
      onMouseEnter={() => onMouseEnter(markerId)}
      onMouseLeave={onMouseLeave}
      onKeyDown={e => onKeyDown(e, markerId)}
    >
      {town.name}
    </button>
  ),
}));

describe("TownMarkers interactions", () => {
  const towns: Town[] = [
    {
      name: "SmallTown",
      latitude: 1,
      longitude: 1,
      populationByYear: { "1000": 100 },
    },
    {
      name: "BigTown",
      latitude: 2,
      longitude: 2,
      populationByYear: { "1000": 900 },
    },
    {
      name: "MidTown",
      latitude: 3,
      longitude: 3,
      populationByYear: { "1000": 500 },
    },
  ];

  const selectedYear = 1000;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders nothing when towns are empty", () => {
    const { container } = render(
      <TownMarkers towns={[]} selectedYear={selectedYear} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders markers sorted by selected-year population (descending)", () => {
    render(<TownMarkers towns={towns} selectedYear={selectedYear} />);

    const renderedMarkers = screen.getAllByRole("button");
    const names = renderedMarkers.map(node => node.textContent);
    expect(names).toEqual(["BigTown", "MidTown", "SmallTown"]);
  });

  it("tracks focus, hover, blur, and keyboard interactions", () => {
    render(<TownMarkers towns={towns} selectedYear={selectedYear} />);

    const bigTownMarker = screen.getByTestId("marker-BigTown");
    const midTownMarker = screen.getByTestId("marker-MidTown");

    fireEvent.focus(bigTownMarker);
    expect(bigTownMarker).toHaveAttribute("data-focused", "true");

    fireEvent.mouseEnter(midTownMarker);
    expect(midTownMarker).toHaveAttribute("data-hovered", "true");

    fireEvent.keyDown(midTownMarker, { key: "ArrowRight" });
    expect(keyDownSpy).toHaveBeenCalled();

    fireEvent.blur(bigTownMarker);
    expect(disableTownMarkerFocusSpy).toHaveBeenCalled();
    expect(bigTownMarker).toHaveAttribute("data-focused", "false");
  });
});
