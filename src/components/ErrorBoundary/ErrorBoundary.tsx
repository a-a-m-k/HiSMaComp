import { Component, ErrorInfo, ReactNode } from "react";
import { Box, Typography, Button, Alert } from "@mui/material";

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
    console.error("🚨 Error Boundary caught an error:", error, errorInfo);

    // Log to console for debugging in pet projects
    console.group("🔍 Error Details");
    console.error("Error:", error);
    console.error("Error Info:", errorInfo);
    console.error("Component Stack:", errorInfo.componentStack);
    console.groupEnd();

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
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "50vh",
            p: 3,
            textAlign: "center",
          }}
        >
          <Alert severity="error" sx={{ mb: 3, maxWidth: 600 }}>
            <Typography variant="h6" gutterBottom>
              🚨 Oops! Something went wrong
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Here&rsquo;s what happened:
            </Typography>

            {process.env.NODE_ENV === "development" && this.state.error && (
              <Box sx={{ mt: 2, p: 2, bgcolor: "grey.100", borderRadius: 1 }}>
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

          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={this.handleReset}
            >
              Try Again
            </Button>
            <Button variant="outlined" onClick={this.handleReload}>
              Reload Page
            </Button>
          </Box>

          {process.env.NODE_ENV === "development" && (
            <Typography
              variant="caption"
              sx={{ mt: 2, color: "text.secondary" }}
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
