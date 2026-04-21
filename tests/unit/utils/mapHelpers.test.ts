import { describe, expect, it } from "vitest";

import { getMapFeatureName } from "@/utils/map";

describe("getMapFeatureName", () => {
  it("returns feature name when properties contain a valid name", () => {
    expect(getMapFeatureName({ name: "Paris" })).toBe("Paris");
  });

  it("returns undefined for missing/invalid names", () => {
    expect(getMapFeatureName(undefined)).toBeUndefined();
    expect(getMapFeatureName({})).toBeUndefined();
    expect(getMapFeatureName({ name: 123 })).toBeUndefined();
    expect(getMapFeatureName({ name: "   " })).toBeUndefined();
  });
});
