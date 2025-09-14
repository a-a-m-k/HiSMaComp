import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { visualizer } from "rollup-plugin-visualizer";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    visualizer({
      filename: "dist/bundle-analysis.html",
      open: true,
      gzipSize: true,
      brotliSize: true,
      template: "treemap",
    }),
  ],
  base: "/HiSMaComp/",
  resolve: {
    alias: {
      "@": "/src",
      "@components": "/src/components",
      "@assets": "/src/assets",
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: id => {
          if (id.includes("react") && !id.includes("react-map-gl")) {
            return "react-vendor";
          }

          if (id.includes("maplibre-gl")) {
            return "maplibre";
          }

          if (id.includes("react-map-gl")) {
            return "react-map";
          }

          if (id.includes("@mui/material")) {
            return "mui-core";
          }
          if (id.includes("@mui/icons-material")) {
            return "mui-icons";
          }
          if (id.includes("@emotion")) {
            return "mui-emotion";
          }

          if (id.includes("html2canvas") || id.includes("web-vitals")) {
            return "utils";
          }

          if (id.includes("src/")) {
            return "app";
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
});
