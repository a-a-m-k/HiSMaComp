import React, { memo } from "react";
import { useMediaQuery, Divider } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { MobileSheet, MediumSheet, DesktopCard } from "./Timeline.styles";
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
        />
      </DesktopCard>
    );
  }
);

export default Timeline;
