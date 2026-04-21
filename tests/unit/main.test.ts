import { beforeEach, describe, expect, it, vi } from "vitest";
import { createLoggerMock } from "../helpers/mocks/logger";

const mockRender = vi.fn();
const mockCreateRoot = vi.fn(() => ({
  render: mockRender,
}));
const mockLogger = createLoggerMock();

vi.mock("react-dom/client", () => ({
  createRoot: mockCreateRoot,
}));

vi.mock("@/App", () => ({
  default: () => null,
}));

vi.mock("@/utils/logger", () => ({
  logger: mockLogger,
}));

describe("main bootstrap", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    document.body.innerHTML = '<div id="root"></div>';
  });

  it("does not register service worker in development; mounts app", async () => {
    const register = vi.fn().mockResolvedValue({ scope: "/scope" });
    Object.defineProperty(navigator, "serviceWorker", {
      value: { register },
      configurable: true,
    });

    await import("@/main");
    await Promise.resolve();

    expect(register).not.toHaveBeenCalled();
    expect(mockCreateRoot).toHaveBeenCalledTimes(1);
    expect(mockRender).toHaveBeenCalledTimes(1);
  });
});
