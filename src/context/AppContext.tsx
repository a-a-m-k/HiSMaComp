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
import { useResponsiveZoom } from "@/hooks/ui";
import { announce } from "@/utils/accessibility";

/**
 * Application context type providing global state for the map visualization.
 */
interface AppContextType {
  /** Currently selected year for filtering towns (e.g., 800, 1000, 1200) */
  selectedYear: number;
  /** Function to update the selected year */
  setSelectedYear: (year: number) => void;
  /** All towns loaded from data source (across all time periods) */
  towns: Town[];
  /** Towns filtered by selectedYear (only towns with population > 0 for that year) */
  filteredTowns: Town[];
  /** Whether data is currently being loaded */
  isLoading: boolean;
  /** Error message if data loading or processing failed, null otherwise */
  error: string | null;
  /** Clears the current error state */
  clearError: () => void;
  /** Retries loading town data after an error */
  retry: () => void;
  /** Geographic bounds of filtered towns (optional, undefined if no towns) */
  bounds?: { minLat: number; maxLat: number; minLng: number; maxLng: number };
  /** Geographic center point of filtered towns (optional, undefined if no towns) */
  center?: { latitude: number; longitude: number };
  /** Calculated zoom level to fit all filtered towns (optional, undefined if no towns) */
  fitZoom?: number;
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
 * React Context Provider that manages global application state.
 * Provides selected year, filtered towns, loading state, error handling,
 * and calculated map bounds/center/zoom to child components.
 *
 * @param props - AppProviderProps with children and towns
 * @returns Provider component wrapping children with AppContext
 */
export const AppProvider: React.FC<AppProviderProps> = ({
  children,
  towns,
}) => {
  const [selectedYear, setSelectedYearState] = useState<number>(YEARS[0]);

  /**
   * Validates and sets the selected year.
   * Only allows years that exist in the YEARS array.
   *
   * @param year - Year to set
   */
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
  const [bounds, setBounds] = useState<
    | { minLat: number; maxLat: number; minLng: number; maxLng: number }
    | undefined
  >();
  const [center, setCenter] = useState<
    { latitude: number; longitude: number } | undefined
  >();
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
        return new Promise((resolve, reject) => {
          try {
            const yearData = yearDataService.getYearData(towns, year);
            setFilteredTowns(yearData.filteredTowns);
            setBounds(yearData.bounds);
            setError(null);
            resolve();
          } catch (error) {
            logger.error("Error loading year data:", error);
            const errorMessage =
              error instanceof Error
                ? `Failed to load data for year ${year}: ${error.message}`
                : `Failed to load data for year ${year}. Please try again.`;
            setError(errorMessage);
            setFilteredTowns([]);
            announce(errorMessage, "assertive");
            reject(error);
          }
        });
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

  const fitZoom = useResponsiveZoom(towns);

  useEffect(() => {
    if (!towns || towns.length === 0) {
      setBounds(undefined);
      setCenter(undefined);
      setFilteredTowns([]);
      isInitializedRef.current = false;
      previousTownsRef.current = [];
      return;
    }

    const townsChanged =
      previousTownsRef.current !== towns ||
      previousTownsRef.current.length !== towns.length;

    if (isInitializedRef.current && !townsChanged) {
      return;
    }

    if (townsChanged) {
      isInitializedRef.current = false;
    }

    setIsLoading(true);

    try {
      const globalCenterData = calculateBoundsCenter(towns);
      setCenter(globalCenterData);

      loadYearData(selectedYear, false);
      isInitializedRef.current = true;
      previousTownsRef.current = towns;
    } catch (error) {
      logger.error("Error initializing app:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to load historical data. Please try refreshing the page.";
      setError(errorMessage);
      setBounds(undefined);
      setCenter(undefined);
      setFilteredTowns([]);
    } finally {
      setIsLoading(false);
    }
  }, [towns, selectedYear, loadYearData]);

  useEffect(() => {
    if (!towns || towns.length === 0 || !isInitializedRef.current) {
      return;
    }

    try {
      loadYearData(selectedYear, false);
    } catch (error) {
      logger.error("Error processing year data:", error);
      const errorMessage =
        error instanceof Error
          ? `Failed to load data for year ${selectedYear}: ${error.message}`
          : `Failed to load data for year ${selectedYear}. Please try again.`;
      setError(errorMessage);
      setFilteredTowns([]);
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
      bounds,
      center,
      fitZoom,
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
      bounds,
      center,
      fitZoom,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

/**
 * Hook to access the AppContext.
 *
 * Provides access to global application state including selected year,
 * filtered towns, loading state, error handling, and map bounds/center/zoom.
 *
 * @returns AppContextType with all application state and methods
 * @throws Error if called outside of an AppProvider
 *
 * @example
 * ```tsx
 * const { selectedYear, setSelectedYear, filteredTowns, isLoading } = useApp();
 * ```
 */
export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
