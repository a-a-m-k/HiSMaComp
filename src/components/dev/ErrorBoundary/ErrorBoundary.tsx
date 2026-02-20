import { Component, ErrorInfo, ReactNode } from "react";
import { logger } from "@/utils/logger";
import { ErrorFallback } from "./ErrorFallback";

/**
 * Error boundary: catches render errors in children and shows ErrorFallback or custom fallback.
 * Use fallback to render a custom UI instead of the default ErrorFallback (e.g. inline message).
 */
interface Props {
  children: ReactNode;
  /** Optional custom UI when an error is caught; defaults to ErrorFallback with Reload/Reset. */
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

    if (import.meta.env.DEV) {
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
        <ErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onReload={this.handleReload}
          onReset={this.handleReset}
        />
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
