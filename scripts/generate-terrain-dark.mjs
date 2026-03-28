/**
 * Generates `terrain-dark.json` from `terrain.json`:
 * - Land-focused layers → neutral gray
 * - Water geometry + labels → dark gray fills / lighter gray lines / readable label text
 * - Everything else → generic hsl darkening (roads, bridges, etc.)
 *
 * Run: node scripts/generate-terrain-dark.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const inputPath = join(root, "src/assets/terrain-gl-style/terrain.json");
const outputPath = join(root, "src/assets/terrain-gl-style/terrain-dark.json");

/** Neutral gray land (background, landuse, structures on land). */
const LAND = "hsl(0, 0%, 38%)";
/** Slight zoom variation for `land` background interpolate. */
const LAND_BG_LOW = "hsl(0, 0%, 36%)";
const LAND_BG_HIGH = "hsl(0, 0%, 40%)";

/** Hillshade on land (subtle relief). */
const HILLSHADE_SHADOW = "hsl(0, 0%, 24%)";
const HILLSHADE_HIGHLIGHT = "hsl(0, 0%, 48%)";

/** Dark gray water bodies. */
const WATER = "hsl(0, 0%, 14%)";
/** Slightly lighter for water lines / edges so they read on the fill. */
const WATER_LINE = "hsl(0, 0%, 22%)";

/** Marsh / wetland between land and water tone. */
const WETLAND = "hsl(0, 0%, 30%)";

const WATER_LABEL_TEXT = "hsl(0, 0%, 70%)";

const WATER_GEOMETRY = new Set([
  "water",
  "water-shadow",
  "waterway-shadow",
  "waterway",
  "waterway_outer_glow",
]);

const LAND_CORE = new Set([
  "land",
  "landuse-urban",
  "landuse-pitch",
  "hillshade",
  "null-island",
  "land-structure-polygon",
  "land-structure-line",
]);

const WETLAND_LAYERS = new Set(["wetland", "wetland_outer_glow"]);

const WATER_LABELS = new Set([
  "water-line-label",
  "waterway-label",
  "water-point-label",
]);

function layerKind(id) {
  if (WATER_GEOMETRY.has(id)) return "water";
  if (WATER_LABELS.has(id)) return "waterLabel";
  if (LAND_CORE.has(id) || WETLAND_LAYERS.has(id)) return "land";
  return "other";
}

/**
 * Fallback for roads, boundaries, labels, buildings: darker muted hsl.
 */
function darkenHslString(str) {
  const m = str.match(
    /^hsla\(\s*([\d.]+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%\s*,\s*([\d.]+)\s*\)$/i
  );
  if (m) {
    const h = parseFloat(m[1]);
    const s = parseFloat(m[2]);
    const l = parseFloat(m[3]);
    const a = parseFloat(m[4]);
    if (a === 0) return str;
    const newL = 6 + (l / 100) ** 0.85 * 42;
    const newS = Math.min(s, 28 + (l / 100) * 18);
    return `hsla(${Math.round(h)}, ${Math.round(newS)}%, ${Math.round(newL)}%, ${a})`;
  }

  const m2 = str.match(
    /^hsl\(\s*([\d.]+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%\s*\)$/i
  );
  if (m2) {
    const h = parseFloat(m2[1]);
    const s = parseFloat(m2[2]);
    const l = parseFloat(m2[3]);
    const newL = 6 + (l / 100) ** 0.85 * 42;
    const newS = Math.min(s, 28 + (l / 100) * 18);
    return `hsl(${Math.round(h)}, ${Math.round(newS)}%, ${Math.round(newL)}%)`;
  }

  return str;
}

function rewriteSemanticHsl(str, layerId, kind, paintKey) {
  if (kind === "other") return darkenHslString(str);

  if (str.match(/^hsla\(/i)) {
    const a = str.match(/,\s*([\d.]+)\s*\)\s*$/);
    if (a && parseFloat(a[1]) === 0) return str;
  }

  if (kind === "water") {
    if (paintKey.includes("line")) return WATER_LINE;
    return WATER;
  }

  if (kind === "waterLabel") {
    if (paintKey.includes("halo")) return WATER;
    return WATER_LABEL_TEXT;
  }

  if (kind === "land") {
    if (paintKey === "hillshade-shadow-color") return HILLSHADE_SHADOW;
    if (paintKey === "hillshade-highlight-color") return HILLSHADE_HIGHLIGHT;
    if (paintKey === "hillshade-accent-color") return str;

    if (layerId === "wetland" && paintKey === "fill-color") return WETLAND;
    if (layerId === "wetland_outer_glow" && paintKey.includes("line"))
      return WETLAND;

    if (layerId === "land" && paintKey === "background-color") {
      const m = str.match(/^hsl\(/i);
      if (m) {
        if (str.includes("91%")) return LAND_BG_LOW;
        if (str.includes("81%")) return LAND_BG_HIGH;
      }
      return LAND;
    }

    return LAND;
  }

  return darkenHslString(str);
}

function transformPaint(value, layerId, kind, paintKey) {
  if (typeof value === "string") {
    if (/^hsla?\(/i.test(value)) {
      return rewriteSemanticHsl(value, layerId, kind, paintKey);
    }
    return value;
  }
  if (Array.isArray(value)) {
    return value.map(v => transformPaint(v, layerId, kind, paintKey));
  }
  if (value !== null && typeof value === "object") {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = transformPaint(v, layerId, kind, k);
    }
    return out;
  }
  return value;
}

const raw = JSON.parse(readFileSync(inputPath, "utf8"));

const layers = raw.layers.map(layer => {
  const kind = layerKind(layer.id);
  if (!layer.paint) return layer;
  return {
    ...layer,
    paint: transformPaint(layer.paint, layer.id, kind, ""),
  };
});

const out = {
  ...raw,
  name:
    typeof raw.name === "string"
      ? `${raw.name} (dark fork)`
      : "Terrain dark",
  layers,
};

writeFileSync(outputPath, JSON.stringify(out, null, 2) + "\n", "utf8");
console.log("Wrote", outputPath);
