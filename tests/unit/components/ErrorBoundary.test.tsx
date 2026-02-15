import { describe, it, expect, vi, beforeEach, afterAll } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import ErrorBoundary from "@/components/dev/ErrorBoundary/ErrorBoundary";
import { Z_INDEX } from "@/constants/ui";
import { hasBackdropBlurStyles } from "../helpers/backdropFilter";

// Component that can throw errors for testing error boundary
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error("Test error");
  }
  return <div>No error</div>;
};

// Component that throws on mount and after recovery
const ThrowErrorWithMessage = ({ message }: { message: string }) => {
  throw new Error(message);
};

// Component that throws a different error
const ThrowCustomError = () => {
  throw new TypeError("Custom type error");
};

// Mock logger
vi.mock("@/utils/logger", () => ({
  logger: {
    error: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
}));

// Mock console methods to avoid noise in test output
const mockConsoleError = vi
  .spyOn(console, "error")
  .mockImplementation(() => {});
const mockConsoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});

describe("ErrorBoundary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset error boundary state by creating new instance
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

    expect(screen.getByText("Oops! Something went wrong")).toBeInTheDocument();
    expect(screen.getByText("Test error")).toBeInTheDocument();
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

  it("should have a try again button", () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    const tryAgainButton = screen.getByRole("button", { name: /try again/i });
    expect(tryAgainButton).toBeInTheDocument();
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

  it("should reset error state when try again button is clicked", () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    // Verify error UI is shown
    expect(screen.getByText("Oops! Something went wrong")).toBeInTheDocument();

    // Click try again button
    const tryAgainButton = screen.getByRole("button", { name: /try again/i });
    tryAgainButton.click();

    // Re-render with non-throwing component
    rerender(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    // Should render children normally after reset
    expect(screen.getByText("No error")).toBeInTheDocument();
    expect(
      screen.queryByText("Oops! Something went wrong")
    ).not.toBeInTheDocument();
  });

  it("should log error when error is caught", async () => {
    const { logger } = await import("@/utils/logger");

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    // Wait for error boundary to catch error
    await waitFor(() => {
      expect(logger.error).toHaveBeenCalledWith(
        "Error Boundary caught an error:",
        expect.any(Error),
        expect.any(Object)
      );
    });
  });

  it("should log debug info in development mode", async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "development";

    const { logger } = await import("@/utils/logger");

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    await waitFor(() => {
      expect(logger.debug).toHaveBeenCalledWith(
        "Error Details:",
        expect.objectContaining({
          error: expect.any(String),
          errorInfo: expect.any(Object),
          componentStack: expect.any(String),
        })
      );
    });

    process.env.NODE_ENV = originalEnv;
  });

  it("should align debug logging with the active build mode", async () => {
    const { logger } = await import("@/utils/logger");

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    await waitFor(() => {
      expect(logger.error).toHaveBeenCalled();
    });

    if (import.meta.env.DEV) {
      expect(logger.debug).toHaveBeenCalled();
    } else {
      expect(logger.debug).not.toHaveBeenCalled();
    }
  });

  it("should display error message in development mode", () => {
    render(
      <ErrorBoundary>
        <ThrowErrorWithMessage message="Development error message" />
      </ErrorBoundary>
    );

    expect(
      screen.getAllByText(/Development error message/i).length
    ).toBeGreaterThan(0);
  });

  it("should display the thrown error message in the alert", () => {
    render(
      <ErrorBoundary>
        <ThrowErrorWithMessage message="Production error message" />
      </ErrorBoundary>
    );

    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Production error message");
    expect(screen.getByText("Oops! Something went wrong")).toBeInTheDocument();
  });

  it("should render custom fallback when provided", () => {
    const customFallback = <div>Custom error fallback</div>;

    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText("Custom error fallback")).toBeInTheDocument();
    expect(
      screen.queryByText("Oops! Something went wrong")
    ).not.toBeInTheDocument();
  });

  it("should handle different error types", () => {
    render(
      <ErrorBoundary>
        <ThrowCustomError />
      </ErrorBoundary>
    );

    expect(screen.getByText("Oops! Something went wrong")).toBeInTheDocument();
  });

  it("should have proper ARIA labels on buttons", () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    const tryAgainButton = screen.getByRole("button", { name: /try again/i });
    const reloadButton = screen.getByRole("button", { name: /reload/i });

    expect(tryAgainButton).toHaveAttribute(
      "aria-label",
      "Try again to reset error and continue"
    );
    expect(reloadButton).toHaveAttribute(
      "aria-label",
      "Reload page to recover from error"
    );
  });

  it("should show development hint in development mode", () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "development";

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText(/Check the console/i)).toBeInTheDocument();

    process.env.NODE_ENV = originalEnv;
  });

  it("should render development hint based on active build mode", () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    if (import.meta.env.DEV) {
      expect(screen.getByText(/Check the console/i)).toBeInTheDocument();
    } else {
      expect(screen.queryByText(/Check the console/i)).not.toBeInTheDocument();
    }
  });

  describe("Error overlay styling", () => {
    const getErrorOverlay = (container: HTMLElement) => {
      const errorOverlays = container.querySelectorAll(
        '[class*="MuiBox-root"]'
      );
      return Array.from(errorOverlays).find(el => {
        const styles = window.getComputedStyle(el);
        return (
          styles.position === "fixed" &&
          parseInt(styles.zIndex || "0", 10) >= 99999
        );
      }) as HTMLElement;
    };

    it("should have fixed positioning covering full viewport", () => {
      const { container } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const errorOverlay = getErrorOverlay(container);
      expect(errorOverlay).toBeInTheDocument();

      const styles = window.getComputedStyle(errorOverlay);
      expect(styles.position).toBe("fixed");
      expect(styles.top).toBe("0px");
      expect(styles.left).toBe("0px");
      expect(styles.right).toBe("0px");
      expect(styles.bottom).toBe("0px");
    });

    it("should have highest z-index to overlay all components", () => {
      const { container } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const errorOverlay = getErrorOverlay(container);
      expect(errorOverlay).toBeInTheDocument();

      const styles = window.getComputedStyle(errorOverlay);
      const zIndex = parseInt(styles.zIndex || "0", 10);

      expect(zIndex).toBe(Z_INDEX.ERROR);
      expect(zIndex).toBeGreaterThanOrEqual(99999);
    });

    it("should have backdrop with blur effect", () => {
      const { container } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const errorOverlay = getErrorOverlay(container);
      expect(errorOverlay).toBeInTheDocument();

      const styles = window.getComputedStyle(errorOverlay);

      expect(styles.backgroundColor).toContain("rgba");
      // backdropFilter may not be computed in test environment (jsdom limitation)
      // Verify the style attribute, computed style, or injected styles contain blur
      const styleAttr = errorOverlay.getAttribute("style") || "";
      const hasBackdropFilterInStyle =
        styleAttr.includes("backdrop-filter") || styleAttr.includes("blur");
      const hasBackdropFilterInComputed =
        styles.backdropFilter && styles.backdropFilter.includes("blur");
      const hasBackdropFilterInEmotion = hasBackdropBlurStyles();
      // In jsdom, backdrop-filter is often not computed, so we verify the component sets it
      // by checking if either the style attribute, computed style, or injected CSS contains it
      expect(
        hasBackdropFilterInStyle ||
          hasBackdropFilterInComputed ||
          hasBackdropFilterInEmotion
      ).toBeTruthy();
    });

    it("should center error content on screen", () => {
      const { container } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const errorOverlay = getErrorOverlay(container);
      expect(errorOverlay).toBeInTheDocument();

      const styles = window.getComputedStyle(errorOverlay);

      expect(styles.display).toBe("flex");
      expect(styles.alignItems).toBe("center");
      expect(styles.justifyContent).toBe("center");
    });
  });
});
