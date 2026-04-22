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

/**
 * Bump when editing `getPopulationOverlayStyle` so `MapView`’s `useMemo` recomputes `mapStyle`
 * (otherwise the overlay map can keep the first loaded style until night mode is toggled).
 */
export const POPULATION_OVERLAY_STYLE_REVISION = 2;

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
 * Top map in split “dark” mode: transparent canvas + country borders only.
 *
 * We intentionally do **not** add a second `hillshade` here: the basemap map already renders
 * full terrain + hillshade from `terrain-dark.json` (dark fork of `terrain.json`).
 *
 * Bump `POPULATION_OVERLAY_STYLE_REVISION` in MapView when changing this style’s layers.
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

  const waterNameLayer: StyleSpecification["layers"][number] = {
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
  };

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
    layers.push(waterNameLayer);
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
