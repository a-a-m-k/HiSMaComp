import React, { useMemo } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import { useTheme } from "@mui/material/styles";

import { AttributionLinks } from "@/components/ui";
import { useResponsive } from "@/hooks/ui";
import { LayerItem } from "@/common/types";
import { getLegendStyles } from "@/constants/sizing";

export interface LegendProps {
  label: string;
  layers: LayerItem[];
  selectedYear: number;
  style?: React.CSSProperties;
  isMapIdle?: boolean;
}

const LegendItem: React.FC<{ layer: string; color: string }> = React.memo(
  ({ layer, color }) => {
    const theme = useTheme();
    const { isMobileLayout } = useResponsive();
    const sizingStyles = useMemo(() => getLegendStyles(theme), [theme]);

    const indicatorStyles = useMemo(
      () => ({
        width: isMobileLayout ? theme.spacing(2) : theme.spacing(2.5),
        height: isMobileLayout ? theme.spacing(2) : theme.spacing(2.5),
        mr: isMobileLayout ? theme.spacing(1.25) : theme.spacing(1.75),
        borderRadius: "50%",
        flexShrink: 0,
        border: `1px solid ${theme.palette.divider}`,
        bgcolor: color,
      }),
      [isMobileLayout, theme, color]
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
  ({ layers, label, selectedYear, style, isMapIdle = true }) => {
    const theme = useTheme();
    const { isTabletLayout, isMobileLayout, isDesktopLayout, isXLargeLayout } =
      useResponsive();
    const isMediumOrLargerLayout = isDesktopLayout || isXLargeLayout;

    const titleStyle = useMemo<React.CSSProperties>(
      () => ({
        margin: 0,
        marginBottom: isMapIdle
          ? isMobileLayout
            ? theme.spacing(0.5)
            : isTabletLayout
              ? theme.spacing(0.75)
              : theme.spacing(1.25)
          : 0,
        textAlign: isTabletLayout || isMobileLayout ? "center" : "left",
        width: "100%",
        color: "#2f2f2f",
        fontSize: isMobileLayout ? "0.78rem" : "0.88rem",
        fontWeight: 500,
        lineHeight: 1.25,
        letterSpacing: "0.01em",
      }),
      [isMapIdle, isMobileLayout, isTabletLayout, theme]
    );

    const subtitleStyle = useMemo<React.CSSProperties>(
      () => ({
        margin: 0,
        marginBottom: isMobileLayout
          ? theme.spacing(0.5)
          : isTabletLayout
            ? theme.spacing(1)
            : theme.spacing(2),
        textAlign: isTabletLayout || isMobileLayout ? "center" : "left",
        width: "100%",
        color: theme.palette.text.secondary,
        opacity: 0.9,
        fontSize: isMobileLayout ? "0.78rem" : "0.88rem",
        lineHeight: 1.25,
        fontWeight: 500,
        letterSpacing: "0.01em",
      }),
      [isMobileLayout, isTabletLayout, theme]
    );

    const stackStyles = useMemo(
      () => ({
        spacing: isMobileLayout
          ? theme.spacing(0.5)
          : isTabletLayout
            ? theme.spacing(2.5)
            : isMediumOrLargerLayout
              ? theme.spacing(1.25)
              : theme.spacing(1.5),
        direction: (isMediumOrLargerLayout ? "column" : "row") as
          | "row"
          | "column",
        alignItems: (isTabletLayout || isMobileLayout
          ? "center"
          : "flex-start") as "center" | "flex-start",
        sx: {
          flexWrap: isMediumOrLargerLayout ? "nowrap" : "wrap",
          justifyContent:
            isTabletLayout || isMobileLayout ? "space-evenly" : "flex-start",
          overflowX: isTabletLayout ? "auto" : "visible",
        },
      }),
      [isMobileLayout, isTabletLayout, isMediumOrLargerLayout, theme]
    );

    if (!layers?.length) {
      return null;
    }

    return (
      <Box sx={style} component="section" aria-labelledby="legend-heading">
        <h2 id="legend-heading" style={titleStyle}>
          {label}
        </h2>
        {isMapIdle && (
          <>
            <p style={subtitleStyle}>Time around {selectedYear}</p>
            <Stack {...stackStyles}>
              {layers.map(({ layer, color }) => (
                <LegendItem key={layer} layer={layer} color={color} />
              ))}
            </Stack>
            <AttributionLinks />
          </>
        )}
      </Box>
    );
  }
);

LegendContent.displayName = "LegendContent";
