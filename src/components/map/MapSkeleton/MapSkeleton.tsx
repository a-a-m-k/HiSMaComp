import React from "react";
import { Box, Skeleton } from "@mui/material";
import { useTheme } from "@mui/material/styles";

export const MapSkeleton: React.FC = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        position: "relative",
        backgroundColor: theme.palette.grey[100],
      }}
    >
      <Skeleton
        variant="rectangular"
        width="100%"
        height="100%"
        animation="wave"
      />
      <Box
        sx={{
          position: "absolute",
          top: 16,
          right: 16,
          width: 200,
        }}
      >
        <Skeleton variant="rectangular" width="100%" height={120} />
      </Box>
      <Box
        sx={{
          position: "absolute",
          bottom: 16,
          left: "50%",
          transform: "translateX(-50%)",
          width: "80%",
          maxWidth: 600,
        }}
      >
        <Skeleton variant="rectangular" width="100%" height={80} />
      </Box>
    </Box>
  );
};
