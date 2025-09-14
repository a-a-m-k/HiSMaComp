import { describe, it, expect, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { AppProvider, useApp } from "../AppContext";
import { mockTownsMinimal } from "../../test/testUtils";

// Test component that uses the AppContext to verify behavior
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
  it("should provide default values and filter towns correctly", () => {
    render(
      <AppProvider towns={mockTownsMinimal}>
        <TestComponent />
      </AppProvider>
    );

    expect(screen.getByTestId("selected-year")).toHaveTextContent("800");
    expect(screen.getByTestId("filtered-count")).toHaveTextContent("1"); // Only Paris has data for 800
    expect(screen.getByTestId("town-names")).toHaveTextContent("Paris");
  });

  it("should update selected year and show correct towns", () => {
    render(
      <AppProvider towns={mockTownsMinimal}>
        <TestComponent />
      </AppProvider>
    );

    const changeButton = screen.getByTestId("change-year");

    act(() => {
      changeButton.click();
    });

    expect(screen.getByTestId("selected-year")).toHaveTextContent("1200");
    expect(screen.getByTestId("filtered-count")).toHaveTextContent("2"); // Both towns have data for 1200
    expect(screen.getByTestId("town-names")).toHaveTextContent("Paris, London");
  });

  it("should throw error when used outside provider", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    // Test that context throws when used without provider
    expect(() => {
      render(<TestComponent />);
    }).toThrow("useApp must be used within an AppProvider");

    consoleSpy.mockRestore();
  });

  it("should handle empty towns array", () => {
    render(
      <AppProvider towns={[]}>
        <TestComponent />
      </AppProvider>
    );

    expect(screen.getByTestId("filtered-count")).toHaveTextContent("0");
  });

  it("should handle invalid year gracefully", () => {
    const TestComponentWithInvalidYear = () => {
      const { setSelectedYear } = useApp();

      return (
        <button data-testid="invalid-year" onClick={() => setSelectedYear(-1)}>
          Set Invalid Year
        </button>
      );
    };

    render(
      <AppProvider towns={mockTownsMinimal}>
        <TestComponentWithInvalidYear />
      </AppProvider>
    );

    const button = screen.getByTestId("invalid-year");
    // Should not crash when setting invalid year
    expect(() => {
      act(() => {
        button.click();
      });
    }).not.toThrow();
  });
});
