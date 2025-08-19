import { Typography } from "@mui/material";

export const TimelineTitle: React.FC<{ variant: string; fontSize: string }> = ({
  variant,
  fontSize,
}) => (
  <Typography
    variant={variant as any}
    component="h6"
    align="center"
    sx={{
      textAlign: "center",
      mb: 1,
      color: "text.primary",
      fontSize,
      userSelect: "none",
    }}
  >
    Timeline
  </Typography>
);
