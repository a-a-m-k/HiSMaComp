import type { CSSObject } from "@mui/material/styles";
import type { Theme } from "@mui/material/styles";

import { mapOverlayDataTooltipStyles } from "@/theme/mapTooltipShared";

/**
 * CSS pseudo-tooltips for map overlay `IconButton`s (`data-tooltip`).
 * Tooltips open **to the right** of the top-left stack; tokens match `mapTooltipShared`. Hidden below `md` like MapLibre zoom tooltips.
 */
export function mapOverlayIconButtonTooltipStyles(theme: Theme): CSSObject {
  return mapOverlayDataTooltipStyles(theme);
}
