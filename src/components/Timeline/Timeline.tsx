import React, { memo } from "react";
import { useMediaQuery, Divider } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  MobileSheet,
  MediumSheet,
  DesktopCard,
  getSliderMarkLabelStyle,
} from "./Timeline.styles";
import { TimelineTitle } from "./TimlineTitle";
import { TimelineSlider } from "./TimelineSlider";
import { getMobileLabelledMarks } from "./utils";

interface TimelineProps {
  setSelectedYear: (year: number) => void;
  selectedYear: number;
  marks: Array<{ value: number; label: string }>;
}

const Timeline: React.FC<TimelineProps> = memo(
  ({ setSelectedYear, selectedYear, marks }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const isMedium = useMediaQuery(theme.breakpoints.between("sm", "md"));
    const min = marks[0]?.value ?? 0;
    const max = marks[marks.length - 1]?.value ?? 100;

    // Responsive styles
    const sliderCommon = {
      mx: "auto",
      color: theme.palette.primary.main,
      "& .MuiSlider-track, & .MuiSlider-rail": {
        transition: "background 0.2s",
        borderRadius: 0,
      },
      "& .MuiSlider-mark": {
        backgroundColor: theme.palette.grey[400],
        opacity: 0.8,
      },
      "& .MuiSlider-thumb": {
        width: 40,
        height: 40,
        border: `2px solid ${theme.palette.primary.main}`,
      },
    };

    if (isMobile) {
      const sliderMarks = getMobileLabelledMarks(marks, selectedYear);
      return (
        <MobileSheet id="timeline">
          <TimelineTitle
            variant="subtitle1"
            fontSize={theme.typography.pxToRem(16)}
          />
          <TimelineSlider
            marks={sliderMarks}
            min={min}
            max={max}
            value={selectedYear}
            onChange={setSelectedYear}
            markLabelStyle={getSliderMarkLabelStyle(theme, "mobile")}
            sx={{
              ...sliderCommon,
              width: "95%",
              "& .MuiSlider-thumb": {
                boxShadow: theme.shadows[2],
              },
              "& .MuiSlider-track, & .MuiSlider-rail": {
                height: 5,
              },
              "& .MuiSlider-mark": {
                height: 3,
                width: 2,
                borderRadius: 2,
              },
            }}
          />
        </MobileSheet>
      );
    }

    if (isMedium) {
      return (
        <MediumSheet id="timeline">
          <TimelineTitle variant="h5" fontSize={theme.typography.pxToRem(20)} />
          <Divider sx={{ mb: 2, width: "100%" }} />
          <TimelineSlider
            marks={marks}
            min={min}
            max={max}
            value={selectedYear}
            onChange={setSelectedYear}
            markLabelStyle={getSliderMarkLabelStyle(theme, "medium")}
            sx={{
              ...sliderCommon,
              width: "98%",
              "& .MuiSlider-thumb": {
                boxShadow: theme.shadows[3],
              },
              "& .MuiSlider-track, & .MuiSlider-rail": {
                height: 8,
              },
              "& .MuiSlider-mark": {
                height: 5,
                width: 4,
                borderRadius: 2,
              },
            }}
          />
        </MediumSheet>
      );
    }

    // Desktop
    return (
      <DesktopCard id="timeline">
        <TimelineTitle variant="h6" fontSize={theme.typography.pxToRem(20)} />
        <TimelineSlider
          marks={marks}
          min={min}
          max={max}
          value={selectedYear}
          onChange={setSelectedYear}
          markLabelStyle={getSliderMarkLabelStyle(theme, "desktop")}
          sx={{
            ...sliderCommon,
            width: "100%",
            "& .MuiSlider-thumb": {
              boxShadow: theme.shadows[4],
            },
            "& .MuiSlider-track, & .MuiSlider-rail": {
              height: 10,
            },
            "& .MuiSlider-mark": {
              height: 7,
              width: 5,
              borderRadius: 7,
            },
          }}
        />
      </DesktopCard>
    );
  },
);

export default Timeline;
