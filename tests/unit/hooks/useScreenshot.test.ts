import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";

import { useScreenshot } from "@/hooks/ui/useScreenshot";

const {
  mockHtml2Canvas,
  mockHideMapControls,
  mockRestoreMapControls,
  mockReportAppError,
  mockGetAppErrorMessage,
  mockAnnounce,
} = vi.hoisted(() => ({
  mockHtml2Canvas: vi.fn(),
  mockHideMapControls: vi.fn(),
  mockRestoreMapControls: vi.fn(),
  mockReportAppError: vi.fn(),
  mockGetAppErrorMessage: vi.fn(
    () => "Could not save map image. Please try again."
  ),
  mockAnnounce: vi.fn(),
}));

vi.mock("html2canvas", () => ({
  default: mockHtml2Canvas,
}));

vi.mock("@/components/controls/ScreenshotButton/utils", () => ({
  LEGEND_SCREENSHOT_EXPAND_EVENT: "hismacomp:legend-screenshot-expand",
  LEGEND_SCREENSHOT_RESTORE_EVENT: "hismacomp:legend-screenshot-restore",
  LEGEND_SCREENSHOT_EXPAND_WAIT_MS: 320,
  dispatchLegendScreenshotExpand: vi.fn(),
  dispatchLegendScreenshotRestore: vi.fn(),
  hideMapControls: mockHideMapControls,
  restoreMapControls: mockRestoreMapControls,
}));

vi.mock("@/utils/errorPolicy", () => ({
  reportAppError: mockReportAppError,
  getAppErrorMessage: mockGetAppErrorMessage,
}));

vi.mock("@/utils/accessibility", () => ({
  announce: mockAnnounce,
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
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    document.body.innerHTML = '<div id="map-container"></div>';
    mockHideMapControls.mockReturnValue({
      controls: [],
      prevDisplay: [],
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
  });

  it("reports capture failure and resets isCapturing when html2canvas throws", async () => {
    mockHtml2Canvas.mockRejectedValueOnce(new Error("capture failed"));
    const { result } = renderHook(() => useScreenshot());

    await act(async () => {
      await result.current.captureScreenshot();
    });

    expect(result.current.isCapturing).toBe(false);
    expect(mockReportAppError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        category: "screenshot-capture",
        operation: "html2canvas",
      })
    );
    expect(mockAnnounce).toHaveBeenCalledWith(
      "Could not save map image. Please try again.",
      "assertive"
    );
    expect(mockRestoreMapControls).toHaveBeenCalledTimes(1);
  });

  it("reports error when map container is missing", async () => {
    document.body.innerHTML = "";
    const { result } = renderHook(() =>
      useScreenshot({ mapContainerSelector: "#missing" })
    );

    await act(async () => {
      await result.current.captureScreenshot();
    });

    expect(mockReportAppError).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining("#missing") }),
      expect.objectContaining({
        category: "screenshot-capture",
        operation: "querySelector",
      })
    );
    expect(mockAnnounce).toHaveBeenCalledWith(
      "Could not save map image. Please try again.",
      "assertive"
    );
    expect(mockHtml2Canvas).not.toHaveBeenCalled();
  });
});
