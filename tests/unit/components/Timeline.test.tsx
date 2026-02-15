import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import Timeline from "@/components/controls/Timeline/Timeline";

const setSelectedYearSpy = vi.hoisted(() => vi.fn());
const getMobileLabelledMarksSpy = vi.hoisted(() => vi.fn());
const sliderPropsSpy = vi.hoisted(() => vi.fn());

const state = vi.hoisted(() => ({
  selectedYear: 1000,
  isMobile: false,
  isTablet: false,
}));

vi.mock("@/context/AppContext", () => ({
  useApp: () => ({
    selectedYear: state.selectedYear,
    setSelectedYear: setSelectedYearSpy,
  }),
}));

vi.mock("@/hooks/ui", () => ({
  useResponsive: () => ({
    isMobile: state.isMobile,
    isTablet: state.isTablet,
    theme: {
      palette: {
        text: { primary: "#111111" },
      },
    },
  }),
}));

vi.mock("@/constants/sizing", () => ({
  getTimelineStyles: () => ({
    title: {},
  }),
}));

vi.mock("@/components/controls/Timeline/utils", () => ({
  getMobileLabelledMarks: (...args: unknown[]) =>
    getMobileLabelledMarksSpy(...args),
}));

vi.mock("@/components/controls/Timeline/TimelineSlider", () => ({
  TimelineSlider: (props: {
    marks: Array<{ value: number; label: string }>;
    min: number;
    max: number;
    value: number;
    onChange: (value: number) => void;
  }) => {
    sliderPropsSpy(props);
    return (
      <button
        data-testid="timeline-slider"
        onClick={() => props.onChange(1200)}
      >{`Year ${props.value}`}</button>
    );
  },
}));

describe("Timeline flow", () => {
  const marks = [
    { value: 800, label: "8th ct." },
    { value: 1000, label: "10th ct." },
    { value: 1200, label: "12th ct." },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    state.selectedYear = 1000;
    state.isMobile = false;
    state.isTablet = false;
    getMobileLabelledMarksSpy.mockImplementation(
      (inputMarks: Array<{ value: number; label: string }>) => inputMarks
    );
  });

  it("passes selected year and bounds into TimelineSlider", () => {
    render(<Timeline marks={marks} />);

    const sliderCall = sliderPropsSpy.mock.calls.at(-1)?.[0];
    expect(sliderCall.value).toBe(1000);
    expect(sliderCall.min).toBe(800);
    expect(sliderCall.max).toBe(1200);
    expect(sliderCall.marks).toEqual(marks);
  });

  it("updates selected year through setSelectedYear on slider interaction", async () => {
    render(<Timeline marks={marks} />);

    await userEvent.click(screen.getByTestId("timeline-slider"));

    expect(setSelectedYearSpy).toHaveBeenCalledWith(1200);
  });

  it("uses mobile-labeled marks strategy on mobile layout", () => {
    state.isMobile = true;
    const mobileMarks = [
      { value: 800, label: "8th ct." },
      { value: 1000, label: "" },
      { value: 1200, label: "12th ct." },
    ];
    getMobileLabelledMarksSpy.mockReturnValue(mobileMarks);

    render(<Timeline marks={marks} />);

    expect(getMobileLabelledMarksSpy).toHaveBeenCalledWith(marks, 1000);
    const sliderCall = sliderPropsSpy.mock.calls.at(-1)?.[0];
    expect(sliderCall.marks).toEqual(mobileMarks);
  });
});
