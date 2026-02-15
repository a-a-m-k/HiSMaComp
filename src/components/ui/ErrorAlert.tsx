import React from "react";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Refresh from "@mui/icons-material/Refresh";
import { SPACING } from "@/constants/ui";

interface ErrorAlertProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  severity?: "error" | "warning" | "info";
  retryLabel?: string;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({
  title = "Something went wrong",
  message,
  onRetry,
  severity = "error",
  retryLabel = "Try Again",
}) => {
  return (
    <Alert
      severity={severity}
      sx={{
        mb: SPACING.MD,
        maxWidth: 600,
        mx: "auto",
      }}
      action={
        onRetry && (
          <Button
            color="inherit"
            size="small"
            onClick={onRetry}
            startIcon={<Refresh />}
            aria-label={`${retryLabel} - ${title}`}
            sx={{ mt: 1 }}
          >
            {retryLabel}
          </Button>
        )
      }
    >
      <AlertTitle>{title}</AlertTitle>
      <Typography variant="body2" component="div">
        {message ||
          "An unknown error occurred. Please check the browser console for details."}
      </Typography>
    </Alert>
  );
};
