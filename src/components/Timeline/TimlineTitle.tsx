import { Typography, TypographyProps } from "@mui/material";

export const TimelineTitle: React.FC<{
  variant: TypographyProps["variant"];
  fontSize: string;
}> = ({ variant, fontSize }) => (
  <Typography
    variant={variant}
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
