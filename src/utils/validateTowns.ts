import { Town } from "@/common/types";
import { isValidTown } from "@/utils/zoom/zoomHelpers";
import { logger } from "@/utils/logger";

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function hasPopulationByYear(obj: Record<string, unknown>): obj is Record<
  string,
  unknown
> & {
  populationByYear: Record<string, number | null>;
} {
  const p = obj.populationByYear;
  return (
    isObject(p) &&
    Object.keys(p).length >= 0 &&
    Object.values(p).every(
      v => v === null || (typeof v === "number" && !Number.isNaN(v))
    )
  );
}

/**
 * Validates a single item as a Town: name (string), latitude/longitude (valid coords), populationByYear (object).
 * Returns the validated town or null if invalid.
 */
function validateTownEntry(entry: unknown): Town | null {
  if (!isObject(entry)) return null;
  const name = entry.name;
  const lat = entry.latitude;
  const lng = entry.longitude;
  if (typeof name !== "string" || name.trim() === "") return null;
  if (typeof lat !== "number" || typeof lng !== "number") return null;
  if (!hasPopulationByYear(entry)) return null;
  const candidate = {
    name: name.trim(),
    latitude: lat,
    longitude: lng,
    populationByYear: entry.populationByYear,
    ...(Array.isArray(entry.nameVariants) &&
    entry.nameVariants.every((v: unknown) => typeof v === "string")
      ? { nameVariants: entry.nameVariants as string[] }
      : {}),
  };
  if (!isValidTown(candidate)) return null;
  return candidate as Town;
}

/**
 * Validates and filters raw loaded data into an array of Town.
 * Logs a warning for each invalid entry and returns only valid towns.
 */
export function validateTownsData(raw: unknown): Town[] {
  if (!Array.isArray(raw)) {
    logger.warn("Towns data is not an array");
    return [];
  }
  const result: Town[] = [];
  let skipped = 0;
  for (let i = 0; i < raw.length; i++) {
    const town = validateTownEntry(raw[i]);
    if (town) {
      result.push(town);
    } else {
      skipped++;
    }
  }
  if (skipped > 0) {
    logger.warn(
      `Towns data: skipped ${skipped} invalid entries, kept ${result.length}`
    );
  }
  return result;
}
