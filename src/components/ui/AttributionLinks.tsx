import React from "react";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import {
  ATTRIBUTION_LINKS,
  type AttributionLink,
  getAttributionLinkInlineSx,
  getLegendAttributionTypographySx,
} from "@/constants";
import { strings } from "@/locales";

function AttributionAnchor({ link }: { link: AttributionLink }) {
  const theme = useTheme();
  return (
    <Link
      href={link.href}
      target="_blank"
      rel="noopener noreferrer"
      underline="none"
      sx={getAttributionLinkInlineSx(theme)}
      aria-label={`${link.label} - ${strings.legend.opensInNewTab}`}
    >
      {link.label}
    </Link>
  );
}

function AttributionLine({ links }: { links: readonly AttributionLink[] }) {
  const theme = useTheme();
  return (
    <Typography
      component="p"
      sx={{
        ...getLegendAttributionTypographySx(theme),
        m: 0,
      }}
    >
      {links.map((link, i) => (
        <React.Fragment key={link.href}>
          {i > 0 ? " " : null}
          <AttributionAnchor link={link} />
        </React.Fragment>
      ))}
    </Typography>
  );
}

export interface AttributionLinksProps {
  /**
   * How the block sits in the footer on `lg+`. Below `lg` (mobile through `md`), attribution is
   * always one centered line regardless of this prop.
   */
  rowAlignment?: "center" | "left";
}

/** Two grouped rows for large screens: Stadia + Stamen, then OpenMapTiles + OpenStreetMap. */
const ATTRIBUTION_ROW_1 = ATTRIBUTION_LINKS.slice(0, 2);
const ATTRIBUTION_ROW_2 = ATTRIBUTION_LINKS.slice(2, 4);

export const AttributionLinks: React.FC<AttributionLinksProps> = ({
  rowAlignment,
}) => {
  const theme = useTheme();
  /** Mobile + tablet + md: single centered line; `lg+`: two lines, left by default. */
  const isLgDown = useMediaQuery(theme.breakpoints.down("lg"));
  const alignLgUp = rowAlignment ?? "left";

  const navShellProps = {
    component: "nav" as const,
    "aria-label": strings.legend.attributionLinksAria,
    "data-legend-attribution": "",
  };

  if (isLgDown) {
    return (
      <Box
        {...navShellProps}
        sx={{
          width: "100%",
          mt: 0,
          mb: 0,
          textAlign: "center",
        }}
      >
        <AttributionLine links={ATTRIBUTION_LINKS} />
      </Box>
    );
  }

  return (
    <Box
      {...navShellProps}
      sx={{
        width: "100%",
        mt: 0,
        mb: 0,
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: alignLgUp === "center" ? "center" : "flex-start",
          gap: 0.25,
          width: "100%",
        }}
      >
        <Box
          sx={{
            width: "100%",
            textAlign: alignLgUp,
          }}
        >
          <AttributionLine links={ATTRIBUTION_ROW_1} />
        </Box>
        <Box
          sx={{
            width: "100%",
            textAlign: alignLgUp,
          }}
        >
          <AttributionLine links={ATTRIBUTION_ROW_2} />
        </Box>
      </Box>
    </Box>
  );
};

AttributionLinks.displayName = "AttributionLinks";
