import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { visualizer } from "rollup-plugin-visualizer";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { vitePluginResourceHints } from "./vite-plugin-resource-hints";
import { vitePluginFixPaths } from "./vite-plugin-fix-paths";
import { vitePluginMaplibreCDN } from "./vite-plugin-maplibre-cdn";

const manifestPlugin = () => ({
  name: "manifest-transform",
  writeBundle() {
    const manifestPath = join(process.cwd(), "dist", "manifest.json");
    const manifest = JSON.parse(readFileSync(manifestPath, "utf-8"));
    manifest.icons = manifest.icons.map((icon: { src: string }) => ({
      ...icon,
      src: icon.src.replace("/icons/", "/HiSMaComp/icons/"),
    }));
    writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  },
});

export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    tsconfigPaths(),
    ...(command === "build"
      ? [
          vitePluginMaplibreCDN(), // Must run early to handle maplibre-gl externalization
          visualizer({
            filename: "dist/bundle-analysis.html",
            open: false,
            gzipSize: true,
            brotliSize: true,
            template: "treemap",
          }),
          manifestPlugin(),
          vitePluginResourceHints(), // Adds preload hints
          vitePluginFixPaths(), // Fix paths for GitHub Pages
        ]
      : []),
  ],
  base: command === "build" ? "./" : "/",
  preview: {
    // Configure preview server to serve from base path
    port: 4173,
    strictPort: false,
  },
  optimizeDeps: {
    include: [
      "@mui/material",
      "@mui/icons-material",
      "@emotion/react",
      "@emotion/styled",
    ],
    // Exclude maplibre-gl from optimization in production (using CDN)
    ...(command === "build" && {
      exclude: ["maplibre-gl"],
    }),
  },
  // Path aliases are handled by vite-tsconfig-paths plugin
  // which automatically reads from tsconfig.json paths
  build: {
    // Enable CSS code splitting for better caching
    // CSS will be split by component/route, reducing initial bundle size
    cssCodeSplit: true,
    rollupOptions: {
      // Externalize MapLibre GL in production - it's loaded from CDN
      // In development, we use the local package for faster HMR
      external: command === "build" ? ["maplibre-gl"] : [],
      output: {
        // Provide global variable name for MapLibre GL (loaded from CDN)
        ...(command === "build" && {
          globals: {
            "maplibre-gl": "maplibregl",
          },
        }),
        manualChunks: id => {
          if (id.includes("node_modules")) {
            // MapLibre GL is external in build (CDN), so skip it
            if (command === "build" && id.includes("maplibre-gl")) {
              return null; // Don't bundle it
            }
            if (id.includes("maplibre-gl")) {
              return "maplibre";
            }
            if (id.includes("react-map-gl")) {
              return "react-map";
            }
            return "vendor";
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ["console.log", "console.info", "console.debug"],
      },
      mangle: {
        safari10: true,
      },
    },
  },
}));
