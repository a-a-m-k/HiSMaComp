import React, { useMemo } from "react";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";

import { MobileSheet, MediumSheet, DesktopCard } from "./Timeline.styles";
import { TimelineSlider } from "./TimelineSlider";
import { getMobileLabelledMarks } from "./utils";
import { useApp } from "@/context/AppContext";
import { useResponsive } from "@/hooks/ui";
import { getTimelineStyles } from "@/constants/sizing";

interface TimelineProps {
  marks: Array<{ value: number; label: string }>;
}

const Timeline: React.FC<TimelineProps> = ({ marks }) => {
  const { selectedYear, setSelectedYear } = useApp();
  const { isMobile, isTablet, theme } = useResponsive();
  const sizingStyles = useMemo(() => getTimelineStyles(theme), [theme]);

  const min = marks[0]?.value ?? 0;
  const max = marks[marks.length - 1]?.value ?? 100;

  const mobileMarks = useMemo(
    () => (isMobile ? getMobileLabelledMarks(marks, selectedYear) : marks),
    [isMobile, marks, selectedYear]
  );

  const titleStyles = {
    ...sizingStyles.title,
    mb: 0,
    color: theme.palette.text.primary,
  };

  if (isMobile) {
    return (
      <MobileSheet
        id="timeline"
        aria-labelledby="timeline-heading-mobile"
        tabIndex={-1}
      >
        <Typography
          id="timeline-heading-mobile"
          component="h2"
          className="sr-only"
        >
          Historical Timeline
        </Typography>
        <TimelineSlider
          marks={mobileMarks}
          min={min}
          max={max}
          value={selectedYear}
          onChange={setSelectedYear}
        />
      </MobileSheet>
    );
  }

  if (isTablet) {
    return (
      <MediumSheet
        id="timeline"
        aria-labelledby="timeline-heading"
        tabIndex={-1}
      >
        <Typography
          id="timeline-heading"
          component="h2"
          variant="h6"
          sx={titleStyles}
        >
          Historical Timeline
        </Typography>
        <Divider sx={{ mb: 0.2, width: "100%", opacity: 0.6 }} />
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

  return (
    <DesktopCard id="timeline" aria-labelledby="timeline-heading" tabIndex={-1}>
      <Typography
        id="timeline-heading"
        component="h2"
        variant="h5"
        sx={titleStyles}
      >
        Historical Timeline
      </Typography>
      <TimelineSlider
        marks={marks}
        min={min}
        max={max}
        value={selectedYear}
        onChange={setSelectedYear}
      />
    </DesktopCard>
  );
};

export default Timeline;
