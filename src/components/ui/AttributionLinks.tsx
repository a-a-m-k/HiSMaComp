import React from "react";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { ATTRIBUTION_LINKS } from "@/constants";
import { SPACING, BORDER_RADIUS } from "@/constants";
import { strings } from "@/locales";
import { getLegendStyles } from "@/constants/sizing";
import { useMemo } from "react";

export const AttributionLinks: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const sizingStyles = useMemo(() => getLegendStyles(theme), [theme]);

  const linkSx = {
    ...sizingStyles.attributionLinks,
    px: theme.spacing(SPACING.XS / 2),
    py: theme.spacing(SPACING.XS / 5),
    borderRadius: BORDER_RADIUS.SMALL,
    transition: theme.custom.transitions.color,
    "&:hover": {
      color: theme.palette.action.hover,
    },
    "&:focus-visible": {
      outline: "none",
      color: theme.custom.colors.textBlack,
      fontWeight: 600,
      textDecoration: "none",
    },
    "&:focus:not(:focus-visible)": {
      outline: "none",
      textDecoration: "none",
    },
    textAlign: "center" as const,
    width: "auto",
    minWidth: 0,
  };

  return (
    <Box
      id="attribution"
      component="nav"
      aria-label={strings.legend.attributionLinksAria}
      sx={{
        display: "flex",
        flexWrap: "wrap",
        gap: isMobile ? theme.spacing(0.25) : theme.spacing(SPACING.XS * 0.6),
        width: "100%",
        mt: isMobile ? theme.spacing(1) : theme.spacing(1.5),
        mb: isMobile ? theme.spacing(0.5) : theme.spacing(SPACING.SM),
        alignItems: "center",
        justifyContent: "center",
        wordBreak: "normal",
        overflowWrap: "normal",
        whiteSpace: "nowrap",
      }}
    >
      {ATTRIBUTION_LINKS.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          target="_blank"
          underline="none"
          rel="noopener noreferrer"
          color="text.primary"
          sx={linkSx}
          tabIndex={-1}
          aria-label={`${label} - ${strings.legend.opensInNewTab}`}
        >
          {label}
        </Link>
      ))}
    </Box>
  );
};

AttributionLinks.displayName = "AttributionLinks";
