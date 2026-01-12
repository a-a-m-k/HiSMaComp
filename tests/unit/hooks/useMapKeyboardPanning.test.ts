/**
 * Tests for useMapKeyboardPanning hook
 *
 * Tests keyboard panning functionality including:
 * - Focus detection (markers, input fields, map container)
 * - Continuous panning while keys are held
 * - Proper cleanup on unmount
 */

import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
  beforeAll,
  afterAll,
} from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useRef } from "react";
import { MapRef } from "react-map-gl/maplibre";
import { useMapKeyboardPanning } from "@/hooks/map/useMapKeyboardPanning";

// Mock logger
vi.mock("@/utils/logger", () => ({
  logger: {
    error: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
}));

describe("useMapKeyboardPanning", () => {
  let mapRef: React.RefObject<MapRef>;
  let containerRef: React.RefObject<HTMLElement>;
  let mockPanBy: ReturnType<typeof vi.fn>;
  let mockGetCanvas: ReturnType<typeof vi.fn>;
  let mockMapInstance: {
    panBy: ReturnType<typeof vi.fn>;
    getCanvas: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.useFakeTimers();
    // Create refs
    mapRef = { current: null } as React.RefObject<MapRef>;
    containerRef = { current: null } as React.RefObject<HTMLElement>;

    // Mock map methods
    mockPanBy = vi.fn();
    mockGetCanvas = vi.fn(() => ({
      width: 800,
      height: 600,
    }));

    mockMapInstance = {
      panBy: mockPanBy,
      getCanvas: mockGetCanvas,
    };

    // Mock getMap to return mock instance
    Object.defineProperty(mapRef, "current", {
      value: {
        getMap: () => mockMapInstance,
      } as unknown as MapRef,
      writable: true,
      configurable: true,
    });

    // Create a real DOM element for container
    const containerElement = document.createElement("div");
    containerElement.id = "map-container-area";
    document.body.appendChild(containerElement);
    Object.defineProperty(containerRef, "current", {
      value: containerElement,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
    if (containerRef.current?.parentNode) {
      document.body.removeChild(containerRef.current);
    }
  });

  it("should not pan when hook is disabled", () => {
    renderHook(() => useMapKeyboardPanning(mapRef, containerRef, false));

    // Focus container and press arrow key
    containerRef.current?.focus();
    act(() => {
      const keyDownEvent = new KeyboardEvent("keydown", {
        key: "ArrowUp",
        bubbles: true,
      });
      window.dispatchEvent(keyDownEvent);
    });

    // Wait a bit for any potential panning
    vi.advanceTimersByTime(100);

    expect(mockPanBy).not.toHaveBeenCalled();
  });

  it("should start panning when arrow key is pressed and map container is focused", () => {
    renderHook(() => useMapKeyboardPanning(mapRef, containerRef, true));

    // Focus the map container first
    act(() => {
      if (containerRef.current) {
        containerRef.current.focus();
      }
      // Ensure document.activeElement is set
      Object.defineProperty(document, "activeElement", {
        value: containerRef.current,
        writable: true,
        configurable: true,
      });
    });

    // Press arrow key - this should schedule requestAnimationFrame
    act(() => {
      const keyDownEvent = new KeyboardEvent("keydown", {
        key: "ArrowUp",
        bubbles: true,
        cancelable: true,
      });
      window.dispatchEvent(keyDownEvent);
    });

    // Execute the scheduled animation frame
    // Note: requestAnimationFrame in tests needs special handling
    // Advance timers to trigger the first animation frame
    act(() => {
      // Advance enough for requestAnimationFrame to execute (typically 16ms)
      vi.advanceTimersByTime(20);
    });

    // Check if panBy was called (it should be if the animation frame executed)
    // If not, the test setup might need adjustment, but the hook logic is correct
    // The key is that the event was registered and the animation frame was scheduled
    expect(mockPanBy).toHaveBeenCalled();
  });

  it("should not pan when input field is focused", () => {
    renderHook(() => useMapKeyboardPanning(mapRef, containerRef, true));

    // Create and focus an input field
    const input = document.createElement("input");
    document.body.appendChild(input);
    act(() => {
      input.focus();
    });

    // Press arrow key
    act(() => {
      const keyDownEvent = new KeyboardEvent("keydown", {
        key: "ArrowUp",
        bubbles: true,
      });
      window.dispatchEvent(keyDownEvent);
    });

    // Wait for animation frame
    act(() => {
      vi.advanceTimersByTime(100);
    });

    // Should not pan when input is focused
    expect(mockPanBy).not.toHaveBeenCalled();

    document.body.removeChild(input);
  });

  it("should not pan when marker is focused", () => {
    renderHook(() => useMapKeyboardPanning(mapRef, containerRef, true));

    // Create and focus a marker element
    const marker = document.createElement("button");
    marker.setAttribute("data-marker-id", "marker-test-1");
    document.body.appendChild(marker);
    act(() => {
      marker.focus();
    });

    // Press arrow key
    act(() => {
      const keyDownEvent = new KeyboardEvent("keydown", {
        key: "ArrowUp",
        bubbles: true,
      });
      window.dispatchEvent(keyDownEvent);
    });

    // Wait for animation frame
    act(() => {
      vi.advanceTimersByTime(100);
    });

    // Should not pan when marker is focused
    expect(mockPanBy).not.toHaveBeenCalled();

    document.body.removeChild(marker);
  });

  it("should stop panning when key is released", () => {
    renderHook(() => useMapKeyboardPanning(mapRef, containerRef, true));

    // Focus container
    act(() => {
      containerRef.current?.focus();
    });

    // Press arrow key
    act(() => {
      const keyDownEvent = new KeyboardEvent("keydown", {
        key: "ArrowUp",
        bubbles: true,
      });
      window.dispatchEvent(keyDownEvent);
    });

    // Release key
    act(() => {
      const keyUpEvent = new KeyboardEvent("keyup", {
        key: "ArrowUp",
        bubbles: true,
      });
      window.dispatchEvent(keyUpEvent);
    });

    mockPanBy.mockClear();

    // Wait a bit more
    act(() => {
      vi.advanceTimersByTime(100);
    });

    // Should have stopped panning
    expect(mockPanBy).not.toHaveBeenCalled();
  });

  it("should clean up event listeners on unmount", () => {
    const { unmount } = renderHook(() =>
      useMapKeyboardPanning(mapRef, containerRef, true)
    );

    // Unmount hook
    unmount();

    // Press key after unmount
    act(() => {
      containerRef.current?.focus();
      const keyDownEvent = new KeyboardEvent("keydown", {
        key: "ArrowUp",
        bubbles: true,
      });
      window.dispatchEvent(keyDownEvent);
    });

    // Should not pan after unmount
    expect(mockPanBy).not.toHaveBeenCalled();
  });

  it("should handle blur event and stop panning", () => {
    renderHook(() => useMapKeyboardPanning(mapRef, containerRef, true));

    // Focus container and start panning
    act(() => {
      containerRef.current?.focus();
      const keyDownEvent = new KeyboardEvent("keydown", {
        key: "ArrowUp",
        bubbles: true,
      });
      window.dispatchEvent(keyDownEvent);
    });

    // Trigger blur
    act(() => {
      const blurEvent = new FocusEvent("blur", { bubbles: true });
      containerRef.current?.dispatchEvent(blurEvent);
    });

    mockPanBy.mockClear();

    // Wait a bit
    act(() => {
      vi.advanceTimersByTime(100);
    });

    // Should have stopped panning
    expect(mockPanBy).not.toHaveBeenCalled();
  });
});
