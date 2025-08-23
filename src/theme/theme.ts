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
    fontFamily: ["Roboto", "Arial", "sans-serif"].join(","),
    h1: {
      fontSize: "2.5rem",
      fontWeight: 500,
      lineHeight: 1.2,
      letterSpacing: "-0.01562em",
    },
    h2: {
      fontSize: "2rem",
      fontWeight: 500,
      lineHeight: 1.3,
      letterSpacing: "-0.00833em",
    },
    body1: {
      fontSize: "1rem",
      lineHeight: 1.5,
    },
    button: {
      textTransform: "none",
      fontWeight: 500,
      letterSpacing: "0.02857em",
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: "8px 16px",
          background: grey[100],
          boxShadow: "none",
          transition: "background 0.2s",
          "&:hover": {
            background: grey[200],
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: "0px 1px 3px rgba(0,0,0,0.2)",
          backgroundColor: "rgba(255,255,255,0.8)",
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: common.white,
          opacity: 0.96,
          boxShadow: "0px 2px 8px rgba(0,0,0,0.08)",
        },
      },
    },
    MuiSlider: {
      styleOverrides: {
        thumb: ({ theme }) => ({
          borderRadius: "50%",
          width: 20,
          height: 20,
          [theme.breakpoints.down("md")]: {
            width: 24,
            height: 24,
          },
          [theme.breakpoints.down("sm")]: {
            width: 26,
            height: 26,
          },
        }),
        track: {
          borderRadius: 4,
        },
        rail: {
          borderRadius: 4,
        },
        markLabel: ({ theme }) => {
          return {
            fontSize: theme.typography.pxToRem(16),
            marginTop: 2,
            textAlign: "center",

            [theme.breakpoints.down("md")]: {
              fontSize: theme.typography.pxToRem(14),
              marginTop: 2,
            },
            [theme.breakpoints.down("sm")]: {
              fontSize: theme.typography.pxToRem(14),
              marginTop: 1,
            },
          };
        },
      },
    },
  },
});

export default theme;
