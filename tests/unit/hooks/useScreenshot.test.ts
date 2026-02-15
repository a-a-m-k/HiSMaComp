import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";

import { useScreenshot } from "@/hooks/ui/useScreenshot";

const {
  mockHtml2Canvas,
  mockHideMapControls,
  mockRestoreMapControls,
  mockAddAttributionOverlay,
  mockLogger,
} = vi.hoisted(() => ({
  mockHtml2Canvas: vi.fn(),
  mockHideMapControls: vi.fn(),
  mockRestoreMapControls: vi.fn(),
  mockAddAttributionOverlay: vi.fn(),
  mockLogger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

vi.mock("html2canvas", () => ({
  default: (...args: unknown[]) => mockHtml2Canvas(...args),
}));

vi.mock("@/components/controls/ScreenshotButton/utils", () => ({
  hideMapControls: (...args: unknown[]) => mockHideMapControls(...args),
  restoreMapControls: (...args: unknown[]) => mockRestoreMapControls(...args),
  addAttributionOverlay: (...args: unknown[]) =>
    mockAddAttributionOverlay(...args),
}));

vi.mock("@/utils/logger", () => ({
  logger: mockLogger,
}));

vi.mock("@mui/material/styles", () => ({
  useTheme: () => ({
    palette: {
      background: {
        paper: "#fff",
      },
    },
    breakpoints: {
      down: () => "(max-width:600px)",
      between: () => "(min-width:600px) and (max-width:900px)",
    },
  }),
}));

vi.mock("@mui/material/useMediaQuery", () => ({
  default: () => false,
}));

describe("useScreenshot", () => {
  const overlayRemove = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    document.body.innerHTML = '<div id="map-container"></div>';
    mockHideMapControls.mockReturnValue({
      controls: [],
      prevDisplay: [],
    });
    mockAddAttributionOverlay.mockReturnValue({
      remove: overlayRemove,
    });
    mockHtml2Canvas.mockResolvedValue({
      toDataURL: vi.fn(() => "data:image/png;base64,fake"),
    });
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("captures screenshot and restores controls after successful capture", async () => {
    const { result } = renderHook(() => useScreenshot());

    await act(async () => {
      await result.current.captureScreenshot();
    });

    expect(mockHtml2Canvas).toHaveBeenCalledTimes(1);
    expect(result.current.isCapturing).toBe(false);

    await act(async () => {
      vi.runAllTimers();
    });

    expect(mockRestoreMapControls).toHaveBeenCalledTimes(1);
    expect(overlayRemove).toHaveBeenCalledTimes(1);
  });

  it("logs capture failure and resets isCapturing when html2canvas throws", async () => {
    mockHtml2Canvas.mockRejectedValueOnce(new Error("capture failed"));
    const { result } = renderHook(() => useScreenshot());

    await act(async () => {
      await result.current.captureScreenshot();
    });

    expect(result.current.isCapturing).toBe(false);
    expect(mockLogger.error).toHaveBeenCalledWith(
      "Screenshot capture failed:",
      expect.any(Error)
    );
  });
});
