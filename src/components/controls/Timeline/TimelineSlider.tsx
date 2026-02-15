import React from "react";
import Slider from "@mui/material/Slider";
import useMediaQuery from "@mui/material/useMediaQuery";
import { SxProps, Theme, useTheme } from "@mui/material/styles";

interface TimelineSliderProps {
  marks: Array<{ value: number; label: string }>;
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  sx?: SxProps<Theme>;
}

export const TimelineSlider: React.FC<TimelineSliderProps> = ({
  marks,
  min,
  max,
  value,
  onChange,
  sx,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Slider
      marks={marks}
      min={min}
      max={max}
      step={null}
      value={value}
      onChange={(_, val) => onChange(val as number)}
      aria-label="Select historical year"
      aria-valuetext={`${value} AD`}
      valueLabelDisplay="auto"
      valueLabelFormat={value => `${value} AD`}
      tabIndex={0}
      sx={{
        mt: isMobile ? 0 : 1,
        mb: isMobile ? 0 : 1,
        mx: isMobile ? 0 : 1,
        "& .MuiSlider-markLabel": {
          marginTop: isMobile ? "-5px" : "0px",
        },
        ...sx,
      }}
    />
  );
};
