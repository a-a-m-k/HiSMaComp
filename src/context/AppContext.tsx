import React, { createContext, useContext, useState, useMemo } from "react";
import { Town } from "@/common/types";
import { YEARS } from "@/constants";
import { filterTownsByYear } from "@/utils/utils";

interface AppContextType {
  selectedYear: number;
  setSelectedYear: (year: number) => void;
  filteredTowns: Town[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: React.ReactNode;
  towns: Town[];
}

export const AppProvider: React.FC<AppProviderProps> = ({
  children,
  towns,
}) => {
  const [selectedYear, setSelectedYear] = useState<number>(YEARS[0]);

  const filteredTowns = useMemo(() => {
    try {
      return filterTownsByYear(towns, selectedYear);
    } catch (error) {
      console.error("Error filtering towns by year:", error);
      return [];
    }
  }, [towns, selectedYear]);

  const value = useMemo(
    () => ({
      selectedYear,
      setSelectedYear,
      filteredTowns,
    }),
    [selectedYear, setSelectedYear, filteredTowns]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
