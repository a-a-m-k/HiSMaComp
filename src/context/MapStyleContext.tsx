import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import type { MapBaseStyleMode } from "@/utils/map/terrainStyle";

const STORAGE_KEY = "hismacomp-map-base-style";

function readStoredMode(): MapBaseStyleMode {
  if (typeof window === "undefined") return "light";
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    return v === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

type MapStyleContextValue = {
  mode: MapBaseStyleMode;
  setMode: (mode: MapBaseStyleMode) => void;
  toggleMode: () => void;
};

const MapStyleContext = createContext<MapStyleContextValue | null>(null);

export const MapStyleProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [mode, setModeState] = useState<MapBaseStyleMode>(readStoredMode);

  const setMode = useCallback((next: MapBaseStyleMode) => {
    setModeState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore quota / private mode */
    }
  }, []);

  const toggleMode = useCallback(() => {
    setMode(mode === "dark" ? "light" : "dark");
  }, [mode, setMode]);

  const value = useMemo(
    () => ({ mode, setMode, toggleMode }),
    [mode, setMode, toggleMode]
  );

  return (
    <MapStyleContext.Provider value={value}>
      {children}
    </MapStyleContext.Provider>
  );
};

export function useMapStyleMode(): MapStyleContextValue {
  const ctx = useContext(MapStyleContext);
  if (!ctx) {
    throw new Error("useMapStyleMode must be used within MapStyleProvider");
  }
  return ctx;
}
