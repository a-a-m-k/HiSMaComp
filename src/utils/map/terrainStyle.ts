import { StyleSpecification } from "react-map-gl/maplibre";
import terrainDarkStyleJson from "@/assets/terrain-gl-style/terrain-dark.json";
import terrainStyleJson from "@/assets/terrain-gl-style/terrain.json";
import { MAP_MUTED_SLATE_RGBA } from "@/constants/map";
import { logger } from "../logger";

/**
 * Light: full-color terrain. Dark: separate basemap uses `terrain-dark.json` (fork of `terrain.json`);
 * population circles/labels render on a transparent overlay map.
 */
export type MapBaseStyleMode = "light" | "dark";

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

let cachedTerrainDarkStyle: StyleSpecification | null = null;
let hasWarmedStadiaStyleMetadata = false;

function getStadiaStyleWarmupUrls(apiKey: string): string[] {
  return [
    `https://tiles.stadiamaps.com/data/stamen-omt.json?api_key=${apiKey}`,
    `https://tiles.stadiamaps.com/data/stamen_null.json?api_key=${apiKey}`,
    "https://tiles.stadiamaps.com/data/terrarium.json",
    `https://tiles.stadiamaps.com/styles/stamen-terrain/sprite@2x.json?api_key=${apiKey}`,
    `https://tiles.stadiamaps.com/fonts/Open%20Sans%20Regular,Arial%20Unicode%20MS%20Regular/0-255.pbf?api_key=${apiKey}`,
  ];
}

/**
 * Warm up key Stadia style metadata requests so MapLibre can reuse
 * connections/cached responses during initial style bootstrap.
 */
export function warmupStadiaStyleMetadata(): void {
  if (hasWarmedStadiaStyleMetadata) return;
  if (typeof window === "undefined" || typeof fetch !== "function") return;

  let apiKey: string;
  try {
    apiKey = getStadiaApiKey();
  } catch {
    return;
  }

  hasWarmedStadiaStyleMetadata = true;
  for (const url of getStadiaStyleWarmupUrls(apiKey)) {
    fetch(url, {
      method: "GET",
      mode: "no-cors",
      cache: "force-cache",
      credentials: "omit",
      keepalive: true,
    }).catch(() => {
      // Best-effort warmup only.
    });
  }
}

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

/**
 * Dark basemap: same sources/layers as `terrain.json`, with hsl paints darkened (see
 * `scripts/generate-terrain-dark.mjs`). Regenerate after editing `terrain.json`.
 */
export function getTerrainDarkStyle(): StyleSpecification {
  if (cachedTerrainDarkStyle) {
    return cachedTerrainDarkStyle;
  }

  const apiKey = getStadiaApiKey();
  cachedTerrainDarkStyle = replaceApiKeyPlaceholder(
    terrainDarkStyleJson,
    apiKey
  ) as StyleSpecification;

  return cachedTerrainDarkStyle;
}

interface PopulationOverlayStyleOptions {
  includeWaterNameLayer?: boolean;
}

/** Disputed-border filter ids (must match `terrain.json` `national-boundary-disputed`). */
const DISPUTED_BOUNDARY_IDS = [
  238797482, 330695990, 330696000, 330696028, 330696042, 731895849, 731896898,
  130207714, 919865757, 130072456, 130207737, 722542321, 722542322, 910464113,
  216249910,
] as const;

/**
 * Overlay style used in split dark mode: transparent canvas + country borders.
 *
 * Intentionally no extra `hillshade`; the dark basemap already renders
 * full terrain + hillshade from `terrain-dark.json`.
 */
export function getPopulationOverlayStyle(
  options: PopulationOverlayStyleOptions = {}
): StyleSpecification {
  const { includeWaterNameLayer = true } = options;
  const base = getTerrainStyle();
  const stamenOmt = base.sources?.["stamen-omt"];
  if (!stamenOmt || stamenOmt.type !== "vector") {
    throw new Error("terrain style missing stamen-omt vector source");
  }

  const layers: StyleSpecification["layers"] = [
    {
      id: "overlay-background",
      type: "background",
      paint: {
        "background-color": "rgba(0,0,0,0)",
      },
    },
    {
      id: "overlay-national-boundary",
      type: "line",
      source: "stamen-omt",
      "source-layer": "boundary",
      minzoom: 1.5,
      filter: [
        "all",
        ["==", ["get", "admin_level"], 2],
        ["==", ["get", "disputed"], 0],
        ["==", ["get", "maritime"], 0],
      ],
      layout: { "line-cap": "round", "line-join": "round" },
      paint: {
        "line-color": MAP_MUTED_SLATE_RGBA,
        "line-dasharray": [
          "step",
          ["zoom"],
          ["literal", [1.25, 2.5]],
          8,
          ["literal", [0.75, 3]],
        ],
        "line-width": 2,
      },
    },
    {
      id: "overlay-national-boundary-disputed",
      type: "line",
      source: "stamen-omt",
      "source-layer": "boundary",
      minzoom: 2,
      filter: [
        "all",
        ["==", ["get", "admin_level"], 2],
        [
          "any",
          [
            "all",
            ["==", ["get", "disputed"], 1],
            ["==", ["get", "maritime"], 0],
          ],
          ["match", ["id"], [...DISPUTED_BOUNDARY_IDS], true, false],
        ],
      ],
      layout: { "line-cap": "round", "line-join": "round" },
      paint: {
        "line-color": MAP_MUTED_SLATE_RGBA,
        "line-dasharray": [
          "step",
          ["zoom"],
          ["literal", [0.001, 1.5]],
          4,
          ["literal", [0.001, 2.5]],
          7,
          ["literal", [0.001, 3]],
        ],
        "line-width": 2.5,
      },
    },
  ];

  if (includeWaterNameLayer) {
    layers.push({
      id: "overlay-water-name",
      type: "symbol",
      source: "stamen-omt",
      "source-layer": "water_name",
      minzoom: 2,
      filter: [
        "match",
        ["get", "class"],
        ["ocean", "sea", "bay", "lake"],
        true,
        false,
      ],
      layout: {
        "symbol-placement": "point",
        "text-field": [
          "coalesce",
          ["get", "name:en"],
          ["get", "name_int"],
          ["get", "name"],
        ],
        "text-font": ["Open Sans Regular", "Arial Unicode MS Regular"],
        "text-size": [
          "interpolate",
          ["exponential", 1.3],
          ["zoom"],
          2,
          11,
          6,
          13,
          10,
          16,
        ],
        "text-letter-spacing": 0.08,
        "text-max-width": 8,
        // Keep major water names visible in split-dark mode even when many
        // town labels are present.
        "text-allow-overlap": true,
        "text-ignore-placement": true,
      },
      paint: {
        "text-color": "rgba(128, 136, 148, 0.86)",
        "text-halo-color": "rgba(14,18,25,0.82)",
        "text-halo-width": 1.1,
      },
    });
  }

  return {
    version: 8,
    name: "Population overlay",
    sources: {
      "stamen-omt": stamenOmt,
    },
    layers,
    glyphs: base.glyphs,
  };
}
