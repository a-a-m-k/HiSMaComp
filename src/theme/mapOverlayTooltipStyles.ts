import type { Theme } from "@mui/material/styles";

/**
 * CSS pseudo-tooltips for map overlay `IconButton`s (`data-tooltip`).
 * Hidden on phone only (`xs`); shown from `sm` up (tablet legend + desktop overlay).
 */
export function mapOverlayIconButtonTooltipStyles(theme: Theme) {
  return {
    "&[data-tooltip]::after": {
      content: "attr(data-tooltip)",
      position: "absolute",
      left: `calc(100% + ${theme.custom.tooltip.offset + 2}px)`,
      top: "50%",
      transform: "translateY(-50%)",
      backgroundColor: theme.custom.colors.tooltipBackground,
      color: theme.custom.colors.tooltipText,
      padding: theme.custom.tooltip.padding,
      borderRadius: theme.custom.tooltip.borderRadius,
      fontSize: theme.custom.tooltip.fontSize,
      whiteSpace: "nowrap",
      pointerEvents: "none",
      opacity: 0,
      visibility: "hidden",
      transition: theme.custom.transitions.tooltip,
      zIndex: theme.custom.zIndex.tooltip,
      boxShadow: theme.custom.shadows.tooltip,
      [theme.breakpoints.down("sm")]: {
        display: "none",
      },
    },
    "&[data-tooltip]:focus-visible::after, &[data-tooltip]:hover::after": {
      opacity: 1,
      visibility: "visible",
    },
    "&[data-tooltip]::before": {
      content: '""',
      position: "absolute",
      left: `calc(100% + ${theme.custom.tooltip.offset - 6}px)`,
      top: "50%",
      transform: "translateY(-50%)",
      width: 0,
      height: 0,
      borderTop: `${theme.custom.tooltip.arrowSize}px solid transparent`,
      borderBottom: `${theme.custom.tooltip.arrowSize}px solid transparent`,
      borderRight: `${theme.custom.tooltip.arrowSize}px solid ${theme.custom.colors.tooltipBackground}`,
      opacity: 0,
      visibility: "hidden",
      transition: theme.custom.transitions.tooltip,
      zIndex: theme.custom.zIndex.tooltipArrow,
      [theme.breakpoints.down("sm")]: {
        display: "none",
      },
    },
    "&[data-tooltip]:focus-visible::before, &[data-tooltip]:hover::before": {
      opacity: 1,
      visibility: "visible",
    },
  };
}
