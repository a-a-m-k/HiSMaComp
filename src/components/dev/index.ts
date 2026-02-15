export { default as ErrorBoundary } from "./ErrorBoundary";
export * from "./ErrorBoundary";
export { ErrorTestHelper } from "./ErrorBoundary/ErrorTestHelper";
// PerformanceMonitor is not exported here to allow proper code splitting via dynamic import
// It should be imported directly: import("@/components/dev/PerformanceMonitor/PerformanceMonitor")
