import { Town } from "@/common/types";
import { logger } from "./logger";
import { isValidTown } from "./zoom/zoomHelpers";

/**
 * Geographic bounds representing a rectangular area on the map.
 */
export interface Bounds {
  /** Minimum latitude (southern boundary) */
  minLat: number;
  /** Maximum latitude (northern boundary) */
  maxLat: number;
  /** Minimum longitude (western boundary) */
  minLng: number;
  /** Maximum longitude (eastern boundary) */
  maxLng: number;
}

/**
 * Geographic center point coordinates.
 */
export interface Center {
  /** Latitude in degrees (-90 to 90) */
  latitude: number;
  /** Longitude in degrees (-180 to 180) */
  longitude: number;
}

function calculateBoundsInternal(towns: Town[]): Bounds {
  let minLat = Number.POSITIVE_INFINITY;
  let maxLat = Number.NEGATIVE_INFINITY;
  let minLng = Number.POSITIVE_INFINITY;
  let maxLng = Number.NEGATIVE_INFINITY;

  for (const town of towns) {
    if (!isValidTown(town)) {
      continue;
    }

    minLat = Math.min(minLat, town.latitude);
    maxLat = Math.max(maxLat, town.latitude);
    minLng = Math.min(minLng, town.longitude);
    maxLng = Math.max(maxLng, town.longitude);
  }

  return {
    minLat: minLat === Number.POSITIVE_INFINITY ? 0 : minLat,
    maxLat: maxLat === Number.NEGATIVE_INFINITY ? 0 : maxLat,
    minLng: minLng === Number.POSITIVE_INFINITY ? 0 : minLng,
    maxLng: maxLng === Number.NEGATIVE_INFINITY ? 0 : maxLng,
  };
}

/**
 * Calculates geographic bounds (min/max lat/lng) from an array of towns.
 * Filters out invalid towns and returns the bounding rectangle.
 *
 * @param towns - Array of town objects with latitude/longitude coordinates
 * @returns Bounds object with minLat, maxLat, minLng, maxLng
 * @throws Error if towns is not an array
 *
 * @example
 * ```ts
 * const bounds = getBounds([
 *   { name: "Paris", latitude: 48.8566, longitude: 2.3522, populationByYear: {} },
 *   { name: "London", latitude: 51.5074, longitude: -0.1278, populationByYear: {} }
 * ]);
 * // Returns: { minLat: 48.8566, maxLat: 51.5074, minLng: -0.1278, maxLng: 2.3522 }
 * ```
 */
export function getBounds(towns: Town[]): Bounds {
  if (!Array.isArray(towns)) {
    throw new Error("Towns must be an array");
  }

  if (towns.length === 0) {
    return { minLat: 0, maxLat: 0, minLng: 0, maxLng: 0 };
  }

  return calculateBoundsInternal(towns);
}

/**
 * Calculates the arithmetic mean center (centroid) of all towns.
 * Computes the average latitude and longitude of all valid towns.
 *
 * @param towns - Array of town objects with latitude/longitude coordinates
 * @returns Center object with latitude and longitude, or {0, 0} if no valid towns
 *
 * @example
 * ```ts
 * const center = calculateAverageCenter([
 *   { name: "A", latitude: 10, longitude: 20, populationByYear: {} },
 *   { name: "B", latitude: 20, longitude: 30, populationByYear: {} }
 * ]);
 * // Returns: { latitude: 15, longitude: 25 }
 * ```
 */
export function calculateAverageCenter(towns: Town[]): Center {
  if (!Array.isArray(towns) || towns.length === 0) {
    return { latitude: 0, longitude: 0 };
  }

  const validTowns = towns.filter(isValidTown);

  if (validTowns.length === 0) {
    return { latitude: 0, longitude: 0 };
  }

  const totalLat = validTowns.reduce((sum, town) => sum + town.latitude, 0);
  const totalLng = validTowns.reduce((sum, town) => sum + town.longitude, 0);

  const centerLat = totalLat / validTowns.length;
  const centerLng = totalLng / validTowns.length;

  if (isNaN(centerLat) || isNaN(centerLng)) {
    logger.warn("Center calculation resulted in NaN:", {
      centerLat,
      centerLng,
      validTowns: validTowns.length,
    });
    return { latitude: 0, longitude: 0 };
  }

  return {
    latitude: centerLat,
    longitude: centerLng,
  };
}

/**
 * Calculates the center point of the bounding box (geometric center of bounds).
 * Returns the midpoint between min/max latitude and longitude.
 *
 * @param towns - Array of town objects with latitude/longitude coordinates
 * @returns Center object with latitude and longitude at the bounds midpoint
 *
 * @example
 * ```ts
 * const center = calculateBoundsCenter([
 *   { name: "A", latitude: 10, longitude: 20, populationByYear: {} },
 *   { name: "B", latitude: 30, longitude: 40, populationByYear: {} }
 * ]);
 * // Returns: { latitude: 20, longitude: 30 } (midpoint of bounds)
 * ```
 */
export function calculateBoundsCenter(towns: Town[]): Center {
  if (!Array.isArray(towns) || towns.length === 0) {
    return { latitude: 0, longitude: 0 };
  }

  const bounds = getBounds(towns);

  const centerLat = (bounds.minLat + bounds.maxLat) / 2;
  const centerLng = (bounds.minLng + bounds.maxLng) / 2;

  return {
    latitude: centerLat,
    longitude: centerLng,
  };
}
