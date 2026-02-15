import React, { useMemo } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

import { AttributionLinks } from "@/components/ui";
import { useApp } from "@/context/AppContext";
import { useResponsive } from "@/hooks/ui";
import { LayerItem } from "@/common/types";
import { getLegendStyles } from "@/constants/sizing";

export interface LegendProps {
  label: string;
  layers: LayerItem[];
  style?: React.CSSProperties;
}

const LegendItem: React.FC<{ layer: string; color: string }> = React.memo(
  ({ layer, color }) => {
    const theme = useTheme();
    const { isMobile } = useResponsive();
    const sizingStyles = useMemo(() => getLegendStyles(theme), [theme]);

    const indicatorStyles = useMemo(
      () => ({
        width: isMobile ? theme.spacing(2) : theme.spacing(2.5),
        height: isMobile ? theme.spacing(2) : theme.spacing(2.5),
        mr: isMobile ? theme.spacing(1.25) : theme.spacing(1.75),
        borderRadius: "50%",
        flexShrink: 0,
        border: `1px solid ${theme.palette.divider}`,
        bgcolor: color,
      }),
      [isMobile, theme, color]
    );

    const textStyles = useMemo(
      () => ({
        ...sizingStyles.itemText,
        color: theme.palette.text.primary,
      }),
      [sizingStyles.itemText, theme]
    );

    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          transition: "opacity 0.2s ease-in-out",
          "&:hover": {
            opacity: 0.8,
          },
        }}
      >
        <Box sx={indicatorStyles} role="presentation" aria-hidden="true" />
        <Typography component="span" variant="subtitle2" sx={textStyles}>
          {layer}
        </Typography>
      </Box>
    );
  }
);

LegendItem.displayName = "LegendItem";

export const LegendContent: React.FC<LegendProps> = React.memo(
  ({ layers, label, style }) => {
    const { selectedYear } = useApp();
    const theme = useTheme();
    const { isTablet, isMobile } = useResponsive();
    const isMediumOrLarger = useMediaQuery(theme.breakpoints.up("md"));
    const sizingStyles = useMemo(() => getLegendStyles(theme), [theme]);

    const titleStyles = useMemo(
      () => ({
        ...sizingStyles.title,
        mb: isMobile
          ? theme.spacing(0.5)
          : isTablet
            ? theme.spacing(0.75)
            : theme.spacing(1.25),
        textAlign: isTablet || isMobile ? "center" : "left",
        width: "100%",
        color: theme.palette.text.primary,
      }),
      [sizingStyles.title, isMobile, isTablet, theme]
    );

    const subtitleStyles = useMemo(
      () => ({
        ...sizingStyles.subtitle,
        mb: isMobile
          ? theme.spacing(0.5)
          : isTablet
            ? theme.spacing(1)
            : theme.spacing(2),
        textAlign: isTablet || isMobile ? "center" : "left",
        width: "100%",
        color: theme.palette.text.secondary,
        opacity: 0.9,
      }),
      [sizingStyles.subtitle, isMobile, isTablet, theme]
    );

    const stackStyles = useMemo(
      () => ({
        spacing: isMobile
          ? theme.spacing(0.5)
          : isTablet
            ? theme.spacing(2.5)
            : isMediumOrLarger
              ? theme.spacing(1.25)
              : theme.spacing(1.5),
        direction: (isMediumOrLarger ? "column" : "row") as "row" | "column",
        alignItems: (isTablet || isMobile ? "center" : "flex-start") as
          | "center"
          | "flex-start",
        sx: {
          flexWrap: isMediumOrLarger ? "nowrap" : "wrap",
          justifyContent: isTablet || isMobile ? "space-evenly" : "flex-start",
          overflowX: isTablet ? "auto" : "visible",
        },
      }),
      [isMobile, isTablet, isMediumOrLarger, theme]
    );

    if (!layers?.length) {
      return null;
    }

    return (
      <Box sx={style} component="section" aria-labelledby="legend-heading">
        <Typography
          id="legend-heading"
          component="h2"
          variant="h6"
          sx={titleStyles}
        >
          {label}
        </Typography>
        <Typography component="p" variant="subtitle2" sx={subtitleStyles}>
          Time around {selectedYear}
        </Typography>
        <Stack {...stackStyles}>
          {layers.map(({ layer, color }) => (
            <LegendItem key={layer} layer={layer} color={color} />
          ))}
        </Stack>
        <AttributionLinks />
      </Box>
    );
  }
);

LegendContent.displayName = "LegendContent";
