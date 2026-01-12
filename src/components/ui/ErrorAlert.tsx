import React from "react";
import { Alert, AlertTitle, Button, Typography } from "@mui/material";
import { Refresh } from "@mui/icons-material";
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
        {message}
      </Typography>
    </Alert>
  );
};
