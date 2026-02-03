import { Theme } from "@mui/material/styles";
import { Town } from "../../src/common/types";

/**
 * Shared mock theme for testing and scripts.
 * Contains only the properties that our utility functions actually use:
 * - breakpoints.values (for device type detection)
 * - spacing (for UI size calculations)
 *
 * Single type assertion here keeps all other files clean.
 */
export const mockTheme: Theme = {
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
  spacing: (value: number) => value * 8, // 8px base unit
} as unknown as Theme;

/**
 * Mock towns data for utility function tests.
 * Includes Paris, London, and Rome for bounds calculations.
 */
export const mockTowns: Town[] = [
  {
    name: "Paris",
    latitude: 48.8566,
    longitude: 2.3522,
    populationByYear: { "1000": 20000 },
  },
  {
    name: "London",
    latitude: 51.5074,
    longitude: -0.1278,
    populationByYear: { "1000": 15000 },
  },
  {
    name: "Rome",
    latitude: 41.9028,
    longitude: 12.4964,
    populationByYear: { "1000": 25000 },
  },
];

/**
 * Minimal mock towns for context and component tests.
 * Includes Paris (data for 800, 1000, 1200) and London (data for 1000, 1200).
 */
export const mockTownsMinimal: Town[] = [
  {
    name: "Paris",
    latitude: 48.8566,
    longitude: 2.3522,
    populationByYear: { "800": 10000, "1000": 20000, "1200": 30000 },
  },
  {
    name: "London",
    latitude: 51.5074,
    longitude: -0.1278,
    populationByYear: { "1000": 15000, "1200": 25000 },
  },
];

/**
 * Helper to safely filter out undefined values from an array.
 * Useful for filtering results from Array.find() operations.
 */
export function filterDefined<T>(items: (T | undefined)[]): T[] {
  return items.filter((item): item is T => item !== undefined);
}
