/**
 * Utility functions for keyboard event handling and input field detection.
 */

/**
 * Checks if the target element is an input field where keyboard shortcuts should be disabled.
 * Prevents shortcuts from triggering when user is typing in input fields, textareas, or contentEditable elements.
 *
 * @param target - The HTML element that received the keyboard event
 * @returns True if the target is an input field, false otherwise
 */
export const isInputField = (target: HTMLElement): boolean => {
  return (
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.isContentEditable
  );
};
