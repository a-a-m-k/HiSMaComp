import React from "react";
import { Theme } from "@mui/material/styles";
import { logger } from "@/utils/logger";

export type BreakpointSize = "xs" | "sm" | "md" | "lg" | "xl";
export type TypographyType = "title" | "subtitle" | "itemLabel";

export type ResponsiveFontSizes = {
  xs?: string;
  sm: string;
  md: string;
  lg: string;
  xl?: string;
};

export type ComponentStyles = {
  title: React.CSSProperties;
  subtitle?: React.CSSProperties;
  itemText?: React.CSSProperties;
  label?: React.CSSProperties;
  attributionLinks?: React.CSSProperties;
};

export const SIZING_CONSTANTS = {
  ATTRIBUTION_LINK_RATIO: 0.75,
  XL_SIZE_MULTIPLIER: 1.5,
  BASE_FONT_SIZE: "0.75rem",
  XL_MIN_WIDTH: "450px",
  FONT_SIZES: {
    ICON_DEFAULT: "1.5rem",
    ICON_XL: "2.25rem",
  },
} as const;

const BASE_FONT_SIZES = {
  TITLE: {
    sm: "0.875rem",
    md: "0.9375rem",
    lg: "1.0625rem",
    xl: "1.25rem",
  },
  SUBTITLE: {
    sm: "0.8125rem",
    md: "0.875rem",
    lg: "1rem",
    xl: "1.1875rem",
  },
  ITEM_LABEL: {
    sm: "0.875rem",
    md: "0.8125rem",
    lg: "0.9375rem",
    xl: "1.1rem",
  },
} as const;

export const FONT_SIZES = {
  TITLE: BASE_FONT_SIZES.TITLE,
  SUBTITLE: BASE_FONT_SIZES.SUBTITLE,
  LEGEND_ITEM: BASE_FONT_SIZES.ITEM_LABEL,
  TIMELINE_LABEL: BASE_FONT_SIZES.ITEM_LABEL,
} as const;

export const getAttributionLinkSize = (
  legendItemSize: string,
  ratio: number = SIZING_CONSTANTS.ATTRIBUTION_LINK_RATIO
): string => {
  const numericValue = parseFloat(legendItemSize);
  if (isNaN(numericValue)) {
    logger.warn(`Invalid font size provided: ${legendItemSize}`);
    return SIZING_CONSTANTS.BASE_FONT_SIZE;
  }

  const unit = legendItemSize.replace(numericValue.toString(), "");
  return `${numericValue * ratio}${unit}`;
};

export const getAttributionLinkSizes = (): ResponsiveFontSizes => ({
  xs: getAttributionLinkSize(SIZING_CONSTANTS.BASE_FONT_SIZE),
  sm: getAttributionLinkSize(FONT_SIZES.LEGEND_ITEM.sm),
  md: getAttributionLinkSize(FONT_SIZES.LEGEND_ITEM.md),
  lg: getAttributionLinkSize(FONT_SIZES.LEGEND_ITEM.lg),
  xl: getAttributionLinkSize(FONT_SIZES.LEGEND_ITEM.xl),
});

const BASE_TYPOGRAPHY = {
  WEIGHTS: {
    TITLE: 600,
    SUBTITLE: 500,
    ITEM_LABEL: 500,
  },
  LETTER_SPACING: {
    TITLE: "0.015em",
    SUBTITLE: "0.015em",
    ITEM_LABEL: "0.01em",
  },
} as const;

export const FONT_WEIGHTS = {
  TITLE: BASE_TYPOGRAPHY.WEIGHTS.TITLE,
  SUBTITLE: BASE_TYPOGRAPHY.WEIGHTS.SUBTITLE,
  LEGEND_ITEM: BASE_TYPOGRAPHY.WEIGHTS.ITEM_LABEL,
  TIMELINE_LABEL: BASE_TYPOGRAPHY.WEIGHTS.ITEM_LABEL,
} as const;

export const LETTER_SPACING = {
  TITLE: BASE_TYPOGRAPHY.LETTER_SPACING.TITLE,
  SUBTITLE: BASE_TYPOGRAPHY.LETTER_SPACING.SUBTITLE,
  LEGEND_ITEM: BASE_TYPOGRAPHY.LETTER_SPACING.ITEM_LABEL,
  TIMELINE_LABEL: BASE_TYPOGRAPHY.LETTER_SPACING.ITEM_LABEL,
} as const;

export const getResponsiveFontSize = (sizes: ResponsiveFontSizes) => ({
  xs: sizes.xs || sizes.sm,
  sm: sizes.sm,
  md: sizes.md,
  lg: sizes.lg,
  xl: sizes.xl || sizes.lg,
});

const generateTypographyStyle = (type: TypographyType, theme: Theme) => {
  const sizeMap = {
    title: FONT_SIZES.TITLE,
    subtitle: FONT_SIZES.SUBTITLE,
    itemLabel: FONT_SIZES.LEGEND_ITEM,
  };

  const weightMap = {
    title: FONT_WEIGHTS.TITLE,
    subtitle: FONT_WEIGHTS.SUBTITLE,
    itemLabel: FONT_WEIGHTS.LEGEND_ITEM,
  };

  const spacingMap = {
    title: LETTER_SPACING.TITLE,
    subtitle: LETTER_SPACING.SUBTITLE,
    itemLabel: LETTER_SPACING.LEGEND_ITEM,
  };

  return {
    fontSize: getResponsiveFontSize(
      sizeMap[type]
    ) as unknown as React.CSSProperties["fontSize"],
    fontWeight: weightMap[type],
    letterSpacing: spacingMap[type],
  };
};

export const generateComponentStyles = (
  theme: Theme,
  includeAttributionLinks: boolean = false
): ComponentStyles => {
  const styles: ComponentStyles = {
    title: generateTypographyStyle("title", theme),
    subtitle: generateTypographyStyle("subtitle", theme),
    itemText: generateTypographyStyle("itemLabel", theme),
    label: generateTypographyStyle("itemLabel", theme),
  };

  if (includeAttributionLinks) {
    styles.attributionLinks = {
      fontSize: getResponsiveFontSize(
        getAttributionLinkSizes()
      ) as unknown as React.CSSProperties["fontSize"],
    };
  }

  return styles;
};

export const getLegendStyles = (theme: Theme): ComponentStyles =>
  generateComponentStyles(theme, true);

export const getTimelineStyles = (theme: Theme): ComponentStyles =>
  generateComponentStyles(theme, false);
