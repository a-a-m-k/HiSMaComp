import React, { useState } from "react";
import { Box, Button, Link, useTheme } from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { ATTRIBUTION_LINKS } from "@/constants";

const AttributionLinksGrid: React.FC = () => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
        gap: 1,
        width: "100%",
        mb: 1,
        justifyItems: "center",
        alignItems: "center",
        wordBreak: "normal",
        overflowWrap: "normal",
        whiteSpace: "nowrap",
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
            "&:hover": { color: theme.palette.action.hover },
            textAlign: "center",
            width: "100%",
          }}
        >
          {link.label}
        </Link>
      ))}
    </Box>
  );
};

const ToggleButton: React.FC<{
  expanded: boolean;
  onClick: () => void;
}> = ({ expanded, onClick }) => (
  <Button
    size="medium"
    variant="text"
    onClick={onClick}
    sx={{
      minWidth: 32,
      p: 0.5,
      backgroundColor: "transparent",
      color: "primary.main",
    }}
    aria-label={expanded ? "Show less" : "Show more"}
  >
    {expanded ? (
      <KeyboardArrowUpIcon fontSize="small" />
    ) : (
      <KeyboardArrowDownIcon fontSize="small" />
    )}
  </Button>
);

export const LegendAttributionLinks: React.FC = () => {
  const [showMore, setShowMore] = useState(false);

  return (
    <Box
      id="attribution"
      sx={{
        marginTop: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        boxSizing: "border-box",
        backgroundColor: "background.paper",
      }}
    >
      {showMore ? (
        <>
          <AttributionLinksGrid />
          <Box sx={{ textAlign: "center" }}>
            <ToggleButton expanded onClick={() => setShowMore(false)} />
          </Box>
        </>
      ) : (
        <ToggleButton expanded={false} onClick={() => setShowMore(true)} />
      )}
    </Box>
  );
};

LegendAttributionLinks.displayName = "LegendAttribution";
