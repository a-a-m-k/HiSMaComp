/**
 * Tests for useMarkerKeyboardNavigation hook
 *
 * Tests marker keyboard navigation including:
 * - Arrow key navigation between markers
 * - Home/End shortcuts
 * - Focus change callbacks
 * - Cache updates
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useMarkerKeyboardNavigation } from "@/hooks/map/useMarkerKeyboardNavigation";
import React from "react";

// Mock logger
vi.mock("@/utils/logger", () => ({
  logger: {
    error: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
}));

// Mock utils/markers
vi.mock("@/utils/markers", () => ({
  enableTownMarkerFocus: vi.fn((el: HTMLElement) => {
    el.tabIndex = 0;
  }),
}));

describe("useMarkerKeyboardNavigation", () => {
  let onFocusChange: ReturnType<typeof vi.fn>;
  let mockMarkers: HTMLElement[];

  beforeEach(() => {
    onFocusChange = vi.fn();
    mockMarkers = [];

    // Create mock marker elements
    for (let i = 0; i < 5; i++) {
      const marker = document.createElement("button");
      marker.setAttribute("data-marker-id", `marker-${i}`);
      marker.tabIndex = -1;
      document.body.appendChild(marker);
      mockMarkers.push(marker);
    }
  });

  afterEach(() => {
    mockMarkers.forEach(marker => {
      if (marker.parentNode) {
        marker.parentNode.removeChild(marker);
      }
    });
    vi.clearAllMocks();
  });

  it("should call onFocusChange when navigating with keyboard", () => {
    const { result } = renderHook(() =>
      useMarkerKeyboardNavigation(onFocusChange)
    );

    // Focus first marker manually (this doesn't trigger onFocusChange)
    act(() => {
      mockMarkers[0].focus();
    });

    // onFocusChange is only called during keyboard navigation, not manual focus
    expect(onFocusChange).not.toHaveBeenCalled();

    // Now simulate keyboard navigation
    const handleKeyDown = result.current;
    act(() => {
      const keyDownEvent = {
        key: "ArrowDown",
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      } as unknown as React.KeyboardEvent;

      handleKeyDown(keyDownEvent, `marker-0`);
    });

    // Now onFocusChange should be called
    expect(onFocusChange).toHaveBeenCalled();
  });

  it("should handle arrow key navigation", () => {
    const { result } = renderHook(() =>
      useMarkerKeyboardNavigation(onFocusChange)
    );

    // Focus first marker
    act(() => {
      mockMarkers[0].focus();
    });

    // Simulate arrow down key
    const handleKeyDown = result.current;
    act(() => {
      const keyDownEvent = {
        key: "ArrowDown",
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      } as unknown as React.KeyboardEvent;

      handleKeyDown(keyDownEvent, `marker-0`);
    });

    // Should navigate to next marker
    expect(onFocusChange).toHaveBeenCalled();
  });

  it("should handle Home key to jump to first marker", () => {
    const { result } = renderHook(() =>
      useMarkerKeyboardNavigation(onFocusChange)
    );

    // Focus middle marker
    act(() => {
      mockMarkers[2].focus();
    });

    const handleKeyDown = result.current;
    act(() => {
      const keyDownEvent = {
        key: "Home",
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      } as unknown as React.KeyboardEvent;

      handleKeyDown(keyDownEvent, `marker-2`);
    });

    // Should navigate to first marker
    expect(onFocusChange).toHaveBeenCalledWith(`marker-0`);
  });

  it("should handle End key to jump to last marker", () => {
    const { result } = renderHook(() =>
      useMarkerKeyboardNavigation(onFocusChange)
    );

    // Focus first marker
    act(() => {
      mockMarkers[0].focus();
    });

    const handleKeyDown = result.current;
    act(() => {
      const keyDownEvent = {
        key: "End",
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      } as unknown as React.KeyboardEvent;

      handleKeyDown(keyDownEvent, `marker-0`);
    });

    // Should navigate to last marker
    const lastMarkerId = `marker-${mockMarkers.length - 1}`;
    expect(onFocusChange).toHaveBeenCalledWith(lastMarkerId);
  });

  it("should ignore non-navigation keys", () => {
    const { result } = renderHook(() =>
      useMarkerKeyboardNavigation(onFocusChange)
    );

    onFocusChange.mockClear();

    const handleKeyDown = result.current;
    act(() => {
      const keyDownEvent = {
        key: "Enter",
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      } as unknown as React.KeyboardEvent;

      handleKeyDown(keyDownEvent, `marker-0`);
    });

    // Should not navigate for non-navigation keys
    expect(onFocusChange).not.toHaveBeenCalled();
  });

  it("should update marker cache when needed", () => {
    const { result } = renderHook(() =>
      useMarkerKeyboardNavigation(onFocusChange)
    );

    // Initial state should work with existing markers
    const handleKeyDown = result.current;
    act(() => {
      const keyDownEvent = {
        key: "ArrowDown",
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      } as unknown as React.KeyboardEvent;

      handleKeyDown(keyDownEvent, `marker-0`);
    });

    // Cache should be updated and navigation should work
    expect(onFocusChange).toHaveBeenCalled();
  });
});
