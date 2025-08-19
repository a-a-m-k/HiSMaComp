import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { LegendAttributionLinks } from "./LegendAttributionLinks";

interface LayerItem {
  layer: string;
  color: string;
}

export interface LegendProps {
  label: string;
  layers: LayerItem[];
  selectedYear: number;
  style?: React.CSSProperties;
}
export const LegendContent: React.FC<LegendProps> = ({
  layers,
  selectedYear,
  label,
  style,
}) => {
  const theme = useTheme();
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  if (!layers || layers.length === 0) return null;

  return (
    <Box sx={{ ...style }}>
      <Typography
        variant="h6"
        sx={{
          mb: { xs: 0.5, sm: 1 },
          fontSize: {
            xs: theme.typography.pxToRem(14),
            sm: theme.typography.pxToRem(15),
          },
          textAlign: isTablet || isMobile ? "center" : "left",
          width: "100%",
        }}
      >
        {label}
      </Typography>
      <Typography
        variant="subtitle2"
        sx={{
          mb: { xs: 0.5, sm: 1 },
          fontWeight: "bold",
          fontSize: {
            xs: theme.typography.pxToRem(14),
            sm: theme.typography.pxToRem(15),
          },
          textAlign: isTablet || isMobile ? "center" : "left",
          width: "100%",
        }}
      >
        Time around {selectedYear}
      </Typography>
      <Stack
        spacing={{ xs: 0.5, sm: 0.5 }}
        direction={isTablet ? "row" : "column"}
        alignItems={isTablet ? "center" : "flex-start"}
        sx={{
          flexWrap: isTablet ? "wrap" : "nowrap",
          justifyContent: isTablet ? "space-evenly" : "flex-start",
          overflowX: isTablet ? "auto" : "visible",
        }}
      >
        {layers.map(({ layer, color }) => (
          <Box
            key={layer}
            display="flex"
            alignItems="center"
            sx={{ mb: isTablet ? 0 : 0.5 }}
          >
            <Box
              sx={{
                width: theme.spacing(1.5),
                height: theme.spacing(1.5),
                mr: isMobile ? 1.5 : 2,
                bgcolor: color,
                borderRadius: "50%",
                flexShrink: 0,
                border: (theme) => `1.5px solid ${theme.palette.divider}`,
              }}
              aria-label={`Color for ${layer}`}
            />
            <Typography
              variant="body2"
              fontWeight={500}
              fontSize={{
                xs: theme.typography.pxToRem(14),
                md: theme.typography.pxToRem(18),
              }}
            >
              {layer}
            </Typography>
          </Box>
        ))}
      </Stack>
      <LegendAttributionLinks />
    </Box>
  );
};
