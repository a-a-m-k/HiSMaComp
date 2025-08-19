import { Slider } from "@mui/material";

interface TimelineSliderProps {
  marks: Array<{ value: number; label: string }>;
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  markLabelStyle: any;
  sx?: any;
}

export const TimelineSlider: React.FC<TimelineSliderProps> = ({
  marks,
  min,
  max,
  value,
  onChange,
  markLabelStyle,
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
      "& .MuiSlider-markLabel": markLabelStyle,
      "& .MuiSlider-thumb": {
        transition: "box-shadow 0.2s",
        "&:hover, &.Mui-focusVisible": {
          boxShadow: (theme) => theme.shadows[4],
        },
      },
      "& .MuiSlider-valueLabel": {
        fontWeight: 500,
        color: (theme) => theme.palette.primary.contrastText,
        borderRadius: 2,
        px: 1,
        py: 0.5,
      },
    }}
  />
);
