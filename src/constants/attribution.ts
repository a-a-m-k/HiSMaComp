export interface AttributionLink {
  readonly href: string;
  readonly label: string;
}

const ATTRIBUTION_DATA: readonly AttributionLink[] = [
  { href: "https://stadiamaps.com/", label: "© Stadia Maps" },
  { href: "https://stamen.com/", label: "© Stamen Design" },
  { href: "https://openmaptiles.org/", label: "© OpenMapTiles" },
  {
    href: "https://www.openstreetmap.org/copyright",
    label: "© OpenStreetMap",
  },
] as const;

export const ATTRIBUTION_LINKS: readonly AttributionLink[] = ATTRIBUTION_DATA;

export const ATTRIBUTION_TEXT: string = ATTRIBUTION_DATA.map(
  link => link.label
).join(" ");
