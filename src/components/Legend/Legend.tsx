import React from "react";
import { LegendContent, LegendProps } from "./LegendContent";
import Paper from "@mui/material/Paper";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { APP_MIN_WIDTH } from "@/constants";
import { calculateMinWidth } from "@/utils";

const Legend: React.FC<LegendProps> = props => {
  const theme = useTheme();
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const spacing = theme.spacing(2);
  if (!props.layers || props.layers.length === 0) return null;

  if (isMobile) {
    return (
      <Paper
        id="legend"
        elevation={3}
        sx={{
          display: "flex",
          position: "fixed",
          top: theme.spacing(1),
          right: theme.spacing(1),
          left: theme.spacing(1),
          borderRadius: 2,
          p: 1,
          zIndex: theme.zIndex.appBar + 1,
          minWidth: calculateMinWidth(APP_MIN_WIDTH, spacing),
          ...props.style,
        }}
        data-testid={"legend-mobile"}
      >
        <LegendContent {...props} />
      </Paper>
    );
  }
  if (isTablet) {
    return (
      <Paper
        id="legend"
        elevation={3}
        sx={{
          position: "fixed",
          left: "50%",
          transform: "translateX(-50%)",
          borderRadius: 2,
          width: "80%",
          p: 2,
          zIndex: theme.zIndex.appBar + 1,
          ...props.style,
        }}
        data-testid={"legend-tablet"}
      >
        <LegendContent {...props} />
      </Paper>
    );
  }

  return (
    <Paper
      id="legend"
      elevation={3}
      sx={{
        position: "absolute",
        top: theme.spacing(2),
        right: theme.spacing(1),
        p: 2,
        width: "20%",
        minWidth: "240px",
        zIndex: theme.zIndex.appBar + 1,
        ...props.style,
      }}
      data-testid="legend"
    >
      <LegendContent {...props} />
    </Paper>
  );
};

export default Legend;
