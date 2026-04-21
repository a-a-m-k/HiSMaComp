import type { Page } from "@playwright/test";

import { YEARS } from "../../../src/constants/data";

/** MUI timeline slider uses step indices (0 … YEARS.length-1), not raw years. */
export async function selectYearViaTimelineSlider(
  page: Page,
  year: (typeof YEARS)[number]
): Promise<void> {
  const targetIndex = YEARS.indexOf(year);
  if (targetIndex < 0) {
    throw new Error(`Year ${year} is not in YEARS`);
  }

  const slider = page.locator("#timeline").getByRole("slider");
  await slider.waitFor({ state: "visible", timeout: 15000 });
  await slider.focus();
  await page.keyboard.press("Home");
  for (let i = 0; i < targetIndex; i++) {
    await page.keyboard.press("ArrowRight");
  }
}
