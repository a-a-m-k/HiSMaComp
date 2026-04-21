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
    // Threads are faster locally; forks are more stable in CI for jsdom-heavy suites.
    pool: process.env.CI ? "forks" : "threads",
    poolOptions: {
      threads: {
        singleThread: false,
        maxThreads: 4, // Limit to avoid overwhelming the system
        minThreads: 1,
      },
      forks: {
        singleFork: true,
      },
    },
    // Keep isolation enabled for test safety, but use threads for better performance
    isolate: true,
    sequence: {
      shuffle: false,
    },
    coverage: {
      provider: "v8",
      reporter: process.env.CI ? ["text"] : ["text", "html"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/**/*.d.ts",
        "src/main.tsx",
        "src/vite-env.d.ts",
        "src/assets/**",
      ],
      thresholds: {
        statements: 50,
        branches: 45,
        functions: 50,
        lines: 50,
      },
    },
  },
});
