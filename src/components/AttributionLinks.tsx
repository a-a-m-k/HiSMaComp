import React from "react";
import { Box, Link, useTheme } from "@mui/material";
import { ATTRIBUTION_LINKS } from "@/constants";

export const AttributionLinks: React.FC = () => {
  const theme = useTheme();

  const linkSx = {
    fontSize: theme.typography.pxToRem(8),
    px: 0.25,
    py: 0.1,
    borderRadius: 0.5,
    transition: "color 0.2s, background-color 0.2s",
    "&:hover": {
      color: theme.palette.action.hover,
    },
    textAlign: "center",
    width: "auto",
    minWidth: 0,
  };

  return (
    <Box
      id="attribution"
      component="nav"
      aria-label="Attribution links"
      sx={{
        display: "flex",
        flexWrap: "wrap",
        gap: 0.3,
        width: "100%",
        my: 1,
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
        >
          {label}
        </Link>
      ))}
    </Box>
  );
};

AttributionLinks.displayName = "AttributionLinks";
