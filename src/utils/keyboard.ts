/**
 * Utility functions for keyboard event handling and input field detection.
 */

import type { MouseEvent as ReactMouseEvent } from "react";

/**
 * Checks if the target element is an input field where keyboard shortcuts should be disabled.
 * Prevents shortcuts from triggering when user is typing in input fields, textareas, or contentEditable elements.
 * Excludes range inputs (sliders) to allow keyboard shortcuts to work with interactive controls.
 *
 * @param target - The HTML element that received the keyboard event
 * @returns True if the target is a text input field, false otherwise
 */
export const isInputField = (target: HTMLElement | null): boolean => {
  if (!target) return false;

  if (target.tagName === "INPUT") {
    const inputType = (target as HTMLInputElement).type;
    return inputType !== "range";
  }

  return target.tagName === "TEXTAREA" || target.isContentEditable === true;
};

/**
 * Use as `onMouseDown` on icon buttons so primary clicks do not move focus to the
 * control (avoids sticky hover/focus tooltip and pressed styling after mouse use).
 * Keyboard users still Tab to the control and activate with Enter or Space.
 */
export function preventFocusOnMouseDown(e: ReactMouseEvent<HTMLElement>): void {
  if (e.button === 0) {
    e.preventDefault();
  }
}
