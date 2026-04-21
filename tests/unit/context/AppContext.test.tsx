import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AppProvider, useApp } from "@/context/AppContext";
import { mockTownsMinimal } from "../../helpers/testUtils";

const mockLogger = vi.hoisted(() => ({
  error: vi.fn(),
  warn: vi.fn(),
  info: vi.fn(),
  debug: vi.fn(),
}));

vi.mock("@/utils/logger", () => ({
  logger: mockLogger,
}));

const mockUseYearDataController = vi.hoisted(() =>
  vi.fn(() => ({
    filteredTowns: [],
    isLoading: false,
    error: null,
    clearError: vi.fn(),
    retry: vi.fn(),
  }))
);

vi.mock("@/context/useYearDataController", () => ({
  useYearDataController: mockUseYearDataController,
}));

const TestComponent = () => {
  const { selectedYear, setSelectedYear, filteredTowns } = useApp();

  return (
    <div>
      <div data-testid="selected-year">{selectedYear}</div>
      <div data-testid="filtered-count">{filteredTowns.length}</div>
      <div data-testid="town-names">
        {filteredTowns.map(town => town.name).join(", ")}
      </div>
      <button data-testid="change-year" onClick={() => setSelectedYear(1200)}>
        Change Year
      </button>
    </div>
  );
};

describe("AppContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseYearDataController.mockReturnValue({
      filteredTowns: [mockTownsMinimal[0]],
      isLoading: false,
      error: null,
      clearError: vi.fn(),
      retry: vi.fn(),
    });
  });

  it("provides default selected year and controller data", () => {
    render(
      <AppProvider towns={mockTownsMinimal}>
        <TestComponent />
      </AppProvider>
    );

    expect(screen.getByTestId("selected-year")).toHaveTextContent("800");
    expect(screen.getByTestId("filtered-count")).toHaveTextContent("1");
    expect(screen.getByTestId("town-names")).toHaveTextContent("Paris");
  });

  it("updates selected year when valid year is chosen", () => {
    render(
      <AppProvider towns={mockTownsMinimal}>
        <TestComponent />
      </AppProvider>
    );

    fireEvent.click(screen.getByTestId("change-year"));
    expect(screen.getByTestId("selected-year")).toHaveTextContent("1200");
  });

  it("should throw error when used outside provider", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow("useApp must be used within an AppProvider");

    consoleSpy.mockRestore();
  });

  it("ignores invalid year and logs a warning", () => {
    const TestComponentWithInvalidYear = () => {
      const { selectedYear, setSelectedYear } = useApp();

      return (
        <>
          <div data-testid="selected-year">{selectedYear}</div>
          <button
            data-testid="invalid-year"
            onClick={() => setSelectedYear(-1)}
          >
            Set Invalid Year
          </button>
        </>
      );
    };

    render(
      <AppProvider towns={mockTownsMinimal}>
        <TestComponentWithInvalidYear />
      </AppProvider>
    );

    fireEvent.click(screen.getByTestId("invalid-year"));
    expect(screen.getByTestId("selected-year")).toHaveTextContent("800");
    expect(mockLogger.warn).toHaveBeenCalledTimes(1);
  });
});
