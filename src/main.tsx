import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";
import App from "./App";
import { logger } from "@/utils/logger";

// Register service worker immediately to enable early caching
// This allows the SW to intercept requests from the start, improving performance
if ("serviceWorker" in navigator) {
  const swPath = import.meta.env.BASE_URL + "hismacomp-service-worker.js";
  navigator.serviceWorker
    .register(swPath)
    .then(registration => {
      logger.info(
        "Service Worker registered successfully:",
        registration.scope
      );
    })
    .catch(error => {
      logger.warn("Service Worker registration failed:", error);
    });
}

const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
} else {
  logger.error("Failed to find the root element");
}
