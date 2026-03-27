import React, { useCallback, useState } from "react";
import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUp from "@mui/icons-material/KeyboardArrowUp";
import { alpha, useTheme } from "@mui/material/styles";

import { AttributionLinks } from "@/components/ui";
import { useResponsive } from "@/hooks/ui";
import { LayerItem } from "@/common/types";
import { LEGEND_APP_TITLE } from "@/constants";
import { strings } from "@/locales";
import { getLegendYearLabel, LEGEND_CONTENT_SPACING } from "./legendHelpers";
import { LegendItem } from "./LegendItem";
import { useLegendContentStyles } from "./useLegendContentStyles";

export interface LegendProps {
  label: string;
  layers: LayerItem[];
  selectedYear: number;
  style?: React.CSSProperties;
  isMapIdle?: boolean;
}

export const LegendContent: React.FC<LegendProps> = React.memo(
  ({ layers, label, selectedYear, style, isMapIdle = true }) => {
    const theme = useTheme();
    const [isExpanded, setIsExpanded] = useState(true);
    const { isTabletLayout, isMobileLayout, isDesktopLayout, isXLargeLayout } =
      useResponsive();
    const layout: Parameters<typeof useLegendContentStyles>[1] = {
      isMobileLayout,
      isTabletLayout,
      isMediumOrLargerLayout: isDesktopLayout || isXLargeLayout,
    };
    const { appTitleStyle, titleStyle, subtitleStyle, stackStyles } =
      useLegendContentStyles(theme, layout, isMapIdle);

    const { borders, collapseIconButton } = theme.custom.legend;
    const infoAccent = theme.palette.info.main;

    const toggleExpanded = useCallback(() => {
      setIsExpanded(v => !v);
    }, []);

    if (!layers?.length) {
      return null;
    }

    return (
      <Box sx={style} component="section" aria-labelledby="legend-title">
        <Box
          component="header"
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 1,
            px: LEGEND_CONTENT_SPACING.paddingX,
            py: LEGEND_CONTENT_SPACING.headerPaddingY,
          }}
        >
          <Box
            sx={{
              flex: 1,
              minWidth: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "stretch",
              gap: LEGEND_CONTENT_SPACING.headerGap,
            }}
          >
            <Typography id="legend-title" component="h1" sx={appTitleStyle}>
              {LEGEND_APP_TITLE}
            </Typography>
            {isMapIdle && (
              <Typography
                component="p"
                aria-live="polite"
                aria-atomic="true"
                sx={subtitleStyle}
              >
                {getLegendYearLabel(selectedYear)}
              </Typography>
            )}
          </Box>
          <IconButton
            type="button"
            size="small"
            onClick={toggleExpanded}
            aria-expanded={isExpanded}
            aria-controls="legend-collapsible"
            aria-label={
              isExpanded
                ? strings.legend.collapseLegend
                : strings.legend.expandLegend
            }
            sx={{
              width: collapseIconButton.size,
              height: collapseIconButton.size,
              flexShrink: 0,
              color: infoAccent,
              transition: theme.custom.transitions.color,
              "&:hover": {
                bgcolor: alpha(infoAccent, 0.1),
              },
              "@media (prefers-reduced-motion: reduce)": {
                transition: "none",
              },
            }}
          >
            {isExpanded ? (
              <KeyboardArrowUp
                sx={{ fontSize: collapseIconButton.iconFontSize }}
              />
            ) : (
              <KeyboardArrowDown
                sx={{ fontSize: collapseIconButton.iconFontSize }}
              />
            )}
          </IconButton>
        </Box>

        <Collapse
          id="legend-collapsible"
          in={isExpanded}
          timeout={300}
          sx={{
            "@media (prefers-reduced-motion: reduce)": {
              transition: "none",
            },
          }}
        >
          <Box
            role="region"
            aria-label={strings.legend.scaleDetailsAria}
            sx={{
              borderTop: borders.sectionDivider,
              px: LEGEND_CONTENT_SPACING.paddingX,
              pt: LEGEND_CONTENT_SPACING.sectionPaddingTop,
              pb: isMapIdle
                ? LEGEND_CONTENT_SPACING.mainPaddingBottom
                : LEGEND_CONTENT_SPACING.mainPaddingBottomSolo,
            }}
          >
            <Typography component="h2" id="legend-heading" sx={titleStyle}>
              {label}
            </Typography>
            {isMapIdle && (
              <Stack {...stackStyles}>
                {layers.map(({ layer, color }) => (
                  <LegendItem key={layer} layer={layer} color={color} />
                ))}
              </Stack>
            )}
          </Box>

          {isMapIdle && (
            <Box
              component="footer"
              sx={{
                borderTop: borders.sectionDivider,
                px: LEGEND_CONTENT_SPACING.paddingX,
                pt: LEGEND_CONTENT_SPACING.sectionPaddingTop,
                pb: LEGEND_CONTENT_SPACING.footerPaddingBottom,
                "& #attribution": {
                  mt: 0,
                  mb: 0,
                },
              }}
            >
              <AttributionLinks
                rowAlignment={
                  isMobileLayout || isTabletLayout ? "center" : "left"
                }
              />
            </Box>
          )}
        </Collapse>
      </Box>
    );
  }
);

LegendContent.displayName = "LegendContent";
