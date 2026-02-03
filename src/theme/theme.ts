import { createTheme } from "@mui/material/styles";
import { blue, grey, common } from "@mui/material/colors";

const theme = createTheme({
  palette: {
    primary: {
      main: blue[800],
      dark: blue[900],
      light: blue[100],
    },
    secondary: {
      main: grey[900],
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
        root: {
          borderRadius: 16,
          boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
          backgroundColor: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255,255,255,0.2)",
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: () => ({
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          borderRadius: 4, // BORDER_RADIUS.CONTROL (4px) - Match MapLibre control container
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
          backdropFilter: "blur(16px) saturate(180%)",
          border: "1px solid rgba(255, 255, 255, 0.4)",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
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
        thumb: ({ theme }) => ({
          borderRadius: "50%",
          width: 20,
          height: 20,
          border: "2px solid white",
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
      focus: "#646cff",
      focusHover: "#535bf2",
      focusShadow: "rgba(100, 108, 255, 0.4)",
      focusShadowInset: "rgba(100, 108, 255, 0.2)",
      textBlack: "#000000",
      tooltipBackground: "rgba(0, 0, 0, 0.87)",
      tooltipText: common.white,
      buttonBackground: common.white,
      buttonHover: grey[100],
      buttonActive: grey[200],
      focusBlue: "rgba(0, 150, 255, 1)",
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
  },
});

export default theme;
