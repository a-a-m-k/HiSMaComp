/**
 * Unified accessibility utilities
 * Provides simple, reusable functions for common accessibility patterns
 */

let politeRegion: HTMLDivElement | null = null;
let assertiveRegion: HTMLDivElement | null = null;

const createRegion = (level: "polite" | "assertive"): HTMLDivElement => {
  const id = `aria-live-${level}`;
  let region = document.getElementById(id) as HTMLDivElement;

  if (!region) {
    region = document.createElement("div");
    region.id = id;
    region.setAttribute("aria-live", level);
    region.setAttribute("aria-atomic", "true");
    region.className = "sr-only";
    document.body.appendChild(region);
  }

  return region;
};

/**
 * Announce message to screen readers
 * ARIA live regions are created lazily on first use
 */
export const announce = (
  message: string,
  level: "polite" | "assertive" = "polite"
) => {
  const region =
    level === "polite"
      ? (politeRegion ||= createRegion("polite"))
      : (assertiveRegion ||= createRegion("assertive"));

  region.textContent = "";
  requestAnimationFrame(() => {
    region.textContent = message;
  });
};
