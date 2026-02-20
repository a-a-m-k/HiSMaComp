import type { ErrorInfo } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import ErrorIcon from "@mui/icons-material/Error";
import { Button } from "@/components/ui/common";
import { SPACING, TRANSITIONS, Z_INDEX } from "@/constants/ui";

export interface ErrorFallbackProps {
  error?: Error;
  errorInfo?: ErrorInfo;
  onReload: () => void;
  onReset: () => void;
}

/**
 * Default fallback UI for ErrorBoundary: full-screen overlay with message and actions.
 */
export function ErrorFallback({
  error,
  errorInfo,
  onReload,
  onReset,
}: ErrorFallbackProps) {
  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: Z_INDEX.ERROR,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        backdropFilter: "blur(4px)",
        padding: SPACING.XL,
        textAlign: "center",
        transition: TRANSITIONS.NORMAL,
      }}
    >
      <Alert
        severity="error"
        icon={<ErrorIcon />}
        sx={{ mb: SPACING.XL, maxWidth: 600, width: "90%" }}
      >
        <AlertTitle>Oops! Something went wrong</AlertTitle>
        {error && (
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {error.message || error.toString()}
          </Typography>
        )}
        {!error && (
          <Typography variant="body2" color="text.secondary" gutterBottom>
            An unexpected error occurred. Please try reloading the page.
          </Typography>
        )}

        {import.meta.env.DEV && error && (
          <Box
            sx={{
              mt: SPACING.LG,
              p: SPACING.LG,
              bgcolor: "grey.100",
              borderRadius: 1,
            }}
          >
            <Typography
              variant="caption"
              component="pre"
              sx={{
                fontFamily: "monospace",
                fontSize: "0.75rem",
                textAlign: "left",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {error.toString()}
              {errorInfo && (
                <>
                  {"\n\n"}
                  Component Stack:
                  {errorInfo.componentStack}
                </>
              )}
            </Typography>
          </Box>
        )}
      </Alert>

      <Box sx={{ display: "flex", gap: SPACING.LG }}>
        <Button
          variant="contained"
          color="primary"
          onClick={onReset}
          aria-label="Try again to reset error and continue"
        >
          Try Again
        </Button>
        <Button
          variant="outlined"
          onClick={onReload}
          aria-label="Reload page to recover from error"
        >
          Reload Page
        </Button>
      </Box>

      {import.meta.env.DEV && (
        <Typography
          variant="caption"
          sx={{ mt: SPACING.LG, color: "text.secondary" }}
        >
          💡 Check the console for more details (F12 → Console)
        </Typography>
      )}
    </Box>
  );
}
