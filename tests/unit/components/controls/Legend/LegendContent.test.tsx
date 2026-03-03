import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "@mui/material/styles";
import theme from "@/theme/theme";
import { LegendContent } from "@/components/controls/Legend/LegendContent";
import type { LayerItem } from "@/common/types";

const wrap = (ui: React.ReactElement) =>
  React.createElement(ThemeProvider, { theme }, ui);

vi.mock("@/hooks/ui", async () => {
  const { createResponsiveMock } = await import(
    "../../../../helpers/mocks/responsive"
  );
  return {
    useResponsive: vi.fn(() => createResponsiveMock()),
  };
});

vi.mock("@/constants/sizing", () => ({
  getLegendStyles: () => ({
    itemText: {},
    attributionLinks: {},
  }),
}));

vi.mock("./useLegendContentStyles", () => ({
  useLegendContentStyles: () => ({
    titleStyle: {},
    subtitleStyle: {},
    stackStyles: {},
  }),
}));

vi.mock("@/components/ui", () => ({
  AttributionLinks: () => (
    <div data-testid="attribution-links">Attribution</div>
  ),
}));

const defaultLayers: LayerItem[] = [
  { layer: "0–1k", color: "#abc" },
  { layer: "1k–5k", color: "#def" },
  { layer: "5k+", color: "#123" },
];

describe("LegendContent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null when layers is empty or undefined", () => {
    const { container } = render(
      wrap(<LegendContent layers={[]} label="Population" selectedYear={1000} />)
    );
    expect(container.firstChild).toBeNull();

    const { container: c2 } = render(
      wrap(
        <LegendContent
          layers={undefined as unknown as LayerItem[]}
          label="Population"
          selectedYear={1000}
        />
      )
    );
    expect(c2.firstChild).toBeNull();
  });

  it("renders heading and layer list with labels", () => {
    render(
      wrap(
        <LegendContent
          layers={defaultLayers}
          label="Town size by population"
          selectedYear={1200}
        />
      )
    );

    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      "Town size by population"
    );
    expect(screen.getByText("0–1k")).toBeInTheDocument();
    expect(screen.getByText("1k–5k")).toBeInTheDocument();
    expect(screen.getByText("5k+")).toBeInTheDocument();
  });

  it("renders subtitle and attribution when isMapIdle is true", () => {
    render(
      wrap(
        <LegendContent
          layers={defaultLayers}
          label="Legend"
          selectedYear={1000}
          isMapIdle={true}
        />
      )
    );

    expect(screen.getByText(/Time around 1000/)).toBeInTheDocument();
    expect(screen.getByTestId("attribution-links")).toBeInTheDocument();
  });

  it("hides subtitle, layer stack and attribution when isMapIdle is false", () => {
    render(
      wrap(
        <LegendContent
          layers={defaultLayers}
          label="Legend"
          selectedYear={1000}
          isMapIdle={false}
        />
      )
    );

    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      "Legend"
    );
    expect(screen.queryByText(/Time around/)).not.toBeInTheDocument();
    expect(screen.queryByTestId("attribution-links")).not.toBeInTheDocument();
    expect(screen.queryByText("0–1k")).not.toBeInTheDocument();
  });

  it("uses section with aria-labelledby for accessibility", () => {
    render(
      wrap(
        <LegendContent
          layers={defaultLayers}
          label="Population"
          selectedYear={800}
        />
      )
    );

    const section = document.querySelector(
      'section[aria-labelledby="legend-heading"]'
    );
    expect(section).toBeInTheDocument();
    expect(document.getElementById("legend-heading")).toHaveTextContent(
      "Population"
    );
  });
});
