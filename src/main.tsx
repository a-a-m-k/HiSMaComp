import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";
import App from "./App";
import { logger } from "@/utils/logger";

const deferSentryInit = () => {
  const loadSentry = () => {
    import("./instrument").catch(error => {
      logger.warn("Deferred Sentry init failed:", error);
    });
  };

  if (typeof window === "undefined") return;

  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(() => loadSentry(), { timeout: 4000 });
    return;
  }

  globalThis.setTimeout(loadSentry, 1200);
};

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

const sentryEnabledInDev = import.meta.env.VITE_SENTRY_ENABLE_IN_DEV === "true";
if (import.meta.env.DEV && sentryEnabledInDev) {
  import("./instrument").catch(error => {
    logger.warn("Sentry init failed in dev mode:", error);
  });
} else if (!import.meta.env.DEV) {
  deferSentryInit();
}

window.addEventListener("unhandledrejection", event => {
  logger.error("Unhandled promise rejection:", event.reason);
  if (import.meta.env.DEV && event.reason != null) {
    logger.debug("Rejection detail:", event.reason);
  }
});

const rootElement = document.getElementById("root");
if (rootElement) {
  const app = <App />;
  createRoot(rootElement).render(<StrictMode>{app}</StrictMode>);
} else {
  logger.error("Failed to find the root element");
  const fallback = document.createElement("div");
  fallback.id = "root-fallback";
  fallback.style.cssText =
    "display:flex;align-items:center;justify-content:center;min-height:100vh;padding:1rem;font-family:system-ui,sans-serif;text-align:center;background:#f5f5f5;color:#212121;";
  const message = document.createElement("p");
  message.textContent =
    'App failed to load: root element not found. Check that index.html has an element with id="root".';
  fallback.appendChild(message);
  document.body.appendChild(fallback);
}
