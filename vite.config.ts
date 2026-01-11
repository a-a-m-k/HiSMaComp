import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { visualizer } from "rollup-plugin-visualizer";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

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
          visualizer({
            filename: "dist/bundle-analysis.html",
            open: false,
            gzipSize: true,
            brotliSize: true,
            template: "treemap",
          }),
          manifestPlugin(),
        ]
      : []),
  ],
  base: command === "build" ? "/HiSMaComp/" : "/",
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
