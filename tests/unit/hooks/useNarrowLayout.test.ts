import { afterEach, describe, expect, it } from "vitest";
import { renderHook } from "@testing-library/react";
import { useNarrowLayout } from "@/hooks/ui/useNarrowLayout";
import {
  NARROW_LAYOUT_ENTER_PX,
  NARROW_LAYOUT_LEAVE_PX,
} from "@/constants/breakpoints";

describe("useNarrowLayout", () => {
  afterEach(() => {
    document.body.removeAttribute("data-narrow-layout");
  });

  it("returns true when rawScreenWidth <= NARROW_LAYOUT_ENTER_PX", () => {
    const { result } = renderHook(() => useNarrowLayout(279));
    expect(result.current).toBe(true);
    expect(document.body.getAttribute("data-narrow-layout")).toBe("true");
  });

  it("returns true when rawScreenWidth equals NARROW_LAYOUT_ENTER_PX", () => {
    const { result } = renderHook(() =>
      useNarrowLayout(NARROW_LAYOUT_ENTER_PX)
    );
    expect(result.current).toBe(true);
    expect(document.body.getAttribute("data-narrow-layout")).toBe("true");
  });

  it("returns false when rawScreenWidth >= NARROW_LAYOUT_LEAVE_PX", () => {
    const { result } = renderHook(() => useNarrowLayout(300));
    expect(result.current).toBe(false);
    expect(document.body.getAttribute("data-narrow-layout")).toBeNull();
  });

  it("returns false when rawScreenWidth well above leave threshold", () => {
    const { result } = renderHook(() => useNarrowLayout(1024));
    expect(result.current).toBe(false);
    expect(document.body.getAttribute("data-narrow-layout")).toBeNull();
  });

  it("sets body data-narrow-layout to true only when narrow", () => {
    const { rerender } = renderHook(
      (props: { width: number }) => useNarrowLayout(props.width),
      { initialProps: { width: 400 } }
    );
    expect(document.body.getAttribute("data-narrow-layout")).toBeNull();

    rerender({ width: NARROW_LAYOUT_ENTER_PX });
    expect(document.body.getAttribute("data-narrow-layout")).toBe("true");

    rerender({ width: NARROW_LAYOUT_LEAVE_PX });
    expect(document.body.getAttribute("data-narrow-layout")).toBeNull();
  });

  it("applies hysteresis: enter at 280, leave at 300", () => {
    const { result, rerender } = renderHook(
      (props: { width: number }) => useNarrowLayout(props.width),
      { initialProps: { width: 350 } }
    );
    expect(result.current).toBe(false);

    rerender({ width: NARROW_LAYOUT_ENTER_PX });
    expect(result.current).toBe(true);

    rerender({ width: NARROW_LAYOUT_LEAVE_PX });
    expect(result.current).toBe(false);
  });
});
