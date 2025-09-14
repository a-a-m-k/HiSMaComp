import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ErrorBoundary from "../ErrorBoundary";

// Component that can throw errors for testing error boundary
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error("Test error");
  }
  return <div>No error</div>;
};

// Mock console methods to avoid noise in test output
const mockConsoleError = vi
  .spyOn(console, "error")
  .mockImplementation(() => {});
const mockConsoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});

describe("ErrorBoundary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterAll(() => {
    mockConsoleError.mockRestore();
    mockConsoleWarn.mockRestore();
  });

  it("should render children when there is no error", () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText("No error")).toBeInTheDocument();
  });

  it("should render error UI when child throws error", () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(
      screen.getByText("🚨 Oops! Something went wrong")
    ).toBeInTheDocument();
    expect(screen.getByText(/Here.*what happened/)).toBeInTheDocument();
  });

  it("should show error details when error occurs", () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    // Error boundary should display error message and details
    expect(
      screen.getByText("🚨 Oops! Something went wrong")
    ).toBeInTheDocument();
    expect(screen.getByText(/Here.*what happened/)).toBeInTheDocument();
  });

  it("should have a reload button", () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    const reloadButton = screen.getByRole("button", { name: /reload/i });
    expect(reloadButton).toBeInTheDocument();
  });

  it("should reload page when reload button is clicked", () => {
    const mockReload = vi.fn();
    Object.defineProperty(window, "location", {
      value: { reload: mockReload },
      writable: true,
    });

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    const reloadButton = screen.getByRole("button", { name: /reload/i });
    reloadButton.click();

    expect(mockReload).toHaveBeenCalled();
  });
});
