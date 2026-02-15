import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { visualizer } from "rollup-plugin-visualizer";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { vitePluginCritical } from "./vite-plugin-critical";
import { vitePluginResourceHints } from "./vite-plugin-resource-hints";
import { vitePluginLcpLegend } from "./vite-plugin-lcp-legend";
import { vitePluginFixPaths } from "./vite-plugin-fix-paths";

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
          manifestPlugin(),
          vitePluginResourceHints(),
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
            baseUrl: command === "build" ? "/HiSMaComp/" : "/",
          }),
          vitePluginFixPaths(), // Run last to fix all paths after other plugins modify HTML
        ]
      : []),
  ],
  base: command === "build" ? "/HiSMaComp/" : "/",
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
  },
  // Path aliases are handled by vite-tsconfig-paths plugin
  // which automatically reads from tsconfig.json paths
  build: {
    // Enable CSS code splitting for better caching
    // CSS will be split by component/route, reducing initial bundle size
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: id => {
          if (id.includes("node_modules")) {
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
