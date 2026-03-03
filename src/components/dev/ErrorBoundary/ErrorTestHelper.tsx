import React from "react";

/**
 * Test helper component for E2E ErrorBoundary testing.
 * Only active in development mode or when ?testError=true query parameter is present.
 */
export const ErrorTestHelper: React.FC = () => {
  if (!import.meta.env.DEV) {
    return null;
  }

  const params = new URLSearchParams(window.location.search);
  const shouldThrow = params.get("testError") === "true";

  if (shouldThrow) {
    throw new Error("Test error for ErrorBoundary E2E testing");
  }

  return null;
};
