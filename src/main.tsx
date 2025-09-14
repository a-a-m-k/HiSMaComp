import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    const swPath = import.meta.env.BASE_URL + "hismacomp-service-worker.js";
    navigator.serviceWorker.register(swPath).catch(error => {
      console.warn("Service Worker registration failed:", error);
    });
  });
}

const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(
    React.createElement(StrictMode, null, React.createElement(App))
  );
} else {
  console.error("Failed to find the root element");
}
