import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useEffect,
  useCallback,
  useRef,
} from "react";

import { Town } from "@/common/types";
import { YEARS } from "@/constants";
import { yearDataService } from "@/services";
import { calculateBoundsCenter } from "@/utils/utils";
import { logger } from "@/utils/logger";
import { retryWithBackoff } from "@/utils/retry";
import { announce } from "@/utils/accessibility";

/**
 * Data-only application context: year, towns, loading, error.
 * Map initial center/fitZoom are computed in MapLayout via useInitialMapState
 * and passed as props so context doesn't re-render on viewport resize.
 */
interface AppContextType {
  selectedYear: number;
  setSelectedYear: (year: number) => void;
  towns: Town[];
  filteredTowns: Town[];
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
  retry: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

/**
 * Props for AppProvider component.
 */
interface AppProviderProps {
  /** Child components that will have access to AppContext */
  children: React.ReactNode;
  /** Array of all town objects to provide to the context */
  towns: Town[];
}

/**
 * React Context Provider: data only (year, towns, loading, error).
 * Map initial position is computed in MapLayout and passed as props.
 */
export const AppProvider: React.FC<AppProviderProps> = ({
  children,
  towns,
}) => {
  const [selectedYear, setSelectedYearState] = useState<number>(YEARS[0]);
  const setSelectedYear = useCallback((year: number) => {
    if (!YEARS.includes(year as (typeof YEARS)[number])) {
      logger.warn(
        `Invalid year selected: ${year}. Valid years are: ${YEARS.join(", ")}`
      );
      return;
    }
    setSelectedYearState(year);
  }, []);
  const [filteredTowns, setFilteredTowns] = useState<Town[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const isInitializedRef = useRef<boolean>(false);
  const previousTownsRef = useRef<Town[]>([]);

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

      const loadData = async (): Promise<void> => {
        try {
          const yearData = yearDataService.getYearData(towns, year);
          setFilteredTowns(yearData.filteredTowns);
          setError(null);
        } catch (error) {
          logger.error("Error loading year data:", error);
          const errorMessage =
            error instanceof Error
              ? `Failed to load data for year ${year}: ${error.message}`
              : `Failed to load data for year ${year}. Please try again.`;
          setError(errorMessage);
          setFilteredTowns([]);
          announce(errorMessage, "assertive");
          throw error;
        }
      };

      if (useRetry) {
        setIsLoading(true);
        retryWithBackoff(loadData, {
          maxAttempts: 3,
          initialDelay: 1000,
          maxDelay: 5000,
        })
          .catch(error => {
            logger.error("Error loading year data after retries:", error);
            const errorMessage =
              error instanceof Error
                ? error.message
                : "Failed to load data after multiple attempts. Please refresh the page.";
            setError(errorMessage);
            announce(errorMessage, "assertive");
          })
          .finally(() => {
            setIsLoading(false);
          });
      } else {
        loadData().catch(error => {
          logger.error("Error in loadYearData:", error);
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
      return;
    }

    const townsChanged =
      previousTownsRef.current !== towns ||
      previousTownsRef.current.length !== towns.length;

    if (townsChanged) {
      setIsLoading(true);
      try {
        // Validate that we can compute center (used by MapLayout via useInitialMapState).
        calculateBoundsCenter(towns);
        isInitializedRef.current = true;
        previousTownsRef.current = towns;
      } catch (error) {
        logger.error("Error initializing app:", error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to load historical data. Please try refreshing the page.";
        setError(errorMessage);
        setFilteredTowns([]);
      } finally {
        setIsLoading(false);
      }
    }

    if (isInitializedRef.current) {
      loadYearData(selectedYear, false);
    }
  }, [selectedYear, loadYearData, towns]);

  const value = useMemo(
    () => ({
      selectedYear,
      setSelectedYear,
      towns,
      filteredTowns,
      isLoading,
      error,
      clearError,
      retry,
    }),
    [
      selectedYear,
      setSelectedYear,
      towns,
      filteredTowns,
      isLoading,
      error,
      clearError,
      retry,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

/**
 * Hook to access the AppContext (data only: year, towns, loading, error).
 * @throws Error if called outside of an AppProvider
 */
export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
