import { StyleSpecification } from "react-map-gl/maplibre";
import terrainStyleJson from "@/assets/terrain-gl-style/terrain.json";
import { logger } from "../logger";

const API_KEY_PLACEHOLDER = "{{STADIA_API_KEY}}";

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

/** Terrain style with API key injected; memoized. */
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
