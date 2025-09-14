export const MANDATORY_MARKERS_TABLE_FIELDS = [
  "name",
  "position",
  "latitude",
  "longitude",
];

export const ATTRIBUTION_TEXT =
  "© Stadia Maps © Stamen Design © OpenMapTiles © OpenStreetMap";

export const YEARS = [800, 1000, 1200, 1300, 1400, 1500, 1600, 1750];
export const CENTURY_MAP = {
  800: 9, // Year 800 is 9th century (801-900)
  1000: 11, // Year 1000 is 11th century (1001-1100)
  1200: 13, // Year 1200 is 13th century (1201-1300)
  1300: 14, // Year 1300 is 14th century (1301-1400)
  1400: 15, // Year 1400 is 15th century (1401-1500)
  1500: 16, // Year 1500 is 16th century (1501-1600)
  1600: 17, // Year 1600 is 17th century (1601-1700)
  1750: 18, // Year 1750 is 18th century (1701-1800)
};

// Colors representing population ranges for the map legend, from lowest to highest population
export const MAP_LEGEND_COLORS = [
  "#ffffff", // N/A (no data)
  "#cccccc", // 5,000 - 20,000
  "#9ba7b8", // 20,000 - 50,000
  "#5d7596", // 50,000 - 100,000
  "#2362a3", // 100,000 - 200,000
  "#12407e", // 200,000 -500,000
  "#011638", // 500,000
];

export const POPULATION_TRESHOLDS_MOBILE = [
  "5k",
  "20k",
  "50k",
  "100k",
  "200k",
  "500k",
];

export const POPULATION_TRESHOLDS = [
  5000, 20000, 50000, 100000, 200000, 500000,
];
export const NO_DATA_MARKER_SIZE = 1;
export const MIN_MARKER_SIZE = 5;
export const MAX_MARKER_SIZE = 15;

export const APP_MIN_WIDTH = 400;

export const MIN_ZOOM = 5;
export const MAX_ZOOM = 8;

export const MAP_LAYER_ID = "towns-population-layer";

export const FLOATING_BUTTON_SIZE = 45;

export const MOBILE_TIMELINE_HEIGHT = 110;

export const ATTRIBUTION_LINKS = [
  { href: "https://stadiamaps.com/", label: "© Stadia Maps" },
  { href: "https://stamen.com/", label: "© Stamen Design" },
  { href: "https://openmaptiles.org/", label: "© OpenMapTiles" },
  {
    href: "https://www.openstreetmap.org/copyright",
    label: "© OpenStreetMap",
  },
];

// Map calculation constants
export const WORLD_DIMENSIONS = { width: 256, height: 256 };
export const MAX_ZOOM_LEVEL = 20;
export const DEGREES_IN_CIRCLE = 360;
export const DEFAULT_YEAR = 1000;

// Cache management constants
export const MAX_CACHE_SIZE = 50;
export const MAX_CALCULATION_CACHE_SIZE = 20;

// Spatial indexing constants
export const SPATIAL_INDEX_PRECISION = 10;

// Zoom calculation constants
export const MIN_ZOOM_CALCULATION = 2;
export const MAX_ZOOM_CALCULATION = 15;
export const ZOOM_CALCULATION_BASE = 10;
