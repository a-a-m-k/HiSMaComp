import type { SxProps, Theme } from "@mui/material/styles";

/** Legend card shell merged in dark mode (`getLegendPaperSurface`). */
export const LEGEND_NIGHT_SHELL_SX: SxProps<Theme> = {
  borderRadius: "14px",
  backdropFilter: "blur(14px)",
  border: "1px solid rgba(148,163,184,0.08)",
  boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
};

/** Timeline bottom bar shell in dark mode (Paper `sx`). */
export const TIMELINE_NIGHT_PAPER_SX: SxProps<Theme> = {
  borderRadius: "20px",
  backdropFilter: "blur(16px)",
  border: "1px solid rgba(148,163,184,0.08)",
  boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
};
