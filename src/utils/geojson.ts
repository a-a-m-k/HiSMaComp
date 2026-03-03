import { Town } from "@/common/types";
import { isValidTown } from "./zoom/zoomHelpers";
import { logger } from "./logger";

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
