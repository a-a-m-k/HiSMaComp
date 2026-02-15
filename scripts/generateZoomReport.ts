/**
 * Zoom Calculation Report Generator
 *
 * Generates a detailed report of zoom calculations across different devices.
 * Run with: npx tsx scripts/generateZoomReport.ts
 */

import { calculateResponsiveZoom, calculateMapArea } from "../src/utils/utils";
import { mockTheme } from "../tests/helpers/testUtils";

// Device profiles
const deviceProfiles = {
  // Mobile phones (portrait)
  iPhoneSE: { name: "iPhone SE", width: 375, height: 667, category: "mobile" },
  iPhone12: {
    name: "iPhone 12/13/14",
    width: 390,
    height: 844,
    category: "mobile",
  },
  iPhone14Pro: {
    name: "iPhone 14 Pro",
    width: 393,
    height: 852,
    category: "mobile",
  },
  iPhone14ProMax: {
    name: "iPhone 14 Pro Max",
    width: 430,
    height: 932,
    category: "mobile",
  },
  pixel5: {
    name: "Google Pixel 5",
    width: 393,
    height: 851,
    category: "mobile",
  },
  galaxyS21: {
    name: "Samsung Galaxy S21",
    width: 360,
    height: 800,
    category: "mobile",
  },

  // Tablets (portrait)
  iPadMini: { name: "iPad Mini", width: 768, height: 1024, category: "tablet" },
  iPad: { name: "iPad", width: 810, height: 1080, category: "tablet" },
  iPadPro11: {
    name: 'iPad Pro 11"',
    width: 834,
    height: 1194,
    category: "tablet",
  },
  iPadPro129: {
    name: 'iPad Pro 12.9"',
    width: 1024,
    height: 1366,
    category: "tablet",
  },

  // Desktop/Laptop
  laptop: { name: 'Laptop 13"', width: 1280, height: 800, category: "desktop" },
  laptop15: {
    name: 'Laptop 15"',
    width: 1440,
    height: 900,
    category: "desktop",
  },
  desktopHD: {
    name: "Desktop HD",
    width: 1920,
    height: 1080,
    category: "desktop",
  },
  desktop2K: {
    name: "Desktop 2K",
    width: 2560,
    height: 1440,
    category: "desktop",
  },
  desktop4K: {
    name: "Desktop 4K",
    width: 3840,
    height: 2160,
    category: "desktop",
  },
  ultrawide: {
    name: "Ultrawide",
    width: 3440,
    height: 1440,
    category: "desktop",
  },
};

// Mock towns data with actual geographic extremes from your dataset
// CRITICAL: Includes edge cities (Lisbon, Novgorod, Sarai, Almeria)
const mockTowns = [
  {
    name: "London",
    latitude: 51.5074,
    longitude: -0.1278,
    populationByYear: { "1000": 15000 },
  },
  {
    name: "Paris",
    latitude: 48.8566,
    longitude: 2.3522,
    populationByYear: { "1000": 20000 },
  },
  {
    name: "Rome",
    latitude: 41.9028,
    longitude: 12.4964,
    populationByYear: { "1000": 25000 },
  },
  {
    name: "Madrid",
    latitude: 40.4168,
    longitude: -3.7038,
    populationByYear: { "1000": 18000 },
  },
  {
    name: "Berlin",
    latitude: 52.52,
    longitude: 13.405,
    populationByYear: { "1000": 12000 },
  },
  {
    name: "Vienna",
    latitude: 48.2082,
    longitude: 16.3738,
    populationByYear: { "1000": 10000 },
  },
  {
    name: "Athens",
    latitude: 37.9838,
    longitude: 23.7275,
    populationByYear: { "1000": 30000 },
  },
  // EXTREME EDGE CITIES - critical for accurate zoom testing
  {
    name: "Lisbon",
    latitude: 38.7223,
    longitude: -9.1393,
    populationByYear: { "1000": 15000 },
  }, // WESTERNMOST
  {
    name: "Novgorod",
    latitude: 58.522,
    longitude: 31.275,
    populationByYear: { "1000": 10000 },
  }, // NORTHERNMOST
  {
    name: "Almeria",
    latitude: 36.83,
    longitude: -2.464,
    populationByYear: { "1000": 8000 },
  }, // SOUTHERNMOST
  {
    name: "Sarai",
    latitude: 47.5,
    longitude: 45.5,
    populationByYear: { "1000": 20000 },
  }, // EASTERNMOST
];

interface ZoomReport {
  deviceName: string;
  category: string;
  screenWidth: number;
  screenHeight: number;
  aspectRatio: string;
  effectiveMapWidth: number;
  effectiveMapHeight: number;
  mapAreaPercentage: string;
  calculatedZoom: number;
  margin: string;
}

function generateReport(): ZoomReport[] {
  const reports: ZoomReport[] = [];

  Object.values(deviceProfiles).forEach(device => {
    const mapArea = calculateMapArea(device.width, device.height, mockTheme);
    const zoom = calculateResponsiveZoom(
      mockTowns,
      device.width,
      device.height,
      mockTheme
    );

    const aspectRatio = (device.width / device.height).toFixed(2);
    const mapAreaPercent = (
      ((mapArea.effectiveWidth * mapArea.effectiveHeight) /
        (device.width * device.height)) *
      100
    ).toFixed(1);

    // Determine margin based on category
    let margin = "10%";
    if (device.category === "mobile") margin = "15%";
    else if (device.category === "tablet") margin = "12%";
    else if (device.category === "desktop") margin = "8%";

    reports.push({
      deviceName: device.name,
      category: device.category,
      screenWidth: device.width,
      screenHeight: device.height,
      aspectRatio,
      effectiveMapWidth: Math.round(mapArea.effectiveWidth),
      effectiveMapHeight: Math.round(mapArea.effectiveHeight),
      mapAreaPercentage: mapAreaPercent + "%",
      calculatedZoom: Number(zoom.toFixed(2)),
      margin,
    });
  });

  return reports;
}

function printReport(reports: ZoomReport[]) {
  console.log("\n" + "=".repeat(120));
  console.log("📊 ZOOM CALCULATION REPORT");
  console.log("=".repeat(120));
  console.log(
    "\nTest Data: 7 European Cities (London, Paris, Rome, Madrid, Berlin, Vienna, Athens)"
  );
  console.log("\n");

  // Group by category
  const categories = ["mobile", "tablet", "desktop"];

  categories.forEach(category => {
    const categoryReports = reports.filter(r => r.category === category);
    if (categoryReports.length === 0) return;

    console.log(`\n${"─".repeat(120)}`);
    console.log(`📱 ${category.toUpperCase()} DEVICES`);
    console.log("─".repeat(120));

    console.table(
      categoryReports.map(r => ({
        Device: r.deviceName,
        Resolution: `${r.screenWidth}x${r.screenHeight}`,
        Aspect: r.aspectRatio,
        "Map Area": `${r.effectiveMapWidth}x${r.effectiveMapHeight}`,
        "Area %": r.mapAreaPercentage,
        Zoom: r.calculatedZoom,
        Margin: r.margin,
      }))
    );
  });

  // Summary statistics
  console.log("\n" + "=".repeat(120));
  console.log("📈 SUMMARY STATISTICS");
  console.log("=".repeat(120));

  const mobileZooms = reports
    .filter(r => r.category === "mobile")
    .map(r => r.calculatedZoom);
  const tabletZooms = reports
    .filter(r => r.category === "tablet")
    .map(r => r.calculatedZoom);
  const desktopZooms = reports
    .filter(r => r.category === "desktop")
    .map(r => r.calculatedZoom);

  const stats = [
    {
      Category: "Mobile",
      "Min Zoom": Math.min(...mobileZooms).toFixed(2),
      "Max Zoom": Math.max(...mobileZooms).toFixed(2),
      "Avg Zoom": (
        mobileZooms.reduce((a, b) => a + b, 0) / mobileZooms.length
      ).toFixed(2),
      Range: (Math.max(...mobileZooms) - Math.min(...mobileZooms)).toFixed(2),
    },
    {
      Category: "Tablet",
      "Min Zoom": Math.min(...tabletZooms).toFixed(2),
      "Max Zoom": Math.max(...tabletZooms).toFixed(2),
      "Avg Zoom": (
        tabletZooms.reduce((a, b) => a + b, 0) / tabletZooms.length
      ).toFixed(2),
      Range: (Math.max(...tabletZooms) - Math.min(...tabletZooms)).toFixed(2),
    },
    {
      Category: "Desktop",
      "Min Zoom": Math.min(...desktopZooms).toFixed(2),
      "Max Zoom": Math.max(...desktopZooms).toFixed(2),
      "Avg Zoom": (
        desktopZooms.reduce((a, b) => a + b, 0) / desktopZooms.length
      ).toFixed(2),
      Range: (Math.max(...desktopZooms) - Math.min(...desktopZooms)).toFixed(2),
    },
  ];

  console.table(stats);

  console.log("\n" + "=".repeat(120));
  console.log("✅ Report generation complete!");
  console.log("=".repeat(120));
  console.log("\n💡 Tips:");
  console.log("  - Lower zoom numbers = zoomed out (fit more area)");
  console.log("  - Higher zoom numbers = zoomed in (more detail)");
  console.log(
    "  - Zoom range within category should be relatively small for consistency"
  );
  console.log(
    "  - Map Area % shows how much of the screen is available for the map after UI elements"
  );
  console.log("\n");
}

// Run the report
const reports = generateReport();
printReport(reports);
