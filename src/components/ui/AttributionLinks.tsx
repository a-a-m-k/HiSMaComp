import React from "react";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import {
  ATTRIBUTION_LINKS,
  type AttributionLink,
  LEGEND_ATTRIBUTION_TEXT_SX,
} from "@/constants";
import { strings } from "@/locales";

const inlineLinkSx = {
  color: "inherit",
  fontSize: "inherit",
  lineHeight: "inherit",
  fontWeight: "inherit",
  textDecoration: "none",
  "&:hover": {
    color: "#64748b",
  },
  "&:focus-visible": {
    outline: "2px solid",
    outlineColor: "#64748b",
    outlineOffset: "2px",
    borderRadius: "2px",
  },
} as const;

function AttributionAnchor({ link }: { link: AttributionLink }) {
  return (
    <Link
      href={link.href}
      target="_blank"
      rel="noopener noreferrer"
      underline="none"
      sx={inlineLinkSx}
      aria-label={`${link.label} - ${strings.legend.opensInNewTab}`}
    >
      {link.label}
    </Link>
  );
}

export interface AttributionLinksProps {
  /**
   * How the block sits in the footer. On the legend: centered for tablet/mobile,
   * left for desktop (`lg+`). Desktop uses a 2×2 grid aligned to this edge.
   */
  rowAlignment?: "center" | "left";
}

export const AttributionLinks: React.FC<AttributionLinksProps> = ({
  rowAlignment,
}) => {
  const theme = useTheme();
  /** Tablet and below: one centered line; desktop (`lg+`): 2×2 grid, left by default. */
  const isLgDown = useMediaQuery(theme.breakpoints.down("lg"));
  const align = rowAlignment ?? (isLgDown ? "center" : "left");

  return (
    <Box
      id="attribution"
      component="nav"
      aria-label={strings.legend.attributionLinksAria}
      sx={{
        width: "100%",
        mt: 0,
        mb: 0,
      }}
    >
      {isLgDown ? (
        <Typography
          component="p"
          sx={{
            ...LEGEND_ATTRIBUTION_TEXT_SX,
            m: 0,
            textAlign: "center",
          }}
        >
          {ATTRIBUTION_LINKS.map((link, i) => (
            <React.Fragment key={link.href}>
              {i > 0 ? " " : null}
              <AttributionAnchor link={link} />
            </React.Fragment>
          ))}
        </Typography>
      ) : (
        <Box
          sx={{
            display: "flex",
            justifyContent: align === "center" ? "center" : "flex-start",
            width: "100%",
          }}
        >
          <Box
            component="div"
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(2, max-content)",
              columnGap: 2,
              rowGap: 0.25,
              ...LEGEND_ATTRIBUTION_TEXT_SX,
              textAlign: "left",
            }}
          >
            {ATTRIBUTION_LINKS.map(link => (
              <AttributionAnchor key={link.href} link={link} />
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
};

AttributionLinks.displayName = "AttributionLinks";
