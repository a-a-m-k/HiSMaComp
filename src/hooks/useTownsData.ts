import { useState, useEffect } from "react";
import { Town } from "@/common/types";
import { announce } from "@/utils/accessibility";
import { getAppErrorMessage, reportAppError } from "@/utils/errorPolicy";
import { trackEvent, trackTiming } from "@/utils/observability";
import { validateTownsData } from "@/utils/validateTowns";

/**
 * Loads towns data asynchronously to reduce initial bundle size.
 * This allows the app to start rendering while data loads in the background.
 * Uses dynamic import to create a separate chunk that loads on demand.
 * Exposes retry to re-run the load (e.g. after an error).
 */
export const useTownsData = (): {
  towns: Town[];
  isLoading: boolean;
  error: string | null;
  retry: () => void;
} => {
  const [towns, setTowns] = useState<Town[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const loadTowns = async () => {
      const start = performance.now();
      try {
        setIsLoading(true);
        setError(null);

        const townsModule = await import(
          /* webpackChunkName: "towns-data" */
          "@/assets/history-data/towns.json"
        );

        if (cancelled) return;

        const raw = townsModule.default ?? townsModule;
        const townsData = validateTownsData(raw);
        setTowns(townsData);
        trackTiming("towns_data_load_ms", performance.now() - start, {
          result: "success",
          count: townsData.length,
        });
      } catch (err) {
        if (cancelled) return;
        reportAppError(err, {
          category: "towns-data-load",
          operation: "useTownsData.loadTowns",
        });
        const errorMessage = getAppErrorMessage(err, {
          category: "towns-data-load",
          operation: "useTownsData.loadTowns",
        });
        setError(errorMessage);
        announce(errorMessage, "assertive");
        trackTiming("towns_data_load_ms", performance.now() - start, {
          result: "error",
        });
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    loadTowns();
    return () => {
      cancelled = true;
    };
  }, [retryCount]);

  const retry = () => {
    trackEvent({ name: "towns_data_retry_clicked" });
    setRetryCount(c => c + 1);
  };

  return { towns, isLoading, error, retry };
};
