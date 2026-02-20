import { Town } from "@/common/types";

/**
 * Returns a stable, unique id for a town (for React key and data-marker-id).
 * Based on name and coordinates so order-independent and stable across re-sorts.
 */
export const getStableTownMarkerId = (town: Town): string => {
  const lat = Number(town.latitude).toFixed(4);
  const lng = Number(town.longitude).toFixed(4);
  return `${town.name}-${lat}-${lng}`;
};

/**
 * Generates an accessible aria-label for a town marker.
 * Includes town name, population, coordinates, and name variants.
 *
 * @param town - Town object with population and location data
 * @param selectedYear - Selected year for population data
 * @returns Formatted aria-label string
 */
export const generateTownMarkerAriaLabel = (
  town: Town,
  selectedYear: number
): string => {
  const population = town.populationByYear?.[selectedYear] || 0;

  const labelParts = [
    `${town.name}`,
    `Population in ${selectedYear} AD: ${population > 0 ? population.toLocaleString() : "N/A"} people`,
    `Coordinates: ${town.latitude.toFixed(2)} degrees north, ${town.longitude.toFixed(2)} degrees east`,
    town.nameVariants && town.nameVariants.length > 0
      ? `Also known as: ${town.nameVariants.join(", ")}`
      : null,
  ];

  return labelParts.filter(Boolean).join(". ");
};

/**
 * Enables a town marker element to receive focus (sets tabIndex=0).
 *
 * @param element - The marker HTML element
 */
export const enableTownMarkerFocus = (element: HTMLElement): void => {
  element.tabIndex = 0;
};

/**
 * Disables a town marker element from receiving focus (sets tabIndex=-1).
 *
 * @param element - The marker HTML element
 */
export const disableTownMarkerFocus = (element: HTMLElement): void => {
  element.tabIndex = -1;
};
