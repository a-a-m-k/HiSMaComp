/**
 * Tests for keyboard utility functions
 */

import { describe, it, expect } from "vitest";
import { isInputField } from "@/utils/keyboard";

describe("isInputField", () => {
  it("should return false for null", () => {
    expect(isInputField(null)).toBe(false);
  });

  it("should return false for non-input elements", () => {
    const div = document.createElement("div");
    expect(isInputField(div)).toBe(false);

    const span = document.createElement("span");
    expect(isInputField(span)).toBe(false);

    const button = document.createElement("button");
    expect(isInputField(button)).toBe(false);
  });

  it("should return true for text input elements", () => {
    const input = document.createElement("input");
    input.type = "text";
    expect(isInputField(input)).toBe(true);
  });

  it("should return true for email input elements", () => {
    const input = document.createElement("input");
    input.type = "email";
    expect(isInputField(input)).toBe(true);
  });

  it("should return true for password input elements", () => {
    const input = document.createElement("input");
    input.type = "password";
    expect(isInputField(input)).toBe(true);
  });

  it("should return false for range input elements (sliders)", () => {
    const input = document.createElement("input");
    input.type = "range";
    expect(isInputField(input)).toBe(false);
  });

  it("should return true for button input elements (still blocks shortcuts)", () => {
    const input = document.createElement("input");
    input.type = "button";
    // Button inputs still block keyboard shortcuts (only range inputs are excluded)
    expect(isInputField(input)).toBe(true);
  });

  it("should return true for checkbox input elements (still blocks shortcuts)", () => {
    const input = document.createElement("input");
    input.type = "checkbox";
    // Checkbox inputs still block keyboard shortcuts (only range inputs are excluded)
    expect(isInputField(input)).toBe(true);
  });

  it("should return true for radio input elements (still blocks shortcuts)", () => {
    const input = document.createElement("input");
    input.type = "radio";
    // Radio inputs still block keyboard shortcuts (only range inputs are excluded)
    expect(isInputField(input)).toBe(true);
  });

  it("should return true for textarea elements", () => {
    const textarea = document.createElement("textarea");
    expect(isInputField(textarea)).toBe(true);
  });

  // Note: contentEditable testing is limited in jsdom
  // The implementation correctly checks target.isContentEditable === true
  // In real browsers, contentEditable elements return true
  // The critical test is that range inputs return false (tested above)

  it("should return false for non-contentEditable divs", () => {
    const div = document.createElement("div");
    // contentEditable is not set, so isContentEditable should be false or undefined
    // In jsdom, isContentEditable may be undefined, but isInputField should return false
    expect(isInputField(div)).toBe(false);
  });

  it("should return true for input with default type (text)", () => {
    const input = document.createElement("input");
    expect(isInputField(input)).toBe(true);
  });
});
