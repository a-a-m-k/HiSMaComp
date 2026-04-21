import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider } from "@mui/material/styles";

import theme from "@/theme/theme";
import Timeline from "@/components/controls/Timeline/Timeline";

const setSelectedYearSpy = vi.hoisted(() => vi.fn());
const mockUseMediaQuery = vi.hoisted(() => vi.fn(() => true));

vi.mock("@/context/AppContext", () => ({
  useApp: () => ({
    selectedYear: 1000,
    setSelectedYear: setSelectedYearSpy,
  }),
}));

vi.mock("@mui/material/useMediaQuery", () => ({
  __esModule: true,
  default: mockUseMediaQuery,
}));

const wrap = (ui: React.ReactElement) =>
  React.createElement(ThemeProvider, { theme }, ui);

describe("Timeline", () => {
  const marks = [
    { value: 800, label: "8th ct." },
    { value: 1000, label: "10th ct." },
    { value: 1200, label: "12th ct." },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseMediaQuery.mockReturnValue(true);
  });

  it("calls setSelectedYear when a desktop century button is clicked", async () => {
    const user = userEvent.setup();
    render(wrap(<Timeline marks={marks} />));

    await user.click(screen.getByRole("button", { name: "12th ct." }));

    expect(setSelectedYearSpy).toHaveBeenCalledWith(1200);
  });

  it("exposes a slider wired to the year index", () => {
    render(wrap(<Timeline marks={marks} />));

    const slider = screen.getByRole("slider");
    expect(slider).toHaveAttribute("aria-valuenow", "1");
    expect(slider).toHaveAttribute("aria-valuemin", "0");
    expect(slider).toHaveAttribute("aria-valuemax", "2");
  });
});
