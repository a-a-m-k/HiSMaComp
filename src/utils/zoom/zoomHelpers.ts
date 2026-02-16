import {
  type DeviceType,
  DEFAULT_SCREEN_DIMENSIONS,
} from "@/constants/breakpoints";
import { COORDINATE_LIMITS } from "@/constants/map";
import { TIMELINE_HEIGHTS } from "@/constants/ui";
import { Theme } from "@mui/material/styles";

export type { DeviceType };

/**
 * UI element dimensions for different screen sizes.
 */
export interface UIElementSizes {
  /** Timeline component height in pixels */
  timeline: number;
  /** Legend component height/width in pixels */
  legend: number;
  /** Bottom spacing in pixels */
  bottomSpacing: number;
}

const UI_SIZES: Record<DeviceType, Omit<UIElementSizes, "bottomSpacing">> = {
  mobile: { timeline: TIMELINE_HEIGHTS.MOBILE, legend: 70 },
  tablet: { timeline: TIMELINE_HEIGHTS.TABLET, legend: 100 },
  desktop: { timeline: TIMELINE_HEIGHTS.DESKTOP, legend: 90 },
  largeDesktop: { timeline: TIMELINE_HEIGHTS.DESKTOP, legend: 90 },
};

/**
 * Validates if a value is a valid finite number.
 *
 * @param n - Value to validate
 * @returns True if value is a valid finite number
 */
export function isValidNumber(n: number): boolean {
  return typeof n === "number" && !isNaN(n) && isFinite(n);
}

/**
 * Validates if a value is a valid positive number (greater than 0).
 *
 * @param n - Value to validate
 * @returns True if value is a valid positive number
 */
export function isValidPositiveNumber(n: number): boolean {
  return isValidNumber(n) && n > 0;
}

/**
 * Validates if coordinates are within valid geographic bounds.
 *
 * @param latitude - Latitude in degrees
 * @param longitude - Longitude in degrees
 * @returns True if coordinates are within valid bounds (-90 to 90 lat, -180 to 180 lng)
 */
export function isValidCoordinate(
  latitude: number,
  longitude: number
): boolean {
  return (
    isValidNumber(latitude) &&
    isValidNumber(longitude) &&
    latitude >= COORDINATE_LIMITS.LATITUDE.min &&
    latitude <= COORDINATE_LIMITS.LATITUDE.max &&
    longitude >= COORDINATE_LIMITS.LONGITUDE.min &&
    longitude <= COORDINATE_LIMITS.LONGITUDE.max
  );
}

/**
 * Interface for town-like objects with coordinate properties.
 * Used for type-safe validation without requiring full Town interface.
 */
interface TownLike {
  latitude?: unknown;
  longitude?: unknown;
}

/**
 * Validates if a town object has valid coordinate properties.
 *
 * @param town - Town object to validate
 * @returns True if town has valid latitude and longitude coordinates
 */
export function isValidTown(town: unknown): town is TownLike & {
  latitude: number;
  longitude: number;
} {
  if (!town || typeof town !== "object") {
    return false;
  }

  const townObj = town as TownLike;
  return (
    typeof townObj.latitude === "number" &&
    typeof townObj.longitude === "number" &&
    isValidCoordinate(townObj.latitude, townObj.longitude)
  );
}

/**
 * Validates and normalizes screen dimensions.
 * Returns default dimensions if invalid values are provided.
 *
 * @param width - Screen width in pixels
 * @param height - Screen height in pixels
 * @returns Validated dimensions object with width and height
 */
export function validateDimensions(
  width: number,
  height: number
): { width: number; height: number } {
  return {
    width: isValidPositiveNumber(width)
      ? width
      : DEFAULT_SCREEN_DIMENSIONS.width,
    height: isValidPositiveNumber(height)
      ? height
      : DEFAULT_SCREEN_DIMENSIONS.height,
  };
}

/**
 * Gets UI element sizes (timeline, legend, spacing) for a specific device type.
 *
 * @param deviceType - Device category (mobile, tablet, desktop, largeDesktop)
 * @param theme - MUI theme object for spacing calculations
 * @returns UIElementSizes object with timeline, legend, and bottomSpacing values
 */
export function getUIElementSizes(
  deviceType: DeviceType,
  theme: Theme
): UIElementSizes {
  const baseSizes = UI_SIZES[deviceType];
  const spacingValue =
    deviceType === "mobile" ? theme.spacing(1) : theme.spacing(5);
  const bottomSpacing =
    typeof spacingValue === "string" ? parseFloat(spacingValue) : spacingValue;

  return {
    ...baseSizes,
    bottomSpacing,
  };
}

/**
 * Converts latitude to Web Mercator projection Y coordinate.
 * Used for accurate geographic distance calculations in zoom computations.
 *
 * @param lat - Latitude in degrees (-90 to 90)
 * @returns Mercator Y coordinate (in radians)
 *
 * @example
 * ```ts
 * const mercatorY = mercatorLatitude(45);
 * // Returns Mercator projection value for 45 degrees latitude
 * ```
 */
export function mercatorLatitude(lat: number): number {
  const sin = Math.sin((lat * Math.PI) / 180);
  return Math.log((1 + sin) / (1 - sin)) / 2;
}

/**
 * Calculates zoom level using logarithmic scale based on map and world pixel dimensions.
 * Formula: log2(mapPixels / worldPixels / fraction)
 *
 * @param mapPx - Map viewport size in pixels
 * @param worldPx - World tile size in pixels (typically 256)
 * @param fraction - Fraction of world covered (0-1)
 * @returns Zoom level (can be negative or positive)
 *
 * @example
 * ```ts
 * const zoom = calculateZoomLevel(800, 256, 0.5);
 * // Returns zoom level for 800px map showing 50% of world width
 * ```
 */
export function calculateZoomLevel(
  mapPx: number,
  worldPx: number,
  fraction: number
): number {
  return Math.log(mapPx / worldPx / fraction) / Math.LN2;
}
