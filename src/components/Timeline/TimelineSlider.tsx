import { Slider } from "@mui/material";

interface TimelineSliderProps {
  marks: Array<{ value: number; label: string }>;
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  sx?: any;
}

export const TimelineSlider: React.FC<TimelineSliderProps> = ({
  marks,
  min,
  max,
  value,
  onChange,
  sx,
}) => (
  <Slider
    marks={marks}
    min={min}
    max={max}
    step={null}
    value={value}
    onChange={(_, val) => onChange(val as number)}
    aria-labelledby="year-slider-label"
    valueLabelDisplay="auto"
    sx={{
      ...sx,
    }}
  />
);
