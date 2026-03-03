import { Town } from "@/common/types";

/** Stable id from name + coords (for React key and data-marker-id). */
export const getStableTownMarkerId = (town: Town): string => {
  const lat = Number(town.latitude).toFixed(4);
  const lng = Number(town.longitude).toFixed(4);
  return `${town.name}-${lat}-${lng}`;
};

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

export const enableTownMarkerFocus = (element: HTMLElement): void => {
  element.tabIndex = 0;
};

export const disableTownMarkerFocus = (element: HTMLElement): void => {
  element.tabIndex = -1;
};
