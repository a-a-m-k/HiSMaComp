import { SpacingValue, Town } from "../common/types";

/**
 * Calculates the bounding box for a set of towns.
 * @param towns - Array of Town objects.
 * @returns Bounding box with min/max latitude and longitude.
 */
function getBounds(towns: Town[]) {
  if (towns.length === 0) {
    return { minLat: 0, maxLat: 0, minLng: 0, maxLng: 0 };
  }

  // Filter out towns with null population
  const validTowns = towns.filter(
    (town) => town.populationByCentury[11] !== null,
  );
  const count = validTowns.length;

  // If no valid towns, fallback to all towns
  const sortedByLat = (count > 0 ? validTowns : towns)
    .slice()
    .sort((a, b) => a.latitude - b.latitude);
  const sortedByLng = (count > 0 ? validTowns : towns)
    .slice()
    .sort((a, b) => a.longitude - b.longitude);

  const lowerIdx = 0;
  const upperIdx = (count > 0 ? count : towns.length) - 1;

  const minLat = sortedByLat[lowerIdx].latitude;
  const maxLat = sortedByLat[upperIdx].latitude;
  const minLng = sortedByLng[lowerIdx].longitude;
  const maxLng = sortedByLng[upperIdx].longitude;

  return { minLat, maxLat, minLng, maxLng };
}

/**
 * Computes the geographic center of a set of towns.
 * @param towns - Array of Town objects.
 * @returns Center coordinates (latitude, longitude).
 */
export function getCenter(towns: Town[]) {
  const { minLat, maxLat, minLng, maxLng } = getBounds(towns);
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
  mapHeight: number = 600,
): number {
  if (towns.length < 2) return 4;

  const { minLat, maxLat, minLng, maxLng } = getBounds(towns);
  const WORLD_DIM = { width: 256, height: 256 };
  const ZOOM_MAX = 20;

  const latRad = (lat: number) => {
    const sin = Math.sin((lat * Math.PI) / 180);
    return Math.log((1 + sin) / (1 - sin)) / 2;
  };

  const zoom = (mapPx: number, worldPx: number, fraction: number) =>
    Math.floor(Math.log(mapPx / worldPx / fraction) / Math.LN2);

  const latFraction = (latRad(maxLat) - latRad(minLat)) / Math.PI;
  const lngDiff = maxLng - minLng;
  const lngFraction = (lngDiff < 0 ? lngDiff + 360 : lngDiff) / 360;

  const latZoom = zoom(mapHeight, WORLD_DIM.height, latFraction);
  const lngZoom = zoom(mapWidth, WORLD_DIM.width, lngFraction);

  return Math.min(latZoom, lngZoom, ZOOM_MAX);
}

export function townsToGeoJSON(localities: Town[]): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: localities.map((town) => ({
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
  pxPerRemOrEm: number = 16,
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
