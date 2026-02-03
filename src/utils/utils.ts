import { Theme } from "@mui/material/styles";

import { Town } from "@/common/types";
import { WORLD_DIMENSIONS, DEGREES_IN_CIRCLE } from "@/constants";
import { LEGEND_WIDTH_CALCULATIONS } from "@/constants/ui";
import {
  validateDimensions,
  getUIElementSizes,
  mercatorLatitude,
  calculateZoomLevel,
  isValidNumber,
  isValidTown,
  type DeviceType,
} from "./zoom/zoomHelpers";
import { getDeviceType } from "@/constants/breakpoints";
import { logger } from "./logger";

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
 * Effective map area dimensions after accounting for UI elements.
 */
export interface MapArea {
  /** Effective map width in pixels (screen width minus UI elements) */
  effectiveWidth: number;
  /** Effective map height in pixels (screen height minus UI elements) */
  effectiveHeight: number;
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

const MAP_AREA_MULTIPLIERS = {
  mobile: { width: 0.9, height: 0.8 },
  tablet: { width: 0.9, height: 0.9 },
  desktop: { width: 0.8, height: 0.8 },
  largeDesktop: { width: 0.9, height: 0.9 },
} as const;

const MIN_MAP_DIMENSIONS = { width: 200, height: 200 } as const;
const FALLBACK_MAP_DIMENSIONS = { width: 0.8, height: 0.8 } as const;

const PADDING_BOUNDS = {
  min: 0.1,
  max: 0.7,
  default: 0.25,
} as const;

const EXTREME_THRESHOLD_PERCENTILES = {
  north: 0.85,
  south: 0.15,
  east: 0.85,
  west: 0.15,
} as const;

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

/**
 * Calculates optimal padding percentage for map bounds based on device type and town distribution.
 * Adjusts padding dynamically based on geographic span and extreme locations (north/south/east/west).
 *
 * @param towns - Array of town objects with latitude/longitude coordinates
 * @param deviceType - Device category (mobile, tablet, desktop, largeDesktop). Defaults to "mobile"
 * @returns Padding percentage value between 0.1 and 0.7
 *
 * @example
 * ```ts
 * const padding = calculateOptimalPadding(towns, 'desktop');
 * // Returns: 0.26 (26% padding for desktop)
 * ```
 */
export function calculateOptimalPadding(
  towns: Town[],
  deviceType: DeviceType = "mobile"
): number {
  if (!Array.isArray(towns) || towns.length === 0) {
    return PADDING_BOUNDS.default;
  }

  const bounds = getBounds(towns);

  const latSpan = bounds.maxLat - bounds.minLat;
  const lngSpan = bounds.maxLng - bounds.minLng;
  const maxSpan = Math.max(latSpan, lngSpan);

  const basePadding: Record<DeviceType, number> = {
    mobile: 0.35,
    tablet: 0.24,
    desktop: 0.26,
    largeDesktop: 0.14,
  };

  const extremeThresholds = {
    north: bounds.minLat + latSpan * EXTREME_THRESHOLD_PERCENTILES.north,
    south: bounds.minLat + latSpan * EXTREME_THRESHOLD_PERCENTILES.south,
    east: bounds.minLng + lngSpan * EXTREME_THRESHOLD_PERCENTILES.east,
    west: bounds.minLng + lngSpan * EXTREME_THRESHOLD_PERCENTILES.west,
  };

  const hasExtremeNorth = bounds.maxLat > extremeThresholds.north;
  const hasExtremeSouth = bounds.minLat < extremeThresholds.south;
  const hasExtremeEast = bounds.maxLng > extremeThresholds.east;
  const hasExtremeWest = bounds.minLng < extremeThresholds.west;

  const extremeDirections = [
    hasExtremeNorth,
    hasExtremeSouth,
    hasExtremeEast,
    hasExtremeWest,
  ].filter(Boolean).length;

  const maxEffectiveSpan = DEGREES_IN_CIRCLE / 2;
  const normalizedSpan = Math.min(Math.max(maxSpan / maxEffectiveSpan, 0), 1);

  const spanMultiplier = 1 + normalizedSpan * 0.5;
  const extremeMultiplier =
    extremeDirections >= 3
      ? 1.4
      : extremeDirections === 2
        ? 1.25
        : extremeDirections === 1
          ? 1.15
          : 1.0;

  const optimalPadding =
    basePadding[deviceType] * spanMultiplier * extremeMultiplier;

  return Math.min(
    Math.max(optimalPadding, PADDING_BOUNDS.min),
    PADDING_BOUNDS.max
  );
}

/**
 * Calculates zoom level using Web Mercator projection to fit all towns in the viewport.
 * Uses accurate geographic calculations accounting for Mercator distortion at different latitudes.
 *
 * @param allTowns - Array of town objects to fit in the viewport
 * @param mapWidth - Map viewport width in pixels. Defaults to 800
 * @param mapHeight - Map viewport height in pixels. Defaults to 600
 * @param paddingPercent - Padding percentage to add around bounds (0-1). Defaults to 0.15 (15%)
 * @returns Zoom level (0.1-20) that fits all towns, or 4 if fewer than 2 towns
 *
 * @example
 * ```ts
 * const zoom = calculateFitZoom(towns, 1920, 1080, 0.2);
 * // Returns zoom level that fits all towns with 20% padding
 * ```
 */
export function calculateFitZoom(
  allTowns: Town[],
  mapWidth: number = 800,
  mapHeight: number = 600,
  paddingPercent: number = 0.15
): number {
  if (allTowns.length < 2) return 4;

  const globalBounds = getBounds(allTowns);

  const WORLD_DIM = WORLD_DIMENSIONS;

  const globalLatSpan = globalBounds.maxLat - globalBounds.minLat;
  const globalLngSpan = globalBounds.maxLng - globalBounds.minLng;

  const paddedMinLat = globalBounds.minLat - globalLatSpan * paddingPercent;
  const paddedMaxLat = globalBounds.maxLat + globalLatSpan * paddingPercent;
  const paddedMinLng = globalBounds.minLng - globalLngSpan * paddingPercent;
  const paddedMaxLng = globalBounds.maxLng + globalLngSpan * paddingPercent;

  const latFraction =
    (mercatorLatitude(paddedMaxLat) - mercatorLatitude(paddedMinLat)) / Math.PI;
  const lngDiff = paddedMaxLng - paddedMinLng;
  const lngFraction =
    (lngDiff < 0 ? lngDiff + DEGREES_IN_CIRCLE : lngDiff) / DEGREES_IN_CIRCLE;

  const latZoom = calculateZoomLevel(mapHeight, WORLD_DIM.height, latFraction);
  const lngZoom = calculateZoomLevel(mapWidth, WORLD_DIM.width, lngFraction);

  const finalZoom = Math.min(latZoom, lngZoom);
  return Math.max(finalZoom, 0.1);
}

/**
 * Calculates effective map area after accounting for UI elements (legend, timeline, spacing).
 * Layout differs by device type:
 * - Mobile: Legend at top, timeline at bottom (vertical stack)
 * - Desktop: Legend on right side, timeline at bottom (horizontal layout)
 *
 * @param screenWidth - Viewport width in pixels
 * @param screenHeight - Viewport height in pixels
 * @param theme - MUI theme object for breakpoint and spacing calculations
 * @returns MapArea object with effectiveWidth and effectiveHeight
 *
 * @example
 * ```ts
 * const mapArea = calculateMapArea(1920, 1080, theme);
 * // Returns: { effectiveWidth: 1536, effectiveHeight: 864 }
 * ```
 */
export function calculateMapArea(
  screenWidth: number,
  screenHeight: number,
  theme: Theme
): MapArea {
  const { width, height } = validateDimensions(screenWidth, screenHeight);
  const deviceType = getDeviceType(width);
  const uiSizes = getUIElementSizes(deviceType, theme);
  const spacing = Number(theme.spacing(1));

  // Mobile: legend at top, timeline at bottom (vertical stack)
  // Desktop: legend on right side (horizontal layout)
  let effectiveWidth: number;
  let effectiveHeight: number;

  if (deviceType === "mobile") {
    effectiveWidth = (width - spacing * 2) as number;
    effectiveHeight = (height -
      uiSizes.timeline -
      uiSizes.legend -
      uiSizes.bottomSpacing -
      spacing) as number;
  } else if (deviceType === "tablet") {
    // Large tablets (iPad Pro) may have legend on right like desktop
    const isLargeTablet = width >= 1000;
    if (isLargeTablet) {
      const legendWidth = Math.max(
        width * LEGEND_WIDTH_CALCULATIONS.LARGE_TABLET.percentage,
        LEGEND_WIDTH_CALCULATIONS.LARGE_TABLET.min
      ) as number;
      effectiveWidth = (width - legendWidth - spacing * 2) as number;
      effectiveHeight = (height -
        uiSizes.timeline -
        uiSizes.bottomSpacing -
        spacing) as number;
    } else {
      effectiveWidth = (width - spacing * 2) as number;
      effectiveHeight = (height -
        uiSizes.timeline -
        uiSizes.legend -
        uiSizes.bottomSpacing -
        spacing) as number;
    }
  } else {
    const legendWidth = Math.max(
      width * LEGEND_WIDTH_CALCULATIONS.DESKTOP.percentage,
      LEGEND_WIDTH_CALCULATIONS.DESKTOP.min
    ) as number;
    effectiveWidth = (width - legendWidth - spacing * 2) as number;
    effectiveHeight = (height -
      uiSizes.timeline -
      uiSizes.bottomSpacing -
      spacing) as number;
  }

  const multipliers = MAP_AREA_MULTIPLIERS[deviceType];

  const finalWidth = Math.max(
    effectiveWidth * multipliers.width,
    MIN_MAP_DIMENSIONS.width
  );
  const finalHeight = Math.max(
    effectiveHeight * multipliers.height,
    MIN_MAP_DIMENSIONS.height
  );

  return {
    effectiveWidth: isValidNumber(finalWidth)
      ? finalWidth
      : width * FALLBACK_MAP_DIMENSIONS.width,
    effectiveHeight: isValidNumber(finalHeight)
      ? finalHeight
      : height * FALLBACK_MAP_DIMENSIONS.height,
  };
}

/**
 * Calculates zoom level using Mercator projection to ensure all towns are visible.
 *
 * Handles device-specific padding and edge cases (e.g., towns at extreme longitudes).
 * The algorithm:
 * 1. Calculates geographic bounds from all town coordinates
 * 2. Applies device-specific padding based on screen size
 * 3. Converts to Web Mercator coordinates for accurate zoom calculation
 * 4. Returns zoom level (1-20) that fits all towns in the viewport
 *
 * @param towns - Array of town objects with latitude/longitude coordinates
 * @param screenWidth - Viewport width in pixels
 * @param screenHeight - Viewport height in pixels
 * @param theme - MUI theme for breakpoint and spacing calculations
 * @returns Zoom level (1-20) that ensures all towns are visible, or 4 as fallback
 */
export function calculateResponsiveZoom(
  towns: Town[],
  screenWidth: number,
  screenHeight: number,
  theme: Theme
): number {
  if (towns.length < 2) return 4;

  const { width, height } = validateDimensions(screenWidth, screenHeight);

  if (
    !theme ||
    !theme.breakpoints ||
    !theme.breakpoints.values ||
    !theme.spacing
  ) {
    logger.warn(
      "Invalid theme object provided to calculateResponsiveZoom:",
      theme
    );
    return 4;
  }

  const deviceType = getDeviceType(width);
  const baseMargin = calculateOptimalPadding(towns, deviceType);
  const { effectiveWidth, effectiveHeight } = calculateMapArea(
    width,
    height,
    theme
  );

  return calculateFitZoom(towns, effectiveWidth, effectiveHeight, baseMargin);
}

/**
 * Converts town data to GeoJSON FeatureCollection format for map rendering.
 * Filters out invalid towns and creates Point features with town properties.
 * Each town becomes a GeoJSON Point feature with the town's data in properties.
 *
 * @param localities - Array of town objects to convert to GeoJSON
 * @returns GeoJSON FeatureCollection with Point features for each valid town
 * @throws Error if localities is not an array
 *
 * @example
 * ```ts
 * const geojson = townsToGeoJSON(towns);
 * // Returns: { type: "FeatureCollection", features: [...] }
 * ```
 */
export function townsToGeoJSON(localities: Town[]): GeoJSON.FeatureCollection {
  if (!Array.isArray(localities)) {
    throw new Error("Localities must be an array");
  }

  const features: GeoJSON.Feature[] = [];
  let invalidCount = 0;

  for (let i = 0; i < localities.length; i++) {
    const town = localities[i];

    if (!town || !town.name || !isValidTown(town)) {
      invalidCount++;
      continue;
    }

    features.push({
      id: town.name,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [town.longitude, town.latitude],
      },
      properties: {
        ...town,
      },
    });
  }

  if (invalidCount > 0) {
    logger.warn(
      `Filtered out ${invalidCount} invalid towns from GeoJSON conversion`
    );
  }

  return {
    type: "FeatureCollection",
    features,
  };
}

/**
 * Filters towns to include only those with population data for the specified year.
 * Returns towns that have a valid positive population value for the given year.
 *
 * @param towns - Array of town objects with populationByYear data
 * @param year - Year to filter by (e.g., 800, 1000, 1200)
 * @returns Array of towns that exist and have population > 0 for the specified year
 * @throws Error if towns is not an array or year is invalid
 *
 * @example
 * ```ts
 * const townsIn1200 = filterTownsByYear(allTowns, 1200);
 * // Returns only towns with population data for year 1200
 * ```
 */
export function filterTownsByYear(towns: Town[], year: number): Town[] {
  if (!Array.isArray(towns)) {
    throw new Error("Towns must be an array");
  }

  if (typeof year !== "number" || isNaN(year) || year < 0) {
    throw new Error("Year must be a valid positive number");
  }

  const yearKey = year.toString();
  const filteredTowns: Town[] = [];

  for (let i = 0; i < towns.length; i++) {
    const town = towns[i];

    if (town && town.populationByYear) {
      const population = town.populationByYear[yearKey];
      if (
        typeof population === "number" &&
        !isNaN(population) &&
        population > 0
      ) {
        filteredTowns.push(town);
      }
    }
  }

  return filteredTowns;
}
