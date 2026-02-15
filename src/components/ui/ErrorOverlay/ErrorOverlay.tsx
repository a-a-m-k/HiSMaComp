import React from "react";
import Box from "@mui/material/Box";
import { ErrorAlert } from "@/components/ui/ErrorAlert";
import { Z_INDEX } from "@/constants/ui";

interface ErrorOverlayProps {
  title: string;
  message: string;
  onRetry: () => void;
}

/**
 * Full-screen overlay with an error alert and retry action.
 * Used for data loading and app context errors in the map container.
 */
export const ErrorOverlay: React.FC<ErrorOverlayProps> = ({
  title,
  message,
  onRetry,
}) => (
  <Box
    sx={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: Z_INDEX.ERROR,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      backdropFilter: "blur(4px)",
      padding: 2,
    }}
  >
    <Box sx={{ width: "90%", maxWidth: 600, position: "relative" }}>
      <ErrorAlert title={title} message={message} onRetry={onRetry} />
    </Box>
  </Box>
);
