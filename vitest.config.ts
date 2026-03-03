import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    globals: true,
    exclude: ["**/node_modules/**", "**/dist/**", "**/tests/e2e/**"],
    testTimeout: 10000, // Increased from 5000ms to handle slow calculations
    pool: "threads", // Use threads instead of forks for better performance
    poolOptions: {
      threads: {
        singleThread: false,
        maxThreads: 4, // Limit to avoid overwhelming the system
        minThreads: 1,
      },
    },
    // Keep isolation enabled for test safety, but use threads for better performance
    isolate: true,
    sequence: {
      shuffle: false,
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/**/*.d.ts",
        "src/main.tsx",
        "src/vite-env.d.ts",
        "src/assets/**",
      ],
      thresholds: {
        statements: 40,
        branches: 35,
        functions: 40,
        lines: 40,
      },
    },
  },
});
