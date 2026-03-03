import { describe, it, expect } from "vitest";
import { getUserFacingMessage } from "@/utils/errorMessage";

describe("getUserFacingMessage", () => {
  it("returns Error.message when present (dev)", () => {
    expect(getUserFacingMessage(new Error("Custom error"), "Fallback")).toBe(
      "Custom error"
    );
  });

  it("returns string when error is string (dev)", () => {
    expect(getUserFacingMessage("String error", "Fallback")).toBe(
      "String error"
    );
  });

  it("returns fallback when error is not Error or string", () => {
    expect(getUserFacingMessage(null, "Fallback")).toBe("Fallback");
    expect(getUserFacingMessage(123, "Fallback")).toBe("Fallback");
    expect(getUserFacingMessage(undefined, "Default")).toBe("Default");
  });

  it("uses default fallback when not provided", () => {
    expect(getUserFacingMessage(null)).toBe(
      "Something went wrong. Please try again."
    );
  });
});
