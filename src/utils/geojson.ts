import { Town } from "@/common/types";
import {
  MAP_LABEL_TEXT_PROP,
  POPULATION_SORT_KEY_NO_DATA,
  POPULATION_SORT_KEY_PROP,
} from "@/constants/map";
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
 * @param selectedYear - Timeline year; each feature gets flat `populationForYear`,
 *   `populationSortKey`, and `mapLabelText` so MapLibre layers can avoid nested or fragile
 *   expression logic.
 *
 * @example
 * ```ts
 * const geojson = townsToGeoJSON(towns, 1200);
 * // Returns: { type: "FeatureCollection", features: [...] }
 * ```
 */
export function townsToGeoJSON(
  localities: Town[],
  selectedYear: number
): GeoJSON.FeatureCollection {
  if (!Array.isArray(localities)) {
    throw new Error("Localities must be an array");
  }

  const features: GeoJSON.Feature[] = [];
  let invalidCount = 0;

  const yearKey = String(selectedYear);

  for (let i = 0; i < localities.length; i++) {
    const town = localities[i];

    if (!town || !town.name || !isValidTown(town)) {
      invalidCount++;
      continue;
    }

    const rawPop = town.populationByYear?.[yearKey];
    const populationForYear = rawPop ?? null;
    const labelPopulation =
      typeof rawPop === "number" && !Number.isNaN(rawPop)
        ? rawPop.toLocaleString()
        : "N/A";
    const populationSortKey =
      typeof rawPop === "number" && !Number.isNaN(rawPop)
        ? rawPop
        : POPULATION_SORT_KEY_NO_DATA;

    features.push({
      // Keep feature ids unique across same-name towns; duplicate ids can cause unstable
      // source/layer updates in MapLibre workers (symbols may flash then disappear).
      id: `${town.name}:${town.latitude}:${town.longitude}`,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [town.longitude, town.latitude],
      },
      properties: {
        name: town.name,
        populationForYear,
        [POPULATION_SORT_KEY_PROP]: populationSortKey,
        [MAP_LABEL_TEXT_PROP]: `${town.name}\n${labelPopulation}`,
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
