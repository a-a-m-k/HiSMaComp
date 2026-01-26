import React from "react";
import {
  Card as MuiCard,
  CardProps as MuiCardProps,
  CardContent,
  CardHeader,
} from "@mui/material";
import { BORDER_RADIUS, SHADOWS, TRANSITIONS, SPACING } from "@/constants/ui";

interface CardProps extends Omit<MuiCardProps, "elevation"> {
  title?: string;
  subtitle?: string;
  elevation?: number;
  padding?: "none" | "small" | "medium" | "large";
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  elevation = 3,
  padding = "medium",
  children,
  sx,
  ...props
}) => {
  const paddingMap = {
    none: 0,
    small: SPACING.SM,
    medium: SPACING.LG,
    large: SPACING.XL,
  };

  const cardSx = {
    borderRadius: BORDER_RADIUS.LARGE,
    boxShadow: SHADOWS.MEDIUM,
    transition: TRANSITIONS.NORMAL,
    "&:hover": {
      boxShadow: SHADOWS.HEAVY,
    },
    ...sx,
  };

  const contentSx = {
    padding: paddingMap[padding],
  };

  return (
    <MuiCard elevation={elevation} sx={cardSx} {...props}>
      {(title || subtitle) && (
        <CardHeader
          title={title}
          subheader={subtitle}
          sx={{ paddingBottom: 0 }}
        />
      )}
      <CardContent sx={contentSx}>{children}</CardContent>
    </MuiCard>
  );
};

export default Card;
