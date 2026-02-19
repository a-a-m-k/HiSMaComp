import { useState, useEffect } from "react";
import {
  NARROW_LAYOUT_ENTER_PX,
  NARROW_LAYOUT_LEAVE_PX,
} from "@/constants/breakpoints";

const BODY_ATTR = "data-narrow-layout" as const;

/**
 * Returns whether the narrow layout is active (legend/timeline in flow, fixed 300px width)
 * with hysteresis: enter at ≤ NARROW_LAYOUT_ENTER_PX, leave at ≥ NARROW_LAYOUT_LEAVE_PX
 * so the layout doesn't flip during resize. Also sets document.body[data-narrow-layout]
 * for CSS (cleaned up on unmount).
 */
export function useNarrowLayout(rawScreenWidth: number): boolean {
  const [narrowLayout, setNarrowLayout] = useState(
    () => rawScreenWidth <= NARROW_LAYOUT_ENTER_PX
  );

  useEffect(() => {
    if (rawScreenWidth <= NARROW_LAYOUT_ENTER_PX) setNarrowLayout(true);
    else if (rawScreenWidth >= NARROW_LAYOUT_LEAVE_PX) setNarrowLayout(false);
  }, [rawScreenWidth]);

  useEffect(() => {
    if (narrowLayout) {
      document.body.setAttribute(BODY_ATTR, "true");
    } else {
      document.body.removeAttribute(BODY_ATTR);
    }
    return () => document.body.removeAttribute(BODY_ATTR);
  }, [narrowLayout]);

  return narrowLayout;
}
