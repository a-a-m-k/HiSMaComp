import { logger } from "@/utils/logger";

/**
 * Handles map click events to focus marker elements.
 * When a user clicks on a map feature (town circle), finds and focuses
 * the corresponding marker element to enable keyboard navigation.
 *
 * @param featureName - Name property from the clicked map feature
 */
export const handleMapFeatureClick = (
  featureName: string | undefined
): void => {
  if (!featureName) return;

  try {
    const markerElement = document.querySelector<HTMLElement>(
      `[data-marker-id^="marker-${featureName}-"]`
    );

    if (markerElement && markerElement instanceof HTMLElement) {
      markerElement.focus();
    }
  } catch (error) {
    logger.error("Error focusing marker on map click:", error);
  }
};
