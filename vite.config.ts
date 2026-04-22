import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { visualizer } from "rollup-plugin-visualizer";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { sentryVitePlugin } from "@sentry/vite-plugin";
import { vitePluginCritical } from "./vite-plugin-critical";
import { vitePluginResourceHints } from "./vite-plugin-resource-hints";
import { vitePluginLcpLegend } from "./vite-plugin-lcp-legend";
import { vitePluginFixPaths } from "./vite-plugin-fix-paths";

/** Base path for production (e.g. GitHub Pages subpath). Single source for build output. */
const BUILD_BASE = (process.env.VITE_BASE_PATH as string | undefined) ?? "/";
const SENTRY_ORG = process.env.SENTRY_ORG;
const SENTRY_PROJECT = process.env.SENTRY_PROJECT;
const SENTRY_AUTH_TOKEN = process.env.SENTRY_AUTH_TOKEN;
const sentryPluginEnabled = Boolean(
  SENTRY_ORG && SENTRY_PROJECT && SENTRY_AUTH_TOKEN
);
const enableProductionSourceMaps = sentryPluginEnabled;

const manifestPlugin = (base: string) => ({
  name: "manifest-transform",
  writeBundle() {
    const manifestPath = join(process.cwd(), "dist", "manifest.json");
    if (!existsSync(manifestPath)) {
      return;
    }
    const manifest = JSON.parse(readFileSync(manifestPath, "utf-8"));
    const basePath = base.replace(/\/$/, "");
    manifest.icons = manifest.icons.map((icon: { src: string }) => ({
      ...icon,
      src: icon.src.replace("/icons/", `${basePath}/icons/`),
    }));
    writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  },
});

export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    tsconfigPaths(),
    vitePluginLcpLegend(), // dev + build: inject LCP legend placeholder from legendLcp.ts
    ...(command === "build"
      ? [
          visualizer({
            filename: "dist/bundle-analysis.html",
            open: false,
            gzipSize: true,
            brotliSize: true,
            template: "treemap",
          }),
          manifestPlugin(BUILD_BASE),
          vitePluginResourceHints(),
          ...(sentryPluginEnabled
            ? [
                sentryVitePlugin({
                  org: SENTRY_ORG!,
                  project: SENTRY_PROJECT!,
                  authToken: SENTRY_AUTH_TOKEN!,
                }),
              ]
            : []),
          vitePluginCritical({
            base: process.cwd(),
            src: "index.html",
            dest: "index.html",
            dimensions: [
              { width: 1300, height: 900 }, // Desktop
              { width: 375, height: 667 }, // Mobile
            ],
            inline: true,
            minify: true,
            baseUrl: command === "build" ? BUILD_BASE : "/",
          }),
          vitePluginFixPaths(), // Fix paths after other plugins modify HTML
        ]
      : []),
  ],
  base: command === "build" ? BUILD_BASE : "/",
  preview: {
    // Configure preview server to serve from base path
    port: 4173,
    strictPort: false,
  },
  optimizeDeps: {
    // Full package include for stable dev pre-bundle. To narrow (faster cold start),
    // replace with the specific subpaths in use: @mui/material/Box, /Button, /Paper,
    // /Typography, /Alert, /AlertTitle, /styles, /colors, etc. and icons one-by-one.
    include: [
      "@mui/material",
      "@mui/icons-material",
      "@emotion/react",
      "@emotion/styled",
    ],
    // Avoid transforming class fields to __publicField() so MapLibre's worker code
    // (which runs in a separate scope) doesn't reference an undefined helper.
    esbuildOptions: {
      target: "esnext",
    },
  },
  // Path aliases are handled by vite-tsconfig-paths plugin
  // which automatically reads from tsconfig.json paths
  build: {
    // Preserve class fields (no __publicField) so MapLibre worker works in production.
    target: "esnext",
    // Keep source maps for Sentry upload builds; disable them otherwise to reduce artifact weight.
    sourcemap: enableProductionSourceMaps,
    // Enable CSS code splitting for better caching
    // CSS will be split by component/route, reducing initial bundle size
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: id => {
          if (id.includes("html2canvas")) {
            return "html2canvas";
          }
          if (id.includes("node_modules")) {
            if (id.includes("maplibre-gl")) {
              return "maplibre";
            }
            if (id.includes("react-map-gl")) {
              return "react-map";
            }
            // Optional observability: own chunk for caching and bundle analysis (still loaded with bootstrap).
            if (id.includes("@sentry")) {
              return "sentry";
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
