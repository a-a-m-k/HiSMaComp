import { SpacingValue, Town, PopulationStats } from "../common/types";
import {
  WORLD_DIMENSIONS,
  MAX_ZOOM_LEVEL,
  DEGREES_IN_CIRCLE,
  DEFAULT_YEAR,
} from "@/constants";

/**
 * Calculates the bounding box for a set of towns.
 * @param towns - Array of Town objects.
 * @param year - Year to check for valid population data (defaults to 1000).
 * @returns Bounding box with min/max latitude and longitude.
 * @throws Error if towns array is invalid or contains invalid coordinates
 */
export function getBounds(towns: Town[], year: number = DEFAULT_YEAR) {
  if (!Array.isArray(towns)) {
    throw new Error("Towns must be an array");
  }

  if (typeof year !== "number" || isNaN(year) || year < 0) {
    throw new Error("Year must be a valid positive number");
  }

  if (towns.length === 0) {
    return { minLat: 0, maxLat: 0, minLng: 0, maxLng: 0 };
  }

  // Validate town data
  const invalidTowns = towns.filter(
    town =>
      !town ||
      typeof town.latitude !== "number" ||
      typeof town.longitude !== "number" ||
      isNaN(town.latitude) ||
      isNaN(town.longitude) ||
      town.latitude < -90 ||
      town.latitude > 90 ||
      town.longitude < -180 ||
      town.longitude > 180
  );

  if (invalidTowns.length > 0) {
    console.warn(`Found ${invalidTowns.length} towns with invalid coordinates`);
  }

  // Filter out towns with null population for the specified year
  const validTowns = towns.filter(
    town =>
      town && town.populationByYear && town.populationByYear[year] !== null
  );

  // Use all towns if no valid towns for this year
  const targetTowns =
    validTowns.length > 0
      ? validTowns
      : towns.filter(town => town && town.latitude && town.longitude);

  if (targetTowns.length === 0) {
    return { minLat: 0, maxLat: 0, minLng: 0, maxLng: 0 };
  }

  // Single pass to find min/max - much more efficient than sorting
  let minLat = targetTowns[0].latitude;
  let maxLat = targetTowns[0].latitude;
  let minLng = targetTowns[0].longitude;
  let maxLng = targetTowns[0].longitude;

  for (let i = 1; i < targetTowns.length; i++) {
    const town = targetTowns[i];
    if (
      town &&
      typeof town.latitude === "number" &&
      typeof town.longitude === "number"
    ) {
      minLat = Math.min(minLat, town.latitude);
      maxLat = Math.max(maxLat, town.latitude);
      minLng = Math.min(minLng, town.longitude);
      maxLng = Math.max(maxLng, town.longitude);
    }
  }

  return { minLat, maxLat, minLng, maxLng };
}

/**
 * Computes the geographic center of a set of towns.
 * @param towns - Array of Town objects.
 * @param year - Year to check for valid population data (defaults to 1000).
 * @returns Center coordinates (latitude, longitude).
 */
export function getCenter(towns: Town[], year: number = DEFAULT_YEAR) {
  const { minLat, maxLat, minLng, maxLng } = getBounds(towns, year);
  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
  };
}

/**
 * Calculates the optimal zoom level to fit all towns within the map viewport.
 * @param towns - Array of Town objects.
 * @param mapWidth - Map width in pixels.
 * @param mapHeight - Map height in pixels.
 * @returns Calculated zoom level.
 */
export function getFitZoom(
  towns: Town[],
  mapWidth: number = 800,
  mapHeight: number = 600
): number {
  if (towns.length < 2) return 4;

  const { minLat, maxLat, minLng, maxLng } = getBounds(towns);
  const WORLD_DIM = WORLD_DIMENSIONS;
  const ZOOM_MAX = MAX_ZOOM_LEVEL;

  const latRad = (lat: number) => {
    const sin = Math.sin((lat * Math.PI) / 180);
    return Math.log((1 + sin) / (1 - sin)) / 2;
  };

  const zoom = (mapPx: number, worldPx: number, fraction: number) =>
    Math.floor(Math.log(mapPx / worldPx / fraction) / Math.LN2);

  const latFraction = (latRad(maxLat) - latRad(minLat)) / Math.PI;
  const lngDiff = maxLng - minLng;
  const lngFraction =
    (lngDiff < 0 ? lngDiff + DEGREES_IN_CIRCLE : lngDiff) / DEGREES_IN_CIRCLE;

  const latZoom = zoom(mapHeight, WORLD_DIM.height, latFraction);
  const lngZoom = zoom(mapWidth, WORLD_DIM.width, lngFraction);

  return Math.min(latZoom, lngZoom, ZOOM_MAX);
}

export function townsToGeoJSON(localities: Town[]): GeoJSON.FeatureCollection {
  if (!Array.isArray(localities)) {
    throw new Error("Localities must be an array");
  }

  const validTowns = localities.filter(
    town =>
      town &&
      town.name &&
      typeof town.latitude === "number" &&
      typeof town.longitude === "number" &&
      !isNaN(town.latitude) &&
      !isNaN(town.longitude) &&
      town.latitude >= -90 &&
      town.latitude <= 90 &&
      town.longitude >= -180 &&
      town.longitude <= 180
  );

  if (validTowns.length !== localities.length) {
    console.warn(
      `Filtered out ${localities.length - validTowns.length} invalid towns from GeoJSON conversion`
    );
  }

  return {
    type: "FeatureCollection",
    features: validTowns.map(town => ({
      id: town.name,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [town.longitude, town.latitude],
      },
      properties: {
        ...town,
      },
    })),
  };
}

/**
 * Filters towns by year, returning only towns with valid population data for that year.
 * @param towns - Array of Town objects.
 * @param year - Year to filter by.
 * @returns Filtered array of towns with valid population data for the specified year.
 * @throws Error if towns array is invalid or year is invalid
 */
export function filterTownsByYear(towns: Town[], year: number): Town[] {
  if (!Array.isArray(towns)) {
    throw new Error("Towns must be an array");
  }

  if (typeof year !== "number" || isNaN(year) || year < 0) {
    throw new Error("Year must be a valid positive number");
  }

  return towns.filter(
    town =>
      town &&
      town.populationByYear &&
      typeof town.populationByYear[year] === "number" &&
      !isNaN(town.populationByYear[year]) &&
      town.populationByYear[year] > 0
  );
}

/**
 * Calculates population statistics for a set of towns in a given year.
 * @param towns - Array of Town objects.
 * @param year - Year to calculate statistics for.
 * @returns Population statistics object with total, min, max, average, and median.
 * @throws Error if towns array is invalid or year is invalid
 */
export function getPopulationStats(
  towns: Town[],
  year: number
): PopulationStats {
  if (!Array.isArray(towns)) {
    throw new Error("Towns must be an array");
  }

  if (typeof year !== "number" || isNaN(year) || year < 0) {
    throw new Error("Year must be a valid positive number");
  }

  const populations = towns
    .filter(town => town && town.populationByYear)
    .map(town => town.populationByYear[year])
    .filter(
      pop =>
        pop !== null &&
        pop !== undefined &&
        typeof pop === "number" &&
        !isNaN(pop)
    ) as number[];

  if (populations.length === 0) {
    return { total: 0, min: 0, max: 0, average: 0, median: 0 };
  }

  const sortedPopulations = [...populations].sort((a, b) => a - b);

  return {
    total: populations.length,
    min: Math.min(...populations),
    max: Math.max(...populations),
    average:
      populations.reduce((sum, pop) => sum + pop, 0) / populations.length,
    median: sortedPopulations[Math.floor(sortedPopulations.length / 2)],
  };
}

/**
 * Extracts the numeric value and unit from a CSS spacing string.
 **/
export function extractSpacingValue(spacing: string): SpacingValue {
  const regex = /^(\d+(\.\d+)?)(px|rem|em)$/;
  const match = spacing.match(regex);
  if (match) {
    return {
      value: Number(match[1]),
      unit: match[3],
    };
  }
  return { value: 0, unit: "" };
}

/**
 * Calculates the minWidth CSS string based on app's min width and theme spacing.
 * Handles px, rem, and em units
 *
 * @param appMinWidthPx - Your app's minimum width in px
 * @param spacing - Theme spacing string (e.g., "16px", "2rem", "1.5em")
 * @param pxPerRemOrEm - The base px value for 1rem/1em. Defaults to 16.
 * @returns minWidth string suitable for CSS (e.g., "304px", "18rem")
 */
export function calculateMinWidth(
  appMinWidthPx: number,
  spacing: string,
  pxPerRemOrEm: number = 16
): string {
  const { value: spacingValue, unit } = extractSpacingValue(spacing);

  if (unit === "px") {
    return `${appMinWidthPx - spacingValue}px`;
  } else if (unit === "rem") {
    const appMinWidthRem = appMinWidthPx / pxPerRemOrEm;
    return `${appMinWidthRem - spacingValue}rem`;
  } else if (unit === "em") {
    const appMinWidthEm = appMinWidthPx / pxPerRemOrEm;
    return `${appMinWidthEm - spacingValue}em`;
  } else {
    return spacing;
  }
}
