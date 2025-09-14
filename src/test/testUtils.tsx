import React from "react";
import { Town } from "@/common/types";

export const mockTowns: Town[] = [
  {
    name: "Paris",
    latitude: 48.8566,
    longitude: 2.3522,
    populationByYear: {
      "800": 25000,
      "1000": 20000,
      "1200": 110000,
      "1300": 228000,
      "1400": 280000,
      "1500": 185000,
      "1600": 245000,
      "1750": 556000,
    },
  },
  {
    name: "London",
    latitude: 51.5074,
    longitude: -0.1278,
    populationByYear: {
      "800": null,
      "1000": 15000,
      "1200": 40000,
      "1300": 45000,
      "1400": 50000,
      "1500": 50000,
      "1600": 187000,
      "1750": 676000,
    },
  },
  {
    name: "Rome",
    latitude: 41.9028,
    longitude: 12.4964,
    populationByYear: {
      "800": 50000,
      "1000": 35000,
      "1200": 35000,
      "1300": 30000,
      "1400": null,
      "1500": 38000,
      "1600": 102000,
      "1750": 146000,
    },
  },
];

export const mockTownsMinimal: Town[] = [
  {
    name: "Paris",
    latitude: 48.8566,
    longitude: 2.3522,
    populationByYear: {
      "800": 25000,
      "1000": 20000,
      "1200": 110000,
    },
  },
  {
    name: "London",
    latitude: 51.5074,
    longitude: -0.1278,
    populationByYear: {
      "800": null,
      "1000": 15000,
      "1200": 40000,
    },
  },
];

// Helper function to create a test component that uses AppContext
export const createTestComponent = (testId: string) => {
  const TestComponent = ({ children }: { children: React.ReactNode }) => (
    <div data-testid={testId}>{children}</div>
  );
  TestComponent.displayName = `TestComponent-${testId}`;
  return TestComponent;
};

// Mock window dimensions for map tests
export const mockWindowDimensions = () => {
  Object.defineProperty(window, "innerWidth", {
    writable: true,
    configurable: true,
    value: 800,
  });

  Object.defineProperty(window, "innerHeight", {
    writable: true,
    configurable: true,
    value: 600,
  });
};
