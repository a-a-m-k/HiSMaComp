import { useEffect, useState } from "react";

const TOGGLE_KEY = "P";
const TOGGLE_MODIFIERS = { ctrl: true, shift: true };

/**
 * Toggles visibility on Ctrl+Shift+P. Used by PerformanceMonitor.
 */
export function useMonitorShortcut(): boolean {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.ctrlKey === TOGGLE_MODIFIERS.ctrl &&
        e.shiftKey === TOGGLE_MODIFIERS.shift &&
        e.key === TOGGLE_KEY
      ) {
        setIsVisible(prev => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return isVisible;
}
