/**
 * Single source for map control pseudo-tooltips (`data-tooltip`): MapLibre zoom + overlay IconButtons.
 * Default placement `left` opens toward the map so labels are not clipped at the viewport edge.
 */
import type { CSSObject } from "@mui/material/styles";
import type { Theme } from "@mui/material/styles";

import { SHADOWS, TOOLTIP_STYLES, TRANSITIONS, Z_INDEX } from "./themeValues";

export type MapTooltipPosition = "left" | "top" | "right";

export interface TooltipStylesOptions {
  position: MapTooltipPosition;
  selector: string;
}

function getTooltipContentStyles(
  options: TooltipStylesOptions,
  theme: Theme
): string {
  const { position, selector } = options;
  const tooltipBg = theme.custom.colors.tooltipBackground;
  const tooltipFg = theme.custom.colors.tooltipText;

  if (position === "left") {
    return `
      ${selector}::after {
        content: attr(data-tooltip);
        position: absolute;
        right: calc(100% + ${TOOLTIP_STYLES.OFFSET}px);
        left: auto;
        top: 50%;
        transform: translateY(-50%);
        background-color: ${tooltipBg};
        color: ${tooltipFg};
        padding: ${TOOLTIP_STYLES.PADDING};
        border-radius: ${TOOLTIP_STYLES.BORDER_RADIUS};
        font-size: ${TOOLTIP_STYLES.FONT_SIZE};
        white-space: nowrap;
        pointer-events: none;
        opacity: 0;
        visibility: hidden;
        transition: ${TRANSITIONS.TOOLTIP};
        z-index: ${Z_INDEX.TOOLTIP};
        box-shadow: ${SHADOWS.TOOLTIP};
      }
    `;
  }

  if (position === "top") {
    return `
      ${selector}::after {
        content: attr(data-tooltip);
        position: absolute;
        bottom: calc(100% + ${TOOLTIP_STYLES.OFFSET}px);
        right: 0;
        background-color: ${tooltipBg};
        color: ${tooltipFg};
        padding: ${TOOLTIP_STYLES.PADDING};
        border-radius: ${TOOLTIP_STYLES.BORDER_RADIUS};
        font-size: ${TOOLTIP_STYLES.FONT_SIZE};
        white-space: nowrap;
        pointer-events: none;
        opacity: 0;
        visibility: hidden;
        transition: ${TRANSITIONS.TOOLTIP};
        z-index: ${Z_INDEX.TOOLTIP};
        box-shadow: ${SHADOWS.TOOLTIP};
      }
    `;
  }

  return `
    ${selector}::after {
      content: attr(data-tooltip);
      position: absolute;
      left: calc(100% + ${TOOLTIP_STYLES.OFFSET + 2}px);
      top: 50%;
      transform: translateY(-50%);
      background-color: ${tooltipBg};
      color: ${tooltipFg};
      padding: ${TOOLTIP_STYLES.PADDING};
      border-radius: ${TOOLTIP_STYLES.BORDER_RADIUS};
      font-size: ${TOOLTIP_STYLES.FONT_SIZE};
      white-space: nowrap;
      pointer-events: none;
      opacity: 0;
      visibility: hidden;
      transition: ${TRANSITIONS.TOOLTIP};
      z-index: ${Z_INDEX.TOOLTIP};
      box-shadow: ${SHADOWS.TOOLTIP};
    }
  `;
}

function getTooltipArrowStyles(
  options: TooltipStylesOptions,
  theme: Theme
): string {
  const { position, selector } = options;
  const tooltipBg = theme.custom.colors.tooltipBackground;

  if (position === "left") {
    return `
      ${selector}::before {
        content: '';
        position: absolute;
        right: calc(100% + ${TOOLTIP_STYLES.OFFSET - 6}px);
        left: auto;
        top: 50%;
        transform: translateY(-50%);
        width: 0;
        height: 0;
        border-top: ${TOOLTIP_STYLES.ARROW_SIZE}px solid transparent;
        border-bottom: ${TOOLTIP_STYLES.ARROW_SIZE}px solid transparent;
        border-left: ${TOOLTIP_STYLES.ARROW_SIZE}px solid ${tooltipBg};
        opacity: 0;
        visibility: hidden;
        transition: ${TRANSITIONS.TOOLTIP};
        z-index: ${Z_INDEX.TOOLTIP_ARROW};
      }
    `;
  }

  if (position === "top") {
    return `
      ${selector}::before {
        content: '';
        position: absolute;
        bottom: calc(100% + ${TOOLTIP_STYLES.OFFSET - 6}px);
        right: ${TOOLTIP_STYLES.ARROW_OFFSET}px;
        width: 0;
        height: 0;
        border-left: ${TOOLTIP_STYLES.ARROW_SIZE}px solid transparent;
        border-right: ${TOOLTIP_STYLES.ARROW_SIZE}px solid transparent;
        border-top: ${TOOLTIP_STYLES.ARROW_SIZE}px solid ${tooltipBg};
        opacity: 0;
        visibility: hidden;
        transition: ${TRANSITIONS.TOOLTIP};
        z-index: ${Z_INDEX.TOOLTIP_ARROW};
      }
    `;
  }

  return `
    ${selector}::before {
      content: '';
      position: absolute;
      left: calc(100% + ${TOOLTIP_STYLES.OFFSET - 6}px);
      top: 50%;
      transform: translateY(-50%);
      width: 0;
      height: 0;
      border-top: ${TOOLTIP_STYLES.ARROW_SIZE}px solid transparent;
      border-bottom: ${TOOLTIP_STYLES.ARROW_SIZE}px solid transparent;
      border-right: ${TOOLTIP_STYLES.ARROW_SIZE}px solid ${tooltipBg};
      opacity: 0;
      visibility: hidden;
      transition: ${TRANSITIONS.TOOLTIP};
      z-index: ${Z_INDEX.TOOLTIP_ARROW};
    }
  `;
}

/** Injected CSS for `data-tooltip` on arbitrary selectors (MapLibre, global). */
export function getTooltipStyles(
  options: TooltipStylesOptions,
  themeArg: Theme
): string {
  const { selector } = options;
  const mdBreakpoint = themeArg.breakpoints.values.md - 1;

  return `
    ${getTooltipContentStyles(options, themeArg)}
    ${getTooltipArrowStyles(options, themeArg)}
    @media (max-width: ${mdBreakpoint}px) {
      ${selector}::after,
      ${selector}::before {
        display: none !important;
      }
    }
    ${selector}:focus-visible::after,
    ${selector}:focus-visible::before {
      opacity: 1;
      visibility: visible;
    }
    @media (hover: hover) and (pointer: fine) {
      ${selector}:hover::after,
      ${selector}:hover::before {
        opacity: 1;
        visibility: visible;
      }
    }
  `;
}

const mdOnlyTooltipVisible = (theme: Theme): Record<string, unknown> => ({
  [theme.breakpoints.down("md")]: {
    display: "none",
  },
});

/**
 * MUI `sx` for `[data-tooltip]` on top-left overlay IconButtons — opens to the **right** (same as `getTooltipStyles` with `position: "right"`).
 */
export function mapOverlayDataTooltipStyles(theme: Theme): CSSObject {
  const tooltipBg = theme.custom.colors.tooltipBackground;
  return {
    "&[data-tooltip]::after": {
      content: "attr(data-tooltip)",
      position: "absolute",
      left: `calc(100% + ${TOOLTIP_STYLES.OFFSET + 2}px)`,
      top: "50%",
      transform: "translateY(-50%)",
      backgroundColor: tooltipBg,
      color: theme.custom.colors.tooltipText,
      padding: TOOLTIP_STYLES.PADDING,
      borderRadius: TOOLTIP_STYLES.BORDER_RADIUS,
      fontSize: TOOLTIP_STYLES.FONT_SIZE,
      whiteSpace: "nowrap",
      pointerEvents: "none",
      opacity: 0,
      visibility: "hidden",
      transition: TRANSITIONS.TOOLTIP,
      zIndex: Z_INDEX.TOOLTIP,
      boxShadow: SHADOWS.TOOLTIP,
      ...mdOnlyTooltipVisible(theme),
    },
    "&[data-tooltip]:focus-visible::after": {
      opacity: 1,
      visibility: "visible",
    },
    "&[data-tooltip]::before": {
      content: '""',
      position: "absolute",
      left: `calc(100% + ${TOOLTIP_STYLES.OFFSET - 6}px)`,
      top: "50%",
      transform: "translateY(-50%)",
      width: 0,
      height: 0,
      borderTop: `${TOOLTIP_STYLES.ARROW_SIZE}px solid transparent`,
      borderBottom: `${TOOLTIP_STYLES.ARROW_SIZE}px solid transparent`,
      borderRight: `${TOOLTIP_STYLES.ARROW_SIZE}px solid ${tooltipBg}`,
      opacity: 0,
      visibility: "hidden",
      transition: TRANSITIONS.TOOLTIP,
      zIndex: Z_INDEX.TOOLTIP_ARROW,
      ...mdOnlyTooltipVisible(theme),
    },
    "&[data-tooltip]:focus-visible::before": {
      opacity: 1,
      visibility: "visible",
    },
    "@media (hover: hover) and (pointer: fine)": {
      "&[data-tooltip]:hover::after, &[data-tooltip]:hover::before": {
        opacity: 1,
        visibility: "visible",
      },
    },
  };
}
