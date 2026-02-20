import React, { useMemo } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import { useTheme } from "@mui/material/styles";

import { AttributionLinks } from "@/components/ui";
import { useResponsive } from "@/hooks/ui";
import { LayerItem } from "@/common/types";
import { getLegendStyles } from "@/constants/sizing";
import { useLegendContentStyles } from "./useLegendContentStyles";

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
    const layout: Parameters<typeof useLegendContentStyles>[1] = {
      isMobileLayout,
      isTabletLayout,
      isMediumOrLargerLayout: isDesktopLayout || isXLargeLayout,
    };
    const { titleStyle, subtitleStyle, stackStyles } = useLegendContentStyles(
      theme,
      layout,
      isMapIdle
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
