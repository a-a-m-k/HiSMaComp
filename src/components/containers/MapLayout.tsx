import React, { Suspense, useState, useEffect, useRef } from "react";
import Box from "@mui/material/Box";

import { ErrorBoundary } from "@/components/dev";
import { Legend, Timeline } from "@/components/controls";
import { LoadingSpinner, ErrorOverlay } from "@/components/ui";
import {
  LEGEND_HEADING_LABEL,
  APP_MIN_WIDTH,
  Z_INDEX,
  TRANSITIONS,
} from "@/constants";
import { LayerItem, TimelineMark } from "@/common/types";
import { useApp } from "@/context/AppContext";
import { useInitialMapState } from "@/hooks/map";
import {
  useViewport,
  useNarrowLayout,
  useOverlayButtonsVisible,
} from "@/hooks/ui";
import { strings } from "@/locales";
import { lightTheme } from "@/theme/theme";
import { calculateMapArea } from "@/utils/mapZoom";
import { getInitialMapProps, useStableMapKey } from "./MapLayoutHelpers";

const LazyMapView = React.lazy(
  () => import("@/components/map/MapView/MapView")
);
const IS_TEST_ENV = import.meta.env.MODE === "test";
const MAP_ACTIVATION_MARK = "map-activation-start";
const MAP_FIRST_IDLE_MARK = "map-first-idle";
const MAP_ACTIVATION_TO_IDLE_MEASURE = "map-activation-to-first-idle";
const MAP_AUTO_ACTIVATE_DELAY_MS = 1_500;
const MAP_ACTIVATION_INTERACTION_EVENTS: Array<keyof WindowEventMap> = [
  "pointerdown",
  "keydown",
  "touchstart",
  "wheel",
];

function markPerformance(name: string): void {
  if (typeof performance === "undefined") return;
  performance.mark(name);
}

function measurePerformance(
  measureName: string,
  startMark: string,
  endMark: string
): void {
  if (typeof performance === "undefined") return;
  try {
    performance.measure(measureName, startMark, endMark);
  } catch {
    // Ignore missing/unsupported marks.
  }
}

export interface MapLayoutProps {
  legendLayers: LayerItem[];
  marks: TimelineMark[];
  showDefaultMap?: boolean;
  townsLoading?: boolean;
}

function useMapActivationGate(): {
  isMapActivated: boolean;
  mapMountGateRef: React.RefObject<HTMLDivElement | null>;
} {
  const [isMapActivated, setIsMapActivated] = useState(IS_TEST_ENV);
  const mapMountGateRef = useRef<HTMLDivElement>(null);

  const activateMap = React.useCallback(() => {
    markPerformance(MAP_ACTIVATION_MARK);
    setIsMapActivated(true);
  }, []);

  useEffect(() => {
    if (isMapActivated) return;

    for (const eventName of MAP_ACTIVATION_INTERACTION_EVENTS) {
      window.addEventListener(eventName, activateMap, { once: true });
    }

    return () => {
      for (const eventName of MAP_ACTIVATION_INTERACTION_EVENTS) {
        window.removeEventListener(eventName, activateMap);
      }
    };
  }, [activateMap, isMapActivated]);

  useEffect(() => {
    if (isMapActivated) return;
    if (typeof IntersectionObserver === "undefined") {
      activateMap();
      return;
    }

    const target = mapMountGateRef.current;
    if (!target) return;

    let idleCallbackId: number | null = null;
    let timeoutId: ReturnType<typeof globalThis.setTimeout> | null = null;
    let activated = false;

    const activateWhenIdle = () => {
      if (activated) return;
      activated = true;
      activateMap();
    };

    const scheduleDeferredActivation = () => {
      if ("requestIdleCallback" in window) {
        idleCallbackId = window.requestIdleCallback(() => activateWhenIdle(), {
          timeout: MAP_AUTO_ACTIVATE_DELAY_MS,
        });
      } else {
        timeoutId = globalThis.setTimeout(
          () => activateWhenIdle(),
          MAP_AUTO_ACTIVATE_DELAY_MS
        );
      }
    };

    const observer = new IntersectionObserver(
      entries => {
        const isVisible = entries.some(
          entry => entry.isIntersecting || entry.intersectionRatio > 0
        );
        if (isVisible) {
          scheduleDeferredActivation();
          observer.disconnect();
        }
      },
      { root: null, rootMargin: "200px", threshold: 0.01 }
    );
    observer.observe(target);

    return () => {
      observer.disconnect();
      if (idleCallbackId !== null && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(idleCallbackId);
      }
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }
    };
  }, [activateMap, isMapActivated]);

  return { isMapActivated, mapMountGateRef };
}

/**
 * Map screen layout with legend, timeline, and map canvas.
 * Also manages responsive remount overlays and initial map positioning.
 */
export const MapLayout: React.FC<MapLayoutProps> = ({
  legendLayers,
  marks,
  showDefaultMap,
  townsLoading,
}) => {
  const { towns, filteredTowns, selectedYear, isLoading, error, retry } =
    useApp();
  const viewport = useViewport();
  const narrowLayout = useNarrowLayout(viewport.rawScreenWidth);
  const [isMapIdle, setIsMapIdle] = React.useState(false);
  const { showOverlayButtons, isResizing } =
    useOverlayButtonsVisible(isMapIdle);
  const { isMapActivated, mapMountGateRef } = useMapActivationGate();

  const deviceKey = useStableMapKey(viewport);
  const prevDeviceKeyRef = useRef(deviceKey);
  const [isRemounting, setIsRemounting] = useState(false);

  const showResizeSpinner =
    !viewport.isBelowMinViewport &&
    (prevDeviceKeyRef.current !== deviceKey || isRemounting || isResizing);

  useEffect(() => {
    if (prevDeviceKeyRef.current !== deviceKey) {
      prevDeviceKeyRef.current = deviceKey;
      setIsRemounting(true);
    }
  }, [deviceKey]);

  const handleFirstIdle = React.useCallback(() => {
    markPerformance(MAP_FIRST_IDLE_MARK);
    measurePerformance(
      MAP_ACTIVATION_TO_IDLE_MEASURE,
      MAP_ACTIVATION_MARK,
      MAP_FIRST_IDLE_MARK
    );
    setIsMapIdle(true);
    setIsRemounting(false);
  }, []);

  /**
   * Use `lightTheme` for layout math only; spacing/breakpoints match `darkTheme`,
   * so toggling basemap mode does not trigger a refit.
   */
  const mapArea = React.useMemo(
    () =>
      calculateMapArea(viewport.screenWidth, viewport.screenHeight, lightTheme),
    [viewport.screenWidth, viewport.screenHeight]
  );
  const initialMapState = useInitialMapState(towns, mapArea);
  const shouldUseDefaultView =
    (showDefaultMap ?? false) ||
    (isLoading && filteredTowns.length === 0) ||
    !initialMapState.center;
  const { initialPosition, initialZoom } = getInitialMapProps(
    shouldUseDefaultView,
    initialMapState
  );
  const showHistoricalLoadingOverlay =
    townsLoading || (isLoading && filteredTowns.length === 0);

  const maxBounds = React.useMemo(() => {
    const b = initialMapState.bounds;
    if (!b) return undefined;
    const valid =
      Number.isFinite(b.minLat) &&
      Number.isFinite(b.maxLat) &&
      Number.isFinite(b.minLng) &&
      Number.isFinite(b.maxLng);
    if (!valid) return undefined;
    return [
      [b.minLng, b.minLat],
      [b.maxLng, b.maxLat],
    ] as [[number, number], [number, number]];
  }, [initialMapState.bounds]);

  React.useEffect(() => {
    document.documentElement.setAttribute("data-app-ready", "true");
    document.documentElement.style.setProperty(
      "--app-min-width",
      `${APP_MIN_WIDTH}px`
    );
    return () => {
      document.documentElement.removeAttribute("data-app-ready");
      document.documentElement.style.removeProperty("--app-min-width");
    };
  }, []);

  return (
    <Box
      id="map-container"
      sx={{
        width: "100%",
        flex: 1,
        minHeight: 0,
        minWidth: viewport.isBelowMinViewport ? APP_MIN_WIDTH : undefined,
        position: "relative",
        display: "flex",
        flexDirection: "column",
        overflowX: "auto",
      }}
    >
      {!error && (
        <Box
          sx={{
            minWidth: APP_MIN_WIDTH,
            width: narrowLayout ? APP_MIN_WIDTH : "100%",
            flexShrink: 0,
            alignSelf: "stretch",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            transition: isResizing ? "none" : TRANSITIONS.LAYOUT_WIDTH,
            ...(narrowLayout && {
              minHeight: 0,
              flex: 1,
            }),
          }}
        >
          <Legend
            label={LEGEND_HEADING_LABEL}
            layers={legendLayers}
            isMapIdle={isMapIdle}
            selectedYear={selectedYear}
          />
          <Box sx={narrowLayout ? { marginTop: "auto" } : undefined}>
            <Timeline marks={marks} />
          </Box>
        </Box>
      )}
      {error && (
        <ErrorOverlay
          title={strings.errors.dataLoadingError}
          message={error}
          onRetry={retry}
        />
      )}
      <Box
        ref={mapMountGateRef}
        sx={{
          position: "absolute",
          inset: 0,
          minHeight: 0,
          zIndex: Z_INDEX.MAP,
          overflowX: "auto",
        }}
      >
        <ErrorBoundary>
          <Suspense
            fallback={<LoadingSpinner message={strings.loading.default} />}
          >
            {isMapActivated ? (
              <LazyMapView
                key={deviceKey}
                towns={towns}
                selectedYear={selectedYear}
                initialPosition={initialPosition}
                initialZoom={initialZoom}
                maxBounds={maxBounds}
                fallbackMapSize={mapArea}
                onFirstIdle={handleFirstIdle}
                showOverlayButtons={showOverlayButtons}
                isResizing={isResizing}
              />
            ) : null}
          </Suspense>
        </ErrorBoundary>
        {!error && !isMapIdle && (
          <Box
            id="map-lcp-shell"
            aria-hidden="true"
            sx={{
              position: "absolute",
              inset: 0,
              zIndex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
              background:
                "linear-gradient(180deg, rgba(245,247,250,0.95) 0%, rgba(245,247,250,0.78) 55%, rgba(245,247,250,0.5) 100%)",
            }}
          >
            <Box
              sx={{
                px: 2.5,
                py: 1.5,
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "background.paper",
                boxShadow: 1,
                textAlign: "center",
              }}
            >
              <Box
                component="p"
                sx={{
                  m: 0,
                  fontSize: { xs: 20, sm: 24 },
                  fontWeight: 700,
                  lineHeight: 1.2,
                  color: "text.primary",
                }}
              >
                European population
              </Box>
            </Box>
          </Box>
        )}
        {showResizeSpinner && (
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              zIndex: 1,
            }}
          >
            <LoadingSpinner message={strings.loading.resizingMap} />
          </Box>
        )}
      </Box>
      {/* Show full-screen data loading only when no towns are currently renderable. */}
      {showHistoricalLoadingOverlay && (
        <LoadingSpinner message={strings.loading.loadingHistoricalData} />
      )}
    </Box>
  );
};
