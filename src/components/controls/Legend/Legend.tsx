import React from "react";
import Paper from "@mui/material/Paper";

import { LegendContent, LegendProps } from "./LegendContent";
import { getLegendTestId, getResponsiveStyles } from "./legendHelpers";
import { Z_INDEX } from "@/constants/ui";
import { useResponsive } from "@/hooks/ui";

const Legend: React.FC<LegendProps> = props => {
  const { isMobileLayout, isTabletLayout, isXLargeLayout, theme } =
    useResponsive();

  if (!props.layers || props.layers.length === 0) return null;

  const commonStyles = {
    elevation: 3,
    zIndex: Z_INDEX.LEGEND,
    ...props.style,
  };

  return (
    <Paper
      id="legend"
      sx={getResponsiveStyles({
        isMobile: isMobileLayout,
        isTablet: isTabletLayout,
        isXLarge: isXLargeLayout,
        theme,
        commonStyles,
      })}
      data-testid={getLegendTestId({
        isMobile: isMobileLayout,
        isTablet: isTabletLayout,
      })}
      tabIndex={-1}
    >
      <LegendContent {...props} />
    </Paper>
  );
};

export default Legend;
