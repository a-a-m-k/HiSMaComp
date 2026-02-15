import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";
import App from "./App";
import { logger } from "@/utils/logger";

if ("serviceWorker" in navigator && !import.meta.env.DEV) {
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
