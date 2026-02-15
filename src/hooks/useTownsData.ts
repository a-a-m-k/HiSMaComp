import { useState, useEffect } from "react";
import { Town } from "@/common/types";
import { logger } from "@/utils/logger";

/**
 * Loads towns data asynchronously to reduce initial bundle size.
 * This allows the app to start rendering while data loads in the background.
 * Uses dynamic import to create a separate chunk that loads on demand.
 */
export const useTownsData = (): {
  towns: Town[];
  isLoading: boolean;
  error: string | null;
} => {
  const [towns, setTowns] = useState<Town[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTowns = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const townsModule = await import(
          /* webpackChunkName: "towns-data" */
          "@/assets/history-data/towns.json"
        );

        const townsData = townsModule.default || townsModule;
        setTowns(townsData);
        logger.info(`Loaded ${townsData.length} towns asynchronously`);
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? `Failed to load towns data: ${err.message}`
            : "Failed to load towns data. Please refresh the page.";
        logger.error("Error loading towns data:", err);
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    loadTowns();
  }, []);

  return { towns, isLoading, error };
};
