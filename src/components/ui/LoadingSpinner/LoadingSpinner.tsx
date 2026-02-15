import React from "react";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";

interface LoadingSpinnerProps {
  message?: string;
  size?: number;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = "Processing data...",
  size = 48,
}) => {
  const theme = useTheme();

  return (
    <Box
      role="status"
      aria-live="polite"
      sx={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 3,
        zIndex: 1000,
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(4px)",
      }}
    >
      <CircularProgress
        size={size}
        thickness={4}
        aria-hidden="true"
        sx={{
          color: theme.palette.primary.main,
        }}
      />
      <Typography
        variant="body1"
        color="text.primary"
        sx={{
          textAlign: "center",
          fontWeight: 500,
          letterSpacing: "0.02em",
        }}
      >
        {message}
      </Typography>
    </Box>
  );
};

export default LoadingSpinner;
