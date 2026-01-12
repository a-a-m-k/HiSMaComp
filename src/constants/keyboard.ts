/**
 * Keyboard navigation keys for map markers and other interactive elements.
 * Used for arrow key navigation, Home/End shortcuts, etc.
 */
export const KEYBOARD_NAVIGATION_KEYS = [
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "Home",
  "End",
] as const;

export type KeyboardNavigationKey = (typeof KEYBOARD_NAVIGATION_KEYS)[number];

/**
 * Zoom animation duration in milliseconds.
 * Used for smooth zoom transitions when using keyboard shortcuts.
 */
export const ZOOM_ANIMATION_DURATION_MS = 300;

/**
 * Timeout delay for MutationObserver setup in milliseconds.
 * Allows DOM to settle before querying elements.
 */
export const DOM_SETTLE_TIMEOUT_MS = 100;

/**
 * Marker visual styling constants.
 */
export const MARKER_STYLES = {
  FOCUSED_SCALE: 1.2,
  HOVERED_SCALE: 1.1,
  LABEL_OFFSET: 4,
  BORDER_WIDTH: 2,
  MIN_SIZE: 10,
} as const;
