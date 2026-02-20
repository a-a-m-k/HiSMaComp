import { StyleSpecification } from "react-map-gl/maplibre";
import terrainStyleJson from "@/assets/terrain-gl-style/terrain.json";
import { logger } from "../logger";

/**
 * Placeholder used in terrain.json that will be replaced with the actual API key
 */
const API_KEY_PLACEHOLDER = "{{STADIA_API_KEY}}";

/**
 * Gets the Stadia Maps API key from environment variables.
 * Vite exposes env vars prefixed with VITE_ in the browser.
 *
 * @throws Error if API key is not found
 */
function getStadiaApiKey(): string {
  const apiKey = import.meta.env.VITE_STADIA_API_KEY;

  if (!apiKey) {
    const errorMessage =
      "VITE_STADIA_API_KEY environment variable is not set. " +
      "Please create a .env file with your Stadia Maps API key.";
    logger.error(errorMessage, {
      hasApiKey: !!apiKey,
      envKeys: Object.keys(import.meta.env).filter(k => k.includes("STADIA")),
    });
    throw new Error(errorMessage);
  }

  return apiKey;
}

/**
 * Recursively replaces API key placeholder in an object or string.
 * Handles nested objects, arrays, and string values.
 */
function replaceApiKeyPlaceholder(obj: unknown, apiKey: string): unknown {
  if (typeof obj === "string") {
    return obj.replace(new RegExp(API_KEY_PLACEHOLDER, "g"), apiKey);
  }

  if (Array.isArray(obj)) {
    return obj.map(item => replaceApiKeyPlaceholder(item, apiKey));
  }

  if (obj !== null && typeof obj === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = replaceApiKeyPlaceholder(value, apiKey);
    }
    return result;
  }

  return obj;
}

/**
 * Memoized terrain style with API key injected.
 * Calculated once at module load time to avoid recalculating on every render.
 */
let cachedTerrainStyle: StyleSpecification | null = null;

/**
 * Loads the terrain map style and injects the Stadia Maps API key
 * from environment variables.
 *
 * This ensures the API key is never committed to version control
 * and is loaded from environment variables at build/runtime.
 *
 * The result is memoized for performance - the style is only calculated once.
 *
 * @returns Map style specification with API key injected
 */
export function getTerrainStyle(): StyleSpecification {
  if (cachedTerrainStyle) {
    return cachedTerrainStyle;
  }

  const apiKey = getStadiaApiKey();
  cachedTerrainStyle = replaceApiKeyPlaceholder(
    terrainStyleJson,
    apiKey
  ) as StyleSpecification;

  return cachedTerrainStyle;
}
