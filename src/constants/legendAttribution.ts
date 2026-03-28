/**
 * Legend footer attribution block — matches reference Typography `p` styles.
 */

import { CSSProperties } from "react";

import { MAP_MUTED_SLATE_RGBA } from "@/constants/map";

export const LEGEND_ATTRIBUTION_TEXT_SX: CSSProperties = {
  fontSize: 9,
  color: MAP_MUTED_SLATE_RGBA,
  lineHeight: 1.4,
  fontWeight: 400,
};
