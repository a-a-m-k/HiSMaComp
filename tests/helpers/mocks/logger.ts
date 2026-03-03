import { vi } from "vitest";

export const createLoggerMock = () => ({
  error: vi.fn(),
  warn: vi.fn(),
  info: vi.fn(),
  debug: vi.fn(),
});
