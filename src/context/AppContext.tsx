import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
} from "react";

import { Town } from "@/common/types";
import { YEARS } from "@/constants";
import { logger } from "@/utils/logger";
import { useYearDataController } from "./useYearDataController";

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
  const { filteredTowns, isLoading, error, clearError, retry } =
    useYearDataController({
      towns,
      selectedYear,
    });

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
