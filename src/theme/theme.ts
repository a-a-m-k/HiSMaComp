import { createTheme, alpha } from "@mui/material/styles";
import type { Theme } from "@mui/material/styles";
import { grey, common } from "@mui/material/colors";

import {
  MAP_NIGHT_BACKGROUND_DEFAULT,
  MAP_NIGHT_BORDER_SUBTLE,
  MAP_NIGHT_DIVIDER,
  MAP_NIGHT_PAPER,
  MAP_NIGHT_TEXT_PRIMARY,
  MAP_NIGHT_TEXT_SECONDARY,
  MAP_NIGHT_TYPOGRAPHY_ROOT,
} from "./mapTokens";

// Blue primary for clear affordances (buttons, links); grey for text and backgrounds so the map stays the focus.
export const lightTheme = createTheme({
  palette: {
    primary: {
      /** Slightly desaturated vs. default `blue[800]` so UI reads calmer next to the map. */
      main: "#1a4d7a",
      dark: "#143a5c",
      light: "#e6edf5",
    },
    secondary: {
      main: grey[900],
    },
    info: {
      main: "#5a7890",
      contrastText: common.white,
    },
    background: {
      default: grey[100],
      paper: common.white,
    },
    text: {
      primary: grey[900],
      secondary: grey[700],
    },
    action: {
      hover: grey[700],
      disabled: grey[400],
    },
    common,
  },
  typography: {
    fontFamily: [
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Inter",
      "Roboto",
      '"Helvetica Neue"',
      "Arial",
      "sans-serif",
    ].join(","),
    h1: {
      fontSize: "2.5rem",
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: "-0.02em",
    },
    h2: {
      fontSize: "2rem",
      fontWeight: 700,
      lineHeight: 1.3,
      letterSpacing: "-0.01em",
    },
    h3: {
      fontSize: "1.75rem",
      fontWeight: 600,
      lineHeight: 1.3,
      letterSpacing: "-0.01em",
    },
    h4: {
      fontSize: "1.5rem",
      fontWeight: 600,
      lineHeight: 1.4,
      letterSpacing: "-0.005em",
    },
    h5: {
      fontSize: "1.25rem",
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h6: {
      fontSize: "1.125rem",
      fontWeight: 600,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: "1rem",
      lineHeight: 1.6,
      fontWeight: 400,
      letterSpacing: "0.01em",
    },
    body2: {
      fontSize: "0.9375rem",
      lineHeight: 1.6,
      fontWeight: 400,
      letterSpacing: "0.01em",
    },
    subtitle1: {
      fontSize: "1.0625rem",
      lineHeight: 1.5,
      fontWeight: 500,
      letterSpacing: "0.005em",
    },
    subtitle2: {
      fontSize: "0.9375rem",
      lineHeight: 1.5,
      fontWeight: 500,
      letterSpacing: "0.005em",
    },
    button: {
      textTransform: "none",
      fontWeight: 600,
      letterSpacing: "0.025em",
      fontSize: "0.9375rem",
    },
    caption: {
      fontSize: "0.8125rem",
      lineHeight: 1.5,
      fontWeight: 400,
      letterSpacing: "0.01em",
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: "12px 24px",
          fontWeight: 500,
          textTransform: "none",
          boxShadow: "none",
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            transform: "translateY(-1px)",
          },
          "&:active": {
            transform: "translateY(0)",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: ({ theme }: { theme: Theme }) => ({
          borderRadius: 16,
          boxShadow: theme.custom.shadows.medium,
          backgroundColor: alpha(theme.palette.background.paper, 0.95),
          backdropFilter: "blur(10px)",
          border: `1px solid ${alpha(theme.palette.divider, 0.55)}`,
          transition: theme.custom.transitions.normal,
          "&:hover": {
            boxShadow: theme.custom.shadows.heavy,
          },
        }),
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: ({ theme }: { theme: Theme }) => ({
          backgroundColor: alpha(theme.palette.background.paper, 0.95),
          borderRadius: 4, // BORDER_RADIUS.CONTROL (4px) - Match MapLibre control container
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
          backdropFilter: "blur(16px) saturate(180%)",
          border: `1px solid ${alpha(theme.palette.divider, 0.35)}`,
          transition: theme.custom.transitions.slow,
        }),
        elevation1: {
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
        },
        elevation2: {
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
        },
        elevation3: {
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.1)",
        },
      },
    },
    MuiSlider: {
      styleOverrides: {
        thumb: ({ theme }: { theme: Theme }) => ({
          borderRadius: "50%",
          width: 20,
          height: 20,
          border: `2px solid ${theme.palette.background.paper}`,
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          transition: "box-shadow 0.2s ease-in-out",
          "&:hover": {
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
          },
          "&:focus": {
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
          },
          [theme.breakpoints.down("md")]: {
            width: 24,
            height: 24,
          },
          [theme.breakpoints.down("sm")]: {
            width: 28,
            height: 28,
          },
        }),
        track: {
          borderRadius: 6,
          height: 6,
        },
        rail: {
          borderRadius: 6,
          height: 6,
          opacity: 0.3,
        },
        markLabel: ({ theme }) => ({
          fontSize: theme.typography.body2.fontSize,
          fontWeight: 500,
          marginTop: theme.spacing(1),
          textAlign: "center",
          color: theme.palette.text.secondary,
          whiteSpace: "nowrap",
          paddingLeft: theme.spacing(0.5),
          paddingRight: theme.spacing(0.5),
          [theme.breakpoints.down("lg")]: {
            fontSize: theme.typography.caption.fontSize,
            marginTop: theme.spacing(0.75),
            paddingLeft: theme.spacing(0.375),
            paddingRight: theme.spacing(0.375),
          },
          [theme.breakpoints.down("md")]: {
            fontSize: "0.65rem",
            marginTop: theme.spacing(0.5),
            paddingLeft: theme.spacing(0.25),
            paddingRight: theme.spacing(0.25),
          },
          [theme.breakpoints.down("sm")]: {
            fontSize: "0.6875rem",
            marginTop: theme.spacing(0.25),
            paddingLeft: theme.spacing(0.125),
            paddingRight: theme.spacing(0.125),
          },
        }),
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          fontFamily: "inherit",
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: () => ({
          borderRadius: 4,
          transition: "all 0.2s ease-in-out",
          "&:focus": {
            outline: "none",
            boxShadow: "none",
          },
          "&:focus-visible": {
            outline: "none",
          },
        }),
      },
    },
  },
  custom: {
    colors: {
      focus: "#5c6bb8",
      focusHover: "#575fa8",
      focusShadow: "rgba(92, 107, 184, 0.32)",
      focusShadowInset: "rgba(92, 107, 184, 0.16)",
      textBlack: "#000000",
      tooltipBackground: "rgba(0, 0, 0, 0.87)",
      tooltipText: common.white,
      buttonBackground: common.white,
      buttonHover: grey[100],
      buttonActive: grey[200],
      focusBlue: "rgba(72, 118, 165, 0.95)",
      controlBorder: "rgba(0, 0, 0, 0.1)",
    },
    shadows: {
      light: "0 1px 3px rgba(0,0,0,0.1)",
      medium: "0 2px 12px rgba(0,0,0,0.08)",
      heavy: "0 4px 20px rgba(0,0,0,0.15)",
      tooltip: "0 2px 8px rgba(0, 0, 0, 0.15)",
      buttonHover: "0 8px 24px rgba(0, 0, 0, 0.15)",
      buttonDefault: "0 4px 16px rgba(0, 0, 0, 0.1)",
      buttonActive: "0 2px 8px rgba(0,0,0,0.1)",
      controlOutline: "0 0 0 2px rgba(0, 0, 0, 0.1)",
    },
    transitions: {
      fast: "all 0.15s ease-in-out",
      normal: "all 0.2s ease-in-out",
      slow: "all 0.3s ease-in-out",
      /** Resize layout (e.g. legend/timeline wrapper width); keep in sync with narrow-layout UX. */
      layoutWidth: "width 0.3s ease-out",
      /** Overlay buttons (screenshot, zoom) show/hide fade. */
      overlayFade: "opacity 0.2s ease-out, visibility 0.2s ease-out",
      color: "color 0.2s, background-color 0.2s",
      opacity: "opacity 0.2s ease-in-out",
      transform: "transform 0.2s ease-in-out",
      tooltip: "opacity 0.2s ease, visibility 0.2s ease",
      border: "border-color 0.1s ease",
    },
    zIndex: {
      map: 0,
      mapContainerFocus: 1000,
      mapContainerFocusOverlay: 99999,
      legend: 1000,
      timeline: 1100,
      floatingButton: 1200,
      modal: 1300,
      tooltip: 10000,
      tooltipArrow: 10001,
      performanceMonitor: 9999,
      focusedMarker: 10000,
      focusedMarkerLabel: 10001,
      error: 99999,
    },
    tooltip: {
      padding: "6px 10px",
      borderRadius: "4px", // BORDER_RADIUS.CONTROL (4px) - String format for CSS template literals
      fontSize: "0.75rem",
      arrowSize: 5,
      offset: 8,
      arrowOffset: 12,
    },
    legend: {
      colors: {
        title: grey[900],
        scaleHeading: grey[600],
        layerLabel: grey[800],
      },
      borders: {
        paper: `1px solid ${alpha(grey[400], 0.45)}`,
        sectionDivider: `1px solid ${alpha(grey[400], 0.32)}`,
        layerIndicator: `2px solid ${alpha(grey[500], 0.42)}`,
      },
      shadows: {
        paper: "0 4px 20px rgba(0, 0, 0, 0.08)",
        layerDot: "0 1px 3px rgba(0, 0, 0, 0.1)",
      },
      collapseIconButton: {
        size: 32,
        iconFontSize: 20,
      },
    },
  },
});

/** Dark MUI theme for night basemap; merged with `lightTheme` via `createTheme`. */
export const darkTheme = createTheme(lightTheme, {
  palette: {
    mode: "dark",
    primary: {
      main: "#3b82f6",
      dark: "#2563eb",
      light: "#60a5fa",
    },
    secondary: {
      main: grey[400],
    },
    info: {
      main: "#62a5ff",
      contrastText: common.white,
    },
    background: {
      default: MAP_NIGHT_BACKGROUND_DEFAULT,
      paper: MAP_NIGHT_PAPER,
    },
    text: {
      primary: MAP_NIGHT_TEXT_PRIMARY,
      secondary: MAP_NIGHT_TEXT_SECONDARY,
    },
    divider: MAP_NIGHT_DIVIDER,
    action: {
      hover: alpha("#ffffff", 0.06),
      disabled: alpha("#ffffff", 0.3),
    },
    common,
  },
  shape: {
    borderRadius: 14,
  },
  typography: {
    fontFamily: '"Inter", sans-serif',
    fontSize: 13,
    h6: {
      fontSize: 14,
      fontWeight: 600,
      letterSpacing: 0.2,
    },
    body2: {
      color: MAP_NIGHT_TEXT_SECONDARY,
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: ({ theme }: { theme: Theme }) => ({
          backgroundColor: theme.palette.background.paper,
          backgroundImage: "none",
          backdropFilter: "blur(12px)",
          border: `1px solid ${MAP_NIGHT_BORDER_SUBTLE}`,
          boxShadow:
            "0 10px 30px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.02)",
          borderRadius: theme.shape.borderRadius,
          transition: theme.custom.transitions.slow,
        }),
      },
    },
    MuiCard: {
      styleOverrides: {
        root: ({ theme }: { theme: Theme }) => ({
          borderRadius: 16,
          backgroundColor: alpha("#1e293b", 0.72),
          border: `1px solid ${MAP_NIGHT_BORDER_SUBTLE}`,
          boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
          transition: theme.custom.transitions.normal,
          "&:hover": {
            boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
          },
        }),
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: 10,
          padding: "6px 12px",
          fontWeight: 500,
          boxShadow: "none",
          transition: "all 0.18s ease",
          "&:hover": {
            boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
            transform: "translateY(-1px)",
          },
          "&:active": {
            transform: "translateY(0)",
          },
        },
        text: {
          backgroundColor: "transparent",
        },
        outlined: {
          backgroundColor: "transparent",
        },
        contained: ({ theme }: { theme: Theme }) => ({
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          "&:hover": {
            backgroundColor: "rgba(148,163,184,0.12)",
            boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
            transform: "translateY(-1px)",
          },
        }),
        containedPrimary: ({ theme }: { theme: Theme }) => ({
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
          "&:hover": {
            backgroundColor: theme.palette.primary.dark,
            boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
            transform: "translateY(-1px)",
          },
        }),
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: MAP_NIGHT_TEXT_SECONDARY,
          transition: "all 0.18s ease",
          "&:hover": {
            backgroundColor: "rgba(148,163,184,0.08)",
          },
          "&:focus": {
            outline: "none",
            boxShadow: "none",
          },
          "&:focus-visible": {
            outline: "none",
          },
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          color: MAP_NIGHT_TYPOGRAPHY_ROOT,
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: "rgba(148,163,184,0.08)",
        },
      },
    },
    MuiSlider: {
      styleOverrides: {
        root: {
          color: "#3b82f6",
        },
        rail: {
          borderRadius: 6,
          height: 6,
          opacity: 0.2,
        },
        track: {
          border: "none",
        },
        thumb: ({ theme }: { theme: Theme }) => ({
          borderRadius: "50%",
          width: 16,
          height: 16,
          backgroundColor: MAP_NIGHT_TEXT_SECONDARY,
          border: `2px solid ${MAP_NIGHT_BACKGROUND_DEFAULT}`,
          boxShadow: "none",
          transition: "all 0.18s ease",
          "&:hover": {
            boxShadow: "0 0 0 6px rgba(59,130,246,0.15)",
          },
          "&:focus": {
            boxShadow: "0 0 0 6px rgba(59,130,246,0.15)",
          },
          [theme.breakpoints.down("md")]: {
            width: 24,
            height: 24,
          },
          [theme.breakpoints.down("sm")]: {
            width: 28,
            height: 28,
          },
        }),
      },
    },
  },
  custom: {
    colors: {
      focus: "#60a5fa",
      focusHover: "#3b82f6",
      focusShadow: "rgba(59, 130, 246, 0.35)",
      focusShadowInset: "rgba(59, 130, 246, 0.18)",
      textBlack: MAP_NIGHT_TEXT_PRIMARY,
      tooltipBackground: "#334155",
      tooltipText: MAP_NIGHT_TEXT_PRIMARY,
      buttonBackground: "#334155",
      buttonHover: "#475569",
      buttonActive: "#64748b",
      focusBlue: "#3b82f6",
      controlBorder: "rgba(148,163,184,0.12)",
    },
    shadows: {
      light: "0 1px 2px rgba(0,0,0,0.5)",
      medium: "0 4px 16px rgba(0,0,0,0.5)",
      heavy: "0 20px 40px rgba(0,0,0,0.5)",
      tooltip: "0 4px 16px rgba(0,0,0,0.6)",
      buttonHover: "0 8px 24px rgba(0,0,0,0.6)",
      buttonDefault: "0 4px 16px rgba(0,0,0,0.5)",
      buttonActive: "0 2px 8px rgba(0,0,0,0.6)",
      controlOutline: "0 0 0 1px rgba(148,163,184,0.12)",
    },
    legend: {
      colors: {
        title: MAP_NIGHT_TEXT_PRIMARY,
        scaleHeading: MAP_NIGHT_TEXT_SECONDARY,
        layerLabel: MAP_NIGHT_TEXT_PRIMARY,
      },
      borders: {
        paper: `1px solid ${MAP_NIGHT_BORDER_SUBTLE}`,
        sectionDivider: "1px solid rgba(148,163,184,0.06)",
        layerIndicator: "2px solid rgba(148,163,184,0.22)",
      },
      shadows: {
        paper: "0 10px 30px rgba(0,0,0,0.4)",
        layerDot: "0 1px 4px rgba(0,0,0,0.5)",
      },
      collapseIconButton: {
        size: 32,
        iconFontSize: 20,
      },
    },
  },
});

export default lightTheme;
