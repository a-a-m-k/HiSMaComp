import React, { useCallback, useMemo } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Slider from "@mui/material/Slider";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { alpha, useTheme } from "@mui/material/styles";

import { useApp } from "@/context/AppContext";
import { strings } from "@/locales";
import { TIMELINE_NIGHT_PAPER_SX } from "@/theme/mapTheme";
import { MAP_OVERLAY_LIGHT_PAPER_ALPHA } from "@/theme/mapTokens";

export interface TimelineProps {
  marks: Array<{ value: number; label: string }>;
}

const Timeline: React.FC<TimelineProps> = ({ marks }) => {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));
  const isSmUp = useMediaQuery(theme.breakpoints.up("sm"));
  const isMobileLayout = !isSmUp;
  const isTabletLayout = isSmUp && !isMdUp;
  const { selectedYear, setSelectedYear } = useApp();

  const years = useMemo(() => marks.map(m => m.value), [marks]);

  const labelByYear = useMemo(() => {
    const map: Record<number, string> = {};
    marks.forEach(m => {
      map[m.value] = m.label;
    });
    return map;
  }, [marks]);

  const currentIndex = useMemo(() => {
    const i = years.indexOf(selectedYear);
    return i >= 0 ? i : 0;
  }, [years, selectedYear]);

  const maxIndex = Math.max(0, years.length - 1);

  const handleSliderChange = useCallback(
    (_event: Event, value: number | number[]) => {
      const index = typeof value === "number" ? value : value[0];
      const year = years[index];
      if (year != null) setSelectedYear(year);
    },
    [years, setSelectedYear]
  );

  const accent = theme.palette.info.main;
  const activeText = theme.palette.text.primary;
  const mutedText = theme.palette.text.secondary;
  const neighborMuted = alpha(theme.palette.text.secondary, 0.88);

  return (
    <Box
      id="timeline"
      component="nav"
      role="navigation"
      aria-label={strings.timeline.navigationAria}
      tabIndex={-1}
      sx={{
        position: "fixed",
        bottom: {
          xs: "max(8px, env(safe-area-inset-bottom))",
          sm: 16,
          md: 24,
        },
        left: {
          xs: "max(1rem, env(safe-area-inset-left))",
          sm: "2rem",
          md: "50%",
        },
        right: {
          xs: "max(1rem, env(safe-area-inset-right))",
          sm: "2rem",
          md: "auto",
        },
        transform: { md: "translateX(-50%)" },
        zIndex: theme.custom.zIndex.timeline,
        width: { xs: "auto", md: "auto" },
        maxWidth: { xs: "100%", md: "min(700px, 90%)" },
        minWidth: { md: "min(650px, 90%)" },
      }}
    >
      <Paper
        elevation={0}
        sx={{
          ...(theme.palette.mode === "dark"
            ? {
                ...TIMELINE_NIGHT_PAPER_SX,
                transition: "all 0.3s ease",
                "@media (prefers-reduced-motion: reduce)": {
                  transition: "none",
                },
              }
            : {
                backgroundColor: `${alpha(theme.palette.background.paper, MAP_OVERLAY_LIGHT_PAPER_ALPHA)} !important`,
                border: 1,
                borderColor: "divider",
                borderRadius: 2,
                boxShadow: {
                  xs: theme.custom.shadows.light,
                  md: theme.custom.shadows.heavy,
                },
                transition: "all 0.3s ease",
                "@media (prefers-reduced-motion: reduce)": {
                  transition: "none",
                },
              }),
        }}
      >
        <Box
          sx={{
            px: { xs: 2, sm: 2.5, md: 3 },
            py: { xs: 1.75, sm: 1.5, md: 2 },
          }}
        >
          <Box
            sx={{ mb: { xs: 1.25, sm: 1, md: 1.25 } }}
            role="group"
            aria-label={strings.timeline.centurySliderAria}
          >
            <Slider
              value={currentIndex}
              onChange={handleSliderChange}
              min={0}
              max={maxIndex}
              step={1}
              aria-label={strings.timeline.selectYearAria}
              aria-valuetext={
                labelByYear[selectedYear] ??
                `${selectedYear}${strings.timeline.yearSuffix}`
              }
              aria-valuenow={currentIndex}
              aria-valuemin={0}
              aria-valuemax={maxIndex}
              sx={{
                color: accent,
                height: { xs: 8, sm: 6, md: 6 },
                py: { xs: 1, sm: 0 },
                "& .MuiSlider-thumb":
                  theme.palette.mode === "dark"
                    ? {
                        bgcolor: theme.palette.text.secondary,
                        border: `2px solid ${theme.palette.background.default}`,
                        boxShadow: "none",
                        width: { xs: 28, sm: 16, md: 16 },
                        height: { xs: 28, sm: 16, md: 16 },
                        transition: "all 0.18s ease",
                        "&:hover, &:active": {
                          boxShadow: "0 0 0 6px rgba(59,130,246,0.15)",
                        },
                        "&:focus-visible": {
                          outline: `3px solid ${accent}`,
                          outlineOffset: "2px",
                        },
                        "@media (prefers-reduced-motion: reduce)": {
                          transition: "none",
                        },
                      }
                    : {
                        bgcolor: accent,
                        border: `3px solid ${theme.palette.background.paper}`,
                        boxShadow: `0 3px 10px ${alpha(accent, 0.38)}`,
                        width: { xs: 28, sm: 22, md: 24 },
                        height: { xs: 28, sm: 22, md: 24 },
                        transition: "all 0.2s ease",
                        "&:hover, &:active": {
                          boxShadow: `0 4px 14px ${alpha(accent, 0.5)}`,
                        },
                        "&:focus-visible": {
                          outline: `3px solid ${accent}`,
                          outlineOffset: "2px",
                        },
                        "@media (prefers-reduced-motion: reduce)": {
                          transition: "none",
                        },
                      },
                "& .MuiSlider-track": {
                  bgcolor: accent,
                  height: { xs: 7, sm: 6, md: 6 },
                  border: "none",
                  boxShadow:
                    theme.palette.mode === "dark"
                      ? "none"
                      : `0 1px 4px ${alpha(accent, 0.28)}`,
                },
                "& .MuiSlider-rail": {
                  bgcolor:
                    theme.palette.mode === "dark"
                      ? theme.palette.grey[800]
                      : theme.palette.grey[300],
                  height: { xs: 7, sm: 6, md: 6 },
                  opacity: theme.palette.mode === "dark" ? 0.2 : 1,
                },
              }}
            />
          </Box>

          {isMdUp && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "flex-start",
                gap: 0.5,
                flexWrap: "wrap",
              }}
            >
              {years.map((year, index) => (
                <Button
                  key={year}
                  onClick={() => setSelectedYear(year)}
                  variant="text"
                  sx={{
                    fontSize: 11,
                    lineHeight: 1.3,
                    px: 0.75,
                    py: 0.5,
                    minWidth: "auto",
                    borderRadius: 1.5,
                    textTransform: "none",
                    transition: "all 0.2s ease",
                    ...(currentIndex === index
                      ? {
                          color: activeText,
                          fontWeight: 700,
                          bgcolor: alpha(accent, 0.14),
                          boxShadow: `0 1px 4px ${alpha(accent, 0.2)}`,
                        }
                      : {
                          color: mutedText,
                          fontWeight: 600,
                          "&:hover": {
                            color: theme.palette.text.primary,
                            bgcolor: alpha(accent, 0.08),
                            transform: "translateY(-1px)",
                          },
                        }),
                    "@media (prefers-reduced-motion: reduce)": {
                      "&:hover": { transform: "none" },
                    },
                  }}
                >
                  {labelByYear[year]}
                </Button>
              ))}
            </Box>
          )}

          {isTabletLayout && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: 0.75,
                flexWrap: "wrap",
              }}
            >
              {years.map((year, index) => {
                const isActive = currentIndex === index;
                const isNeighbor = Math.abs(currentIndex - index) === 1;
                if (!isActive && !isNeighbor) return null;

                return (
                  <Button
                    key={year}
                    onClick={() => setSelectedYear(year)}
                    variant="text"
                    sx={{
                      fontSize: 10.5,
                      lineHeight: 1.3,
                      px: 1.25,
                      py: 0.5,
                      minWidth: "auto",
                      borderRadius: 1.5,
                      textTransform: "none",
                      transition: "all 0.2s ease",
                      ...(isActive
                        ? {
                            color: activeText,
                            fontWeight: 700,
                            bgcolor: alpha(accent, 0.14),
                            boxShadow: `0 1px 4px ${alpha(accent, 0.2)}`,
                          }
                        : {
                            color: neighborMuted,
                            fontWeight: 500,
                            "&:hover": {
                              color: theme.palette.text.primary,
                              bgcolor: alpha(accent, 0.08),
                            },
                          }),
                    }}
                  >
                    {labelByYear[year]}
                  </Button>
                );
              })}
            </Box>
          )}

          {isMobileLayout && (
            <Box
              sx={{
                textAlign: "center",
                bgcolor: alpha(accent, 0.12),
                borderRadius: 2,
                py: 1.5,
                px: 2,
                border: "1px solid",
                borderColor: alpha(accent, 0.28),
                boxShadow: theme.custom.shadows.light,
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: mutedText,
                  fontWeight: 600,
                  mb: 0.5,
                  display: "block",
                  fontSize: 10.5,
                  letterSpacing: "0.5px",
                  textTransform: "uppercase",
                }}
              >
                {strings.timeline.currentPeriod}
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: activeText,
                  lineHeight: 1.2,
                  fontSize: 17,
                  letterSpacing: "-0.01em",
                }}
              >
                {labelByYear[selectedYear] ?? String(selectedYear)}
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default Timeline;
