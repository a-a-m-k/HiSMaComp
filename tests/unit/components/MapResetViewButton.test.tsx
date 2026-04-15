import React from "react";
import {
  render,
  screen,
  fireEvent,
  act,
  waitFor,
} from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ThemeProvider } from "@mui/material/styles";
import { MapResetViewButton } from "@/components/controls/MapResetViewButton/MapResetViewButton";
import {
  MAP_CAMERA_RESET_STATE_EVENT,
  MAP_RESET_CAMERA_EVENT,
} from "@/constants/map";
import { lightTheme } from "@/theme/theme";

describe("MapResetViewButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("dispatches reset event when enabled", () => {
    const dispatchSpy = vi.spyOn(window, "dispatchEvent");
    render(
      <ThemeProvider theme={lightTheme}>
        <MapResetViewButton />
      </ThemeProvider>
    );

    fireEvent.click(screen.getByTestId("map-reset-view-button"));

    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: MAP_RESET_CAMERA_EVENT })
    );
  });

  it("disables when map is already centered", async () => {
    const dispatchSpy = vi.spyOn(window, "dispatchEvent");
    render(
      <ThemeProvider theme={lightTheme}>
        <MapResetViewButton />
      </ThemeProvider>
    );

    act(() => {
      window.dispatchEvent(
        new CustomEvent(MAP_CAMERA_RESET_STATE_EVENT, {
          detail: { isAtResetCamera: true },
        })
      );
    });

    const button = screen.getByTestId("map-reset-view-button");
    await waitFor(() => {
      expect(button).toBeDisabled();
    });

    fireEvent.click(button);

    const resetEvents = dispatchSpy.mock.calls.filter(
      args =>
        args[0] instanceof Event && args[0].type === MAP_RESET_CAMERA_EVENT
    );
    expect(resetEvents).toHaveLength(0);
  });
});
