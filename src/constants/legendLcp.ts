import legendLcp from "./legendLcp.json";

/** Legend heading; also in legendLcp.json for the LCP build-time placeholder (Vite plugin). */
export const LEGEND_HEADING_LABEL: string = legendLcp.heading;

/** Main legend panel title (shown above the scale heading). */
export const LEGEND_APP_TITLE: string =
  typeof legendLcp.appTitle === "string"
    ? legendLcp.appTitle
    : "European Population";
