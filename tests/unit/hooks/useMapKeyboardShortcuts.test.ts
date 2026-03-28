/**
 * Tests for useMapKeyboardShortcuts hook
 *
 * Tests keyboard shortcut functionality for map zoom and reset including:
 * - Ctrl+/Cmd+ zoom in
 * - Ctrl-/Cmd- zoom out
 * - Shift+R reset view
 * - Cmd/Ctrl+Shift+N basemap (night) toggle
 * - Input field exclusion
 * - Map instance availability
 * - Event prevention
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useRef } from "react";
import { MapRef } from "react-map-gl/maplibre";
import { MAP_RESET_CAMERA_EVENT } from "@/constants/map";
import { useMapKeyboardShortcuts } from "@/hooks/map/useMapKeyboardShortcuts";

// Mock logger
vi.mock("@/utils/logger", () => {
  const mockLogger = {
    error: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  };
  return {
    logger: mockLogger,
  };
});

// Import real keyboard utils (not mocked) to test actual behavior
// This ensures range inputs are properly excluded from input field checks

describe("useMapKeyboardShortcuts", () => {
  let mapRef: React.RefObject<MapRef>;
  let containerRef: React.RefObject<HTMLElement>;
  let mockZoomIn: ReturnType<typeof vi.fn>;
  let mockZoomOut: ReturnType<typeof vi.fn>;
  let mockMapInstance: {
    zoomIn: ReturnType<typeof vi.fn>;
    zoomOut: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    // Create ref
    mapRef = { current: null } as React.RefObject<MapRef>;
    containerRef = { current: null } as React.RefObject<HTMLElement>;

    // Mock map methods
    mockZoomIn = vi.fn();
    mockZoomOut = vi.fn();

    mockMapInstance = {
      zoomIn: mockZoomIn,
      zoomOut: mockZoomOut,
    };

    // Mock getMap to return mock instance
    Object.defineProperty(mapRef, "current", {
      writable: true,
      value: {
        getMap: () => mockMapInstance,
      },
    });

    const container = document.createElement("div");
    container.id = "map-container-area";
    container.tabIndex = 0;
    document.body.appendChild(container);
    Object.defineProperty(containerRef, "current", {
      writable: true,
      value: container,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = "";
  });

  it("should zoom in when Ctrl+Plus is pressed", () => {
    renderHook(() => useMapKeyboardShortcuts(mapRef, true));

    const event = new KeyboardEvent("keydown", {
      key: "+",
      code: "Equal",
      ctrlKey: true,
      bubbles: true,
      cancelable: true,
    });

    window.dispatchEvent(event);

    expect(mockZoomIn).toHaveBeenCalledTimes(1);
    expect(mockZoomIn).toHaveBeenCalledWith({ duration: expect.any(Number) });
    expect(mockZoomOut).not.toHaveBeenCalled();
  });

  it("should zoom in when Cmd+Plus is pressed (Mac)", () => {
    renderHook(() => useMapKeyboardShortcuts(mapRef, true));

    const event = new KeyboardEvent("keydown", {
      key: "+",
      code: "Equal",
      metaKey: true,
      bubbles: true,
      cancelable: true,
    });

    window.dispatchEvent(event);

    expect(mockZoomIn).toHaveBeenCalledTimes(1);
    expect(mockZoomOut).not.toHaveBeenCalled();
  });

  it("should zoom in when Ctrl+Equal is pressed", () => {
    renderHook(() => useMapKeyboardShortcuts(mapRef, true));

    const event = new KeyboardEvent("keydown", {
      key: "=",
      code: "Equal",
      ctrlKey: true,
      bubbles: true,
      cancelable: true,
    });

    window.dispatchEvent(event);

    expect(mockZoomIn).toHaveBeenCalledTimes(1);
    expect(mockZoomOut).not.toHaveBeenCalled();
  });

  it("should zoom in when Ctrl+NumpadAdd is pressed", () => {
    renderHook(() => useMapKeyboardShortcuts(mapRef, true));

    const event = new KeyboardEvent("keydown", {
      key: "+",
      code: "NumpadAdd",
      ctrlKey: true,
      bubbles: true,
      cancelable: true,
    });

    window.dispatchEvent(event);

    expect(mockZoomIn).toHaveBeenCalledTimes(1);
    expect(mockZoomOut).not.toHaveBeenCalled();
  });

  it("should zoom out when Ctrl+Minus is pressed", () => {
    renderHook(() => useMapKeyboardShortcuts(mapRef, true));

    const event = new KeyboardEvent("keydown", {
      key: "-",
      code: "Minus",
      ctrlKey: true,
      bubbles: true,
      cancelable: true,
    });

    window.dispatchEvent(event);

    expect(mockZoomOut).toHaveBeenCalledTimes(1);
    expect(mockZoomOut).toHaveBeenCalledWith({ duration: expect.any(Number) });
    expect(mockZoomIn).not.toHaveBeenCalled();
  });

  it("should zoom out when Cmd+Minus is pressed (Mac)", () => {
    renderHook(() => useMapKeyboardShortcuts(mapRef, true));

    const event = new KeyboardEvent("keydown", {
      key: "-",
      code: "Minus",
      metaKey: true,
      bubbles: true,
      cancelable: true,
    });

    window.dispatchEvent(event);

    expect(mockZoomOut).toHaveBeenCalledTimes(1);
    expect(mockZoomIn).not.toHaveBeenCalled();
  });

  it("should zoom out when Ctrl+NumpadSubtract is pressed", () => {
    renderHook(() => useMapKeyboardShortcuts(mapRef, true));

    const event = new KeyboardEvent("keydown", {
      key: "-",
      code: "NumpadSubtract",
      ctrlKey: true,
      bubbles: true,
      cancelable: true,
    });

    window.dispatchEvent(event);

    expect(mockZoomOut).toHaveBeenCalledTimes(1);
    expect(mockZoomIn).not.toHaveBeenCalled();
  });

  it("should not zoom when Ctrl+Plus is pressed in an input field", () => {
    renderHook(() => useMapKeyboardShortcuts(mapRef, true));

    const input = document.createElement("input");
    document.body.appendChild(input);
    input.focus();

    const event = new KeyboardEvent("keydown", {
      key: "+",
      code: "Equal",
      ctrlKey: true,
      bubbles: true,
      cancelable: true,
    });

    Object.defineProperty(event, "target", {
      writable: false,
      value: input,
    });

    window.dispatchEvent(event);

    expect(mockZoomIn).not.toHaveBeenCalled();
    expect(mockZoomOut).not.toHaveBeenCalled();

    document.body.removeChild(input);
  });

  it("should not zoom when Ctrl+Plus is pressed in a textarea", () => {
    renderHook(() => useMapKeyboardShortcuts(mapRef, true));

    const textarea = document.createElement("textarea");
    document.body.appendChild(textarea);
    textarea.focus();

    const event = new KeyboardEvent("keydown", {
      key: "+",
      code: "Equal",
      ctrlKey: true,
      bubbles: true,
      cancelable: true,
    });

    Object.defineProperty(event, "target", {
      writable: false,
      value: textarea,
    });

    window.dispatchEvent(event);

    expect(mockZoomIn).not.toHaveBeenCalled();
    expect(mockZoomOut).not.toHaveBeenCalled();

    document.body.removeChild(textarea);
  });

  it("should zoom when Ctrl+Minus is pressed in a range input (slider)", () => {
    renderHook(() => useMapKeyboardShortcuts(mapRef, true));

    const rangeInput = document.createElement("input");
    rangeInput.type = "range";
    document.body.appendChild(rangeInput);
    rangeInput.focus();

    const event = new KeyboardEvent("keydown", {
      key: "-",
      code: "Minus",
      ctrlKey: true,
      bubbles: true,
      cancelable: true,
    });

    Object.defineProperty(event, "target", {
      writable: false,
      value: rangeInput,
    });

    window.dispatchEvent(event);

    expect(mockZoomOut).toHaveBeenCalledTimes(1);
    expect(mockZoomOut).toHaveBeenCalledWith({ duration: expect.any(Number) });
    expect(mockZoomIn).not.toHaveBeenCalled();

    document.body.removeChild(rangeInput);
  });

  it("should zoom when Ctrl+Plus is pressed in a range input (slider)", () => {
    renderHook(() => useMapKeyboardShortcuts(mapRef, true));

    const rangeInput = document.createElement("input");
    rangeInput.type = "range";
    document.body.appendChild(rangeInput);
    rangeInput.focus();

    const event = new KeyboardEvent("keydown", {
      key: "+",
      code: "Equal",
      ctrlKey: true,
      bubbles: true,
      cancelable: true,
    });

    Object.defineProperty(event, "target", {
      writable: false,
      value: rangeInput,
    });

    const preventDefaultSpy = vi.spyOn(event, "preventDefault");
    const stopPropagationSpy = vi.spyOn(event, "stopPropagation");
    const stopImmediatePropagationSpy = vi.spyOn(
      event,
      "stopImmediatePropagation"
    );

    window.dispatchEvent(event);

    // Browser zoom should be prevented for range inputs (sliders) too
    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(stopPropagationSpy).toHaveBeenCalled();
    expect(stopImmediatePropagationSpy).toHaveBeenCalled();

    expect(mockZoomIn).toHaveBeenCalledTimes(1);
    expect(mockZoomIn).toHaveBeenCalledWith({ duration: expect.any(Number) });
    expect(mockZoomOut).not.toHaveBeenCalled();

    document.body.removeChild(rangeInput);
  });

  it("should not zoom when Ctrl+Plus is pressed and map instance is not available", () => {
    Object.defineProperty(mapRef, "current", {
      writable: true,
      value: null,
    });

    renderHook(() => useMapKeyboardShortcuts(mapRef, true));

    const event = new KeyboardEvent("keydown", {
      key: "+",
      code: "Equal",
      ctrlKey: true,
      bubbles: true,
      cancelable: true,
    });

    const preventDefaultSpy = vi.spyOn(event, "preventDefault");
    const stopPropagationSpy = vi.spyOn(event, "stopPropagation");
    const stopImmediatePropagationSpy = vi.spyOn(
      event,
      "stopImmediatePropagation"
    );

    window.dispatchEvent(event);

    // Browser zoom should still be prevented even if map instance is not available
    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(stopPropagationSpy).toHaveBeenCalled();
    expect(stopImmediatePropagationSpy).toHaveBeenCalled();

    expect(mockZoomIn).not.toHaveBeenCalled();
    expect(mockZoomOut).not.toHaveBeenCalled();
  });

  it("should zoom when plain plus key is pressed", () => {
    renderHook(() => useMapKeyboardShortcuts(mapRef, true));

    const event = new KeyboardEvent("keydown", {
      key: "+",
      code: "Equal",
      bubbles: true,
      cancelable: true,
    });

    window.dispatchEvent(event);

    expect(mockZoomIn).toHaveBeenCalledTimes(1);
    expect(mockZoomOut).not.toHaveBeenCalled();
  });

  it("should prevent default and stop propagation when zooming", () => {
    renderHook(() => useMapKeyboardShortcuts(mapRef, true));

    const event = new KeyboardEvent("keydown", {
      key: "+",
      code: "Equal",
      ctrlKey: true,
      bubbles: true,
      cancelable: true,
    });

    const preventDefaultSpy = vi.spyOn(event, "preventDefault");
    const stopPropagationSpy = vi.spyOn(event, "stopPropagation");
    const stopImmediatePropagationSpy = vi.spyOn(
      event,
      "stopImmediatePropagation"
    );

    window.dispatchEvent(event);

    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(stopPropagationSpy).toHaveBeenCalled();
    expect(stopImmediatePropagationSpy).toHaveBeenCalled();
  });

  it("should zoom in with plus key when map container is focused", () => {
    renderHook(() => useMapKeyboardShortcuts(mapRef, true));

    containerRef.current?.focus();
    const event = new KeyboardEvent("keydown", {
      key: "+",
      code: "Equal",
      bubbles: true,
      cancelable: true,
    });
    Object.defineProperty(event, "target", {
      writable: false,
      value: containerRef.current,
    });

    window.dispatchEvent(event);

    expect(mockZoomIn).toHaveBeenCalledTimes(1);
    expect(mockZoomOut).not.toHaveBeenCalled();
  });

  it("should zoom with plus key even when map is not focused", () => {
    renderHook(() => useMapKeyboardShortcuts(mapRef, true));

    const event = new KeyboardEvent("keydown", {
      key: "+",
      code: "Equal",
      bubbles: true,
      cancelable: true,
    });

    window.dispatchEvent(event);

    expect(mockZoomIn).toHaveBeenCalledTimes(1);
    expect(mockZoomOut).not.toHaveBeenCalled();
  });

  it("dispatches reset map event when Shift+R is pressed", () => {
    const dispatchSpy = vi.spyOn(window, "dispatchEvent");
    renderHook(() => useMapKeyboardShortcuts(mapRef, true));

    const event = new KeyboardEvent("keydown", {
      key: "R",
      code: "KeyR",
      shiftKey: true,
      bubbles: true,
      cancelable: true,
    });

    window.dispatchEvent(event);

    expect(
      dispatchSpy.mock.calls.some(
        args =>
          args[0] instanceof Event && args[0].type === MAP_RESET_CAMERA_EVENT
      )
    ).toBe(true);
    expect(mockZoomIn).not.toHaveBeenCalled();
    expect(mockZoomOut).not.toHaveBeenCalled();

    dispatchSpy.mockRestore();
  });

  it("dispatches reset when map instance is unavailable", () => {
    Object.defineProperty(mapRef, "current", {
      writable: true,
      value: null,
    });
    const dispatchSpy = vi.spyOn(window, "dispatchEvent");
    renderHook(() => useMapKeyboardShortcuts(mapRef, true));

    window.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "R",
        code: "KeyR",
        shiftKey: true,
        bubbles: true,
        cancelable: true,
      })
    );

    expect(
      dispatchSpy.mock.calls.some(
        args =>
          args[0] instanceof Event && args[0].type === MAP_RESET_CAMERA_EVENT
      )
    ).toBe(true);

    dispatchSpy.mockRestore();
  });

  it("does not dispatch reset when Shift+R is pressed in a text input", () => {
    const dispatchSpy = vi.spyOn(window, "dispatchEvent");
    renderHook(() => useMapKeyboardShortcuts(mapRef, true));

    const input = document.createElement("input");
    document.body.appendChild(input);
    input.focus();

    const event = new KeyboardEvent("keydown", {
      key: "R",
      code: "KeyR",
      shiftKey: true,
      bubbles: true,
      cancelable: true,
    });
    Object.defineProperty(event, "target", { writable: false, value: input });

    window.dispatchEvent(event);

    expect(
      dispatchSpy.mock.calls.some(
        args =>
          args[0] instanceof Event && args[0].type === MAP_RESET_CAMERA_EVENT
      )
    ).toBe(false);

    document.body.removeChild(input);
    dispatchSpy.mockRestore();
  });

  it("calls onToggleBasemapMode when Cmd+Shift+N is pressed", () => {
    const onToggle = vi.fn();
    renderHook(() => useMapKeyboardShortcuts(mapRef, true, 300, onToggle));

    window.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "N",
        code: "KeyN",
        shiftKey: true,
        metaKey: true,
        bubbles: true,
        cancelable: true,
      })
    );

    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(mockZoomIn).not.toHaveBeenCalled();
  });

  it("calls onToggleBasemapMode when Ctrl+Shift+N is pressed", () => {
    const onToggle = vi.fn();
    renderHook(() => useMapKeyboardShortcuts(mapRef, true, 300, onToggle));

    window.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "N",
        code: "KeyN",
        shiftKey: true,
        ctrlKey: true,
        bubbles: true,
        cancelable: true,
      })
    );

    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it("does not call onToggleBasemapMode when Cmd+Shift+N is pressed in a text input", () => {
    const onToggle = vi.fn();
    renderHook(() => useMapKeyboardShortcuts(mapRef, true, 300, onToggle));

    const input = document.createElement("input");
    document.body.appendChild(input);
    input.focus();

    const event = new KeyboardEvent("keydown", {
      key: "N",
      code: "KeyN",
      shiftKey: true,
      metaKey: true,
      bubbles: true,
      cancelable: true,
    });
    Object.defineProperty(event, "target", { writable: false, value: input });

    window.dispatchEvent(event);

    expect(onToggle).not.toHaveBeenCalled();
    document.body.removeChild(input);
  });

  it("should handle errors gracefully", async () => {
    const { logger } = await import("@/utils/logger");
    mockZoomIn.mockImplementation(() => {
      throw new Error("Zoom error");
    });

    renderHook(() => useMapKeyboardShortcuts(mapRef, true));

    const event = new KeyboardEvent("keydown", {
      key: "+",
      code: "Equal",
      ctrlKey: true,
      bubbles: true,
      cancelable: true,
    });

    window.dispatchEvent(event);

    expect(logger.error).toHaveBeenCalledWith(
      "Error handling zoom keyboard shortcut:",
      expect.any(Error)
    );
  });

  it("should clean up event listeners on unmount", () => {
    const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");
    const { unmount } = renderHook(() => useMapKeyboardShortcuts(mapRef, true));

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "keydown",
      expect.any(Function),
      expect.objectContaining({ capture: true, passive: false })
    );
  });
});
