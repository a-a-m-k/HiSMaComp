import React, { useState } from "react";
import { Box, Button, Link, Stack, useTheme } from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

const ATTRIBUTION_LINKS = [
  { href: "https://stadiamaps.com/", label: "© Stadia Maps" },
  { href: "https://stamen.com/", label: "© Stamen Design" },
  { href: "https://openmaptiles.org/", label: "© OpenMapTiles" },
  {
    href: "https://www.openstreetmap.org/copyright",
    label: "© OpenStreetMap",
  },
];

export const LegendAttributionLinks: React.FC = () => {
  const theme = useTheme();
  const [showMore, setShowMore] = useState(false);

  return (
    <Box
      id="attribution"
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        boxSizing: "border-box",
        backgroundColor: "background.paper",
      }}
    >
      {!showMore ? (
        <Button
          size="medium"
          variant="text"
          onClick={() => setShowMore(true)}
          sx={{
            minWidth: 32,
            p: 0.5,
            backgroundColor: "transparent",
            color: "primary.main",
          }}
          aria-label="Show more"
        >
          <KeyboardArrowDownIcon fontSize="small" />
        </Button>
      ) : (
        <>
          <Stack
            direction="row"
            spacing={1}
            sx={{
              alignItems: "center",
              justifyContent: "center",
              flexWrap: "wrap",
              rowGap: 0.5,
              mb: 1,
            }}
          >
            {ATTRIBUTION_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                target="_blank"
                underline="none"
                rel="noopener noreferrer"
                color="text.primary"
                sx={{
                  fontSize: theme.typography.pxToRem(12),
                  px: 0.5,
                  py: 0.25,
                  borderRadius: 0.5,
                  transition: "color 0.2s, background-color 0.2s",
                  "&:hover": {
                    color: theme.palette.action.hover,
                  },
                }}
              >
                {link.label}
              </Link>
            ))}
          </Stack>
          <Box sx={{ textAlign: "center" }}>
            <Button
              size="medium"
              variant="text"
              onClick={() => setShowMore(false)}
              sx={{
                minWidth: 32,
                p: 0.5,
                backgroundColor: "transparent",
                color: "primary.main",
              }}
              aria-label="Show less"
            >
              <KeyboardArrowUpIcon fontSize="small" />
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
};

LegendAttributionLinks.displayName = "LegendAttribution";
