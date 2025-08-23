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
  800: 8,
  1000: 11,
  1200: 12,
  1300: 13,
  1400: 14,
  1500: 15,
  1600: 16,
  1750: 18,
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
