import { Component, ErrorInfo, ReactNode } from "react";
import { Box, Typography, Alert, AlertTitle } from "@mui/material";
import { Error as ErrorIcon } from "@mui/icons-material";
import { Button } from "@/components/ui/common";
import { SPACING, TRANSITIONS, Z_INDEX } from "@/constants/ui";
import { logger } from "@/utils/logger";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error("Error Boundary caught an error:", error, errorInfo);

    if (process.env.NODE_ENV === "development") {
      logger.debug("Error Details:", {
        error: error.toString(),
        errorInfo,
        componentStack: errorInfo.componentStack,
      });
    }

    this.setState({
      error,
      errorInfo,
    });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

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
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Here&rsquo;s what happened:
            </Typography>

            {process.env.NODE_ENV === "development" && this.state.error && (
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
                  {this.state.error.toString()}
                </Typography>
              </Box>
            )}
          </Alert>

          <Box sx={{ display: "flex", gap: SPACING.LG }}>
            <Button
              variant="contained"
              color="primary"
              onClick={this.handleReset}
              aria-label="Try again to reset error and continue"
            >
              Try Again
            </Button>
            <Button
              variant="outlined"
              onClick={this.handleReload}
              aria-label="Reload page to recover from error"
            >
              Reload Page
            </Button>
          </Box>

          {process.env.NODE_ENV === "development" && (
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

    return this.props.children;
  }
}

export default ErrorBoundary;
