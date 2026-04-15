import React, {
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUp from "@mui/icons-material/KeyboardArrowUp";
import { alpha, useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

import { AttributionLinks } from "@/components/ui";
import { useResponsive, useViewport } from "@/hooks/ui";
import { LayerItem } from "@/common/types";
import { LEGEND_APP_TITLE } from "@/constants";
import { strings } from "@/locales";
import {
  onLegendScreenshotExpand,
  onLegendScreenshotRestore,
} from "@/components/controls/ScreenshotButton/utils";
import { getLegendYearLabel, LEGEND_CONTENT_SPACING } from "./legendHelpers";
import { MapResetViewButton } from "@/components/controls/MapResetViewButton/MapResetViewButton";
import { MapStyleToggle } from "@/components/map/MapView/MapStyleToggle";
import { LegendItem } from "./LegendItem";
import { useLegendContentStyles } from "./useLegendContentStyles";

const ScreenshotButtonLazy = React.lazy(
  () => import("@/components/controls/ScreenshotButton/ScreenshotButton")
);

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
    /** Divider above “No data” only on large screens; md and below keep one list. */
    const splitNoDataBand = useMediaQuery(theme.breakpoints.up("lg"));
    const [isExpanded, setIsExpanded] = useState(true);
    const { isTablet } = useViewport();
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

    const isExpandedRef = useRef(isExpanded);
    const expandedBeforeScreenshotRef = useRef<boolean | null>(null);
    useEffect(() => {
      isExpandedRef.current = isExpanded;
    }, [isExpanded]);

    useEffect(() => {
      const onExpandForScreenshot = () => {
        expandedBeforeScreenshotRef.current = isExpandedRef.current;
        setIsExpanded(true);
      };
      const onRestoreAfterScreenshot = () => {
        const prev = expandedBeforeScreenshotRef.current;
        if (prev !== null) {
          setIsExpanded(prev);
          expandedBeforeScreenshotRef.current = null;
        }
      };
      const cleanupExpand = onLegendScreenshotExpand(onExpandForScreenshot);
      const cleanupRestore = onLegendScreenshotRestore(
        onRestoreAfterScreenshot
      );
      return () => {
        cleanupExpand();
        cleanupRestore();
      };
    }, []);

    if (!layers?.length) {
      return null;
    }

    const populationLayers = layers.filter(l => l.variant !== "noData");
    const noDataLayers = layers.filter(l => l.variant === "noData");

    const headerPadding = {
      px: LEGEND_CONTENT_SPACING.paddingX,
      py: LEGEND_CONTENT_SPACING.headerPaddingY,
    };

    const legendTitleBlock = (
      <>
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
      </>
    );

    const collapseControl = (
      <IconButton
        id="legend-collapse-button"
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
          <KeyboardArrowUp sx={{ fontSize: collapseIconButton.iconFontSize }} />
        ) : (
          <KeyboardArrowDown
            sx={{ fontSize: collapseIconButton.iconFontSize }}
          />
        )}
      </IconButton>
    );

    /** Phone + tablet: balanced columns so title stays visually centered vs. trailing controls. */
    const useBalancedLegendHeader = isMobileLayout || isTablet;

    return (
      <Box sx={style} component="section" aria-labelledby="legend-title">
        {useBalancedLegendHeader ? (
          <Box
            component="header"
            sx={{
              display: "grid",
              gridTemplateColumns:
                "minmax(0, 1fr) minmax(0, auto) minmax(0, 1fr)",
              alignItems: "flex-start",
              columnGap: 1,
              ...headerPadding,
            }}
          >
            <Box aria-hidden sx={{ minWidth: 0 }} />
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "flex-start",
                textAlign: "center",
                minWidth: 0,
                maxWidth: "100%",
                gap: LEGEND_CONTENT_SPACING.headerGap,
              }}
            >
              {legendTitleBlock}
            </Box>
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: 0.5,
                flexShrink: 0,
                flexWrap: "nowrap",
              }}
            >
              {isTablet && (
                <>
                  <Suspense fallback={null}>
                    <ScreenshotButtonLazy variant="inline" />
                  </Suspense>
                  <MapResetViewButton variant="inline" />
                  <MapStyleToggle variant="inline" />
                </>
              )}
              {collapseControl}
            </Box>
          </Box>
        ) : (
          <Box
            component="header"
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 1,
              ...headerPadding,
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
              {legendTitleBlock}
            </Box>
            {collapseControl}
          </Box>
        )}

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
            {isMapIdle &&
              (splitNoDataBand ? (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    width: "100%",
                  }}
                >
                  {populationLayers.length > 0 && (
                    <Stack {...stackStyles}>
                      {populationLayers.map(({ layer, color }) => (
                        <LegendItem key={layer} layer={layer} color={color} />
                      ))}
                    </Stack>
                  )}
                  {noDataLayers.length > 0 && (
                    <Box
                      sx={{
                        mt:
                          populationLayers.length > 0 ? theme.spacing(1.5) : 0,
                        borderTop: borders.sectionDivider,
                        pt: LEGEND_CONTENT_SPACING.sectionPaddingTop,
                      }}
                    >
                      <Stack {...stackStyles}>
                        {noDataLayers.map(({ layer, color }) => (
                          <LegendItem key={layer} layer={layer} color={color} />
                        ))}
                      </Stack>
                    </Box>
                  )}
                </Box>
              ) : (
                <Stack {...stackStyles}>
                  {layers.map(({ layer, color }) => (
                    <LegendItem key={layer} layer={layer} color={color} />
                  ))}
                </Stack>
              ))}
          </Box>

          {isMapIdle && (
            <Box
              component="footer"
              sx={{
                borderTop: borders.sectionDivider,
                px: LEGEND_CONTENT_SPACING.paddingX,
                pt: LEGEND_CONTENT_SPACING.sectionPaddingTop,
                pb: LEGEND_CONTENT_SPACING.footerPaddingBottom,
                "& [data-legend-attribution]": {
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
