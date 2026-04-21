import { useCallback, useEffect, useRef, useState } from "react";

import type { Town } from "@/common/types";
import { YEARS } from "@/constants";
import { yearDataService } from "@/services";
import { calculateBoundsCenter } from "@/utils/utils";
import { retryWithBackoff } from "@/utils/retry";
import { announce } from "@/utils/accessibility";
import { getAppErrorMessage, reportAppError } from "@/utils/errorPolicy";

type UseYearDataControllerArgs = {
  towns: Town[];
  selectedYear: number;
};

export const useYearDataController = ({
  towns,
  selectedYear,
}: UseYearDataControllerArgs) => {
  const [filteredTowns, setFilteredTowns] = useState<Town[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const isInitializedRef = useRef<boolean>(false);
  const previousTownsRef = useRef<Town[]>([]);
  /** Ignore completions for years that are no longer selected (avoid race). */
  const currentYearRef = useRef<number>(YEARS[0]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const loadYearData = useCallback(
    (year: number, useRetry = false): void => {
      if (!towns || towns.length === 0) {
        setError("No towns data available");
        setFilteredTowns([]);
        return;
      }

      currentYearRef.current = year;
      const requestYear = year;

      const loadData = async (): Promise<void> => {
        try {
          const yearFilteredTowns = yearDataService.getFilteredTowns(
            towns,
            requestYear
          );
          if (currentYearRef.current !== requestYear) return;
          setFilteredTowns(yearFilteredTowns);
          setError(null);
        } catch (caughtError) {
          if (currentYearRef.current !== requestYear) return;
          reportAppError(caughtError, {
            category: "year-data-load",
            operation: "loadData",
            year: requestYear,
          });
          const errorMessage = getAppErrorMessage(caughtError, {
            category: "year-data-load",
            operation: "loadData",
            year: requestYear,
          });
          setError(errorMessage);
          setFilteredTowns([]);
          announce(errorMessage, "assertive");
          throw caughtError;
        }
      };

      if (useRetry) {
        setIsLoading(true);
        retryWithBackoff(loadData, {
          maxAttempts: 3,
          initialDelay: 1000,
          maxDelay: 5000,
        })
          .catch(caughtError => {
            if (currentYearRef.current !== requestYear) return;
            reportAppError(caughtError, {
              category: "year-data-retry",
              operation: "retryWithBackoff",
              year: requestYear,
            });
            const errorMessage = getAppErrorMessage(caughtError, {
              category: "year-data-retry",
              operation: "retryWithBackoff",
              year: requestYear,
            });
            setError(errorMessage);
            announce(errorMessage, "assertive");
          })
          .finally(() => {
            if (currentYearRef.current === requestYear) setIsLoading(false);
          });
      } else {
        setIsLoading(true);
        loadData()
          .catch(caughtError => {
            reportAppError(caughtError, {
              category: "year-data-load",
              operation: "loadYearData",
              year: requestYear,
            });
          })
          .finally(() => {
            if (currentYearRef.current === requestYear) setIsLoading(false);
          });
      }
    },
    [towns]
  );

  const retry = useCallback(() => {
    setError(null);
    loadYearData(selectedYear, true);
  }, [selectedYear, loadYearData]);

  useEffect(() => {
    if (!towns || towns.length === 0) {
      setFilteredTowns([]);
      isInitializedRef.current = false;
      previousTownsRef.current = [];
      currentYearRef.current = selectedYear;
      return;
    }

    const townsChanged =
      previousTownsRef.current !== towns ||
      previousTownsRef.current.length !== towns.length;

    if (townsChanged) {
      setIsLoading(true);
      try {
        calculateBoundsCenter(towns);
        isInitializedRef.current = true;
        previousTownsRef.current = towns;
      } catch (caughtError) {
        reportAppError(caughtError, {
          category: "initialization",
          operation: "calculateBoundsCenter",
        });
        const errorMessage = getAppErrorMessage(caughtError, {
          category: "initialization",
          operation: "calculateBoundsCenter",
        });
        setError(errorMessage);
        setFilteredTowns([]);
      } finally {
        setIsLoading(false);
      }
    }

    currentYearRef.current = selectedYear;
    if (isInitializedRef.current) {
      loadYearData(selectedYear, false);
    }
  }, [selectedYear, loadYearData, towns]);

  return { filteredTowns, isLoading, error, clearError, retry };
};
