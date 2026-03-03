import { describe, it, expect, vi, beforeEach } from "vitest";
import { validateTownsData } from "@/utils/validateTowns";
import { Town } from "@/common/types";

vi.mock("@/utils/logger", () => ({
  logger: {
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe("validateTownsData", () => {
  const validTown: Town = {
    name: "Paris",
    latitude: 48.85,
    longitude: 2.35,
    populationByYear: { "1000": 20000, "1200": 25000 },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns empty array when raw is not an array", () => {
    expect(validateTownsData(null)).toEqual([]);
    expect(validateTownsData(undefined)).toEqual([]);
    expect(validateTownsData("not array")).toEqual([]);
    expect(validateTownsData({})).toEqual([]);
  });

  it("returns valid towns when all entries are valid", () => {
    const raw = [
      { ...validTown },
      {
        ...validTown,
        name: "London",
        latitude: 51.5,
        longitude: -0.1,
        populationByYear: { "1000": 10000 },
      },
    ];
    const result = validateTownsData(raw);
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe("Paris");
    expect(result[1].name).toBe("London");
  });

  it("filters out entries missing name", () => {
    const raw = [
      { ...validTown, name: "" },
      { ...validTown, name: "  " },
      { ...validTown, name: 123 },
    ];
    const result = validateTownsData(raw);
    expect(result).toHaveLength(0);
  });

  it("filters out entries with invalid coordinates", () => {
    const raw = [
      { ...validTown, latitude: 91, longitude: 0 },
      { ...validTown, latitude: 48, longitude: 200 },
      { ...validTown, latitude: NaN, longitude: 2 },
    ];
    const result = validateTownsData(raw);
    expect(result).toHaveLength(0);
  });

  it("filters out entries missing populationByYear or invalid shape", () => {
    const raw = [
      { ...validTown, populationByYear: undefined },
      { ...validTown, populationByYear: "not object" },
      { ...validTown, populationByYear: { "1000": "not number" } },
    ];
    const result = validateTownsData(raw);
    expect(result).toHaveLength(0);
  });

  it("keeps valid entries and skips invalid in mixed array", () => {
    const raw = [
      validTown,
      { ...validTown, latitude: 999 },
      {
        ...validTown,
        name: "Rome",
        latitude: 41.9,
        longitude: 12.5,
        populationByYear: {},
      },
    ];
    const result = validateTownsData(raw);
    expect(result).toHaveLength(2);
    expect(result.map(t => t.name)).toEqual(["Paris", "Rome"]);
  });

  it("accepts populationByYear with null values", () => {
    const raw = [
      { ...validTown, populationByYear: { "1000": 1000, "1100": null } },
    ];
    const result = validateTownsData(raw);
    expect(result).toHaveLength(1);
    expect(result[0].populationByYear["1100"]).toBeNull();
  });

  it("trims name and accepts optional nameVariants", () => {
    const raw = [
      { ...validTown, name: "  Cologne  ", nameVariants: ["Köln", "Colonia"] },
    ];
    const result = validateTownsData(raw);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Cologne");
    expect(result[0].nameVariants).toEqual(["Köln", "Colonia"]);
  });
});

describe("towns.json shape (integration)", () => {
  it("loads and validates actual towns.json", async () => {
    const townsModule = await import("@/assets/history-data/towns.json");
    const raw = townsModule.default ?? townsModule;
    const result = validateTownsData(raw);
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    for (const town of result) {
      expect(typeof town.name).toBe("string");
      expect(town.name.length).toBeGreaterThan(0);
      expect(typeof town.latitude).toBe("number");
      expect(typeof town.longitude).toBe("number");
      expect(town.latitude).toBeGreaterThanOrEqual(-90);
      expect(town.latitude).toBeLessThanOrEqual(90);
      expect(town.longitude).toBeGreaterThanOrEqual(-180);
      expect(town.longitude).toBeLessThanOrEqual(180);
      expect(town.populationByYear).toBeDefined();
      expect(typeof town.populationByYear).toBe("object");
    }
  });
});
