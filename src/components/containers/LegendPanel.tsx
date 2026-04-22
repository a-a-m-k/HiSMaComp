import React from "react";
import Box from "@mui/material/Box";

import { Legend, Timeline } from "@/components/controls";
import { LEGEND_HEADING_LABEL, APP_MIN_WIDTH, TRANSITIONS } from "@/constants";
import { LayerItem, TimelineMark } from "@/common/types";

type LegendPanelProps = {
  hasError: boolean;
  narrowLayout: boolean;
  isResizing: boolean;
  legendLayers: LayerItem[];
  selectedYear: number;
  isMapIdle: boolean;
  marks: TimelineMark[];
};

export const LegendPanel: React.FC<LegendPanelProps> = ({
  hasError,
  narrowLayout,
  isResizing,
  legendLayers,
  selectedYear,
  isMapIdle,
  marks,
}) => {
  if (hasError) return null;

  return (
    <Box
      sx={{
        minWidth: APP_MIN_WIDTH,
        width: narrowLayout ? APP_MIN_WIDTH : "100%",
        flexShrink: 0,
        alignSelf: "stretch",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        transition: isResizing ? "none" : TRANSITIONS.LAYOUT_WIDTH,
        ...(narrowLayout && {
          minHeight: 0,
          flex: 1,
        }),
      }}
    >
      <Legend
        label={LEGEND_HEADING_LABEL}
        layers={legendLayers}
        isMapIdle={isMapIdle}
        selectedYear={selectedYear}
      />
      <Box sx={narrowLayout ? { marginTop: "auto" } : undefined}>
        <Timeline marks={marks} />
      </Box>
    </Box>
  );
};
