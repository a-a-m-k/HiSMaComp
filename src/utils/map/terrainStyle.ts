import { StyleSpecification } from "react-map-gl/maplibre";
import terrainStyleJson from "@/assets/terrain-gl-style/terrain.json";
import { MAP_MUTED_SLATE_RGBA } from "@/constants/map";
import { logger } from "../logger";

/**
 * Light: full-color terrain. Dark: CSS `filter` on a separate basemap layer only;
 * population circles/labels render on a transparent overlay map (unfiltered).
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

/** Full terrain style (same for light and dark; dark mode adds a filtered basemap in MapView). */
export function getMapBaseStyle(): StyleSpecification {
  return getTerrainStyle();
}

/**
 * Bump when editing `getPopulationOverlayStyle` so `MapView`’s `useMemo` recomputes `mapStyle`
 * (otherwise the overlay map can keep the first loaded style until night mode is toggled).
 */
export const POPULATION_OVERLAY_STYLE_REVISION = 2;

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
 * full terrain + hillshade from `terrain.json`, then `DARK_BASEMAP_FILTER` in MapView styles it.
 * A duplicate DEM/hillshade on this overlay blended on top looked the same when you changed
 * `paint` — relief is dominated by the bottom map + CSS filter, not this layer.
 * To darken mountains / land tone, edit **`DARK_BASEMAP_FILTER`** in `MapView.tsx`.
 *
 * Bump `POPULATION_OVERLAY_STYLE_REVISION` in MapView when changing this style’s layers.
 */
export function getPopulationOverlayStyle(): StyleSpecification {
  const base = getTerrainStyle();
  const stamenOmt = base.sources?.["stamen-omt"];
  if (!stamenOmt || stamenOmt.type !== "vector") {
    throw new Error("terrain style missing stamen-omt vector source");
  }

  return {
    version: 8,
    name: "Population overlay",
    sources: {
      "stamen-omt": stamenOmt,
    },
    layers: [
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
    ],
    glyphs: base.glyphs,
  };
}
