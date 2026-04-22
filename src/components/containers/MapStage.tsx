import React, { Suspense } from "react";
import Box from "@mui/material/Box";

import { ErrorBoundary } from "@/components/dev";
import { LoadingSpinner } from "@/components/ui";
import { Town } from "@/common/types";
import { Z_INDEX } from "@/constants";
import { strings } from "@/locales";

const LazyMapView = React.lazy(
  () => import("@/components/map/MapView/MapView")
);

type MapStageProps = {
  mapMountGateRef: React.RefObject<HTMLDivElement | null>;
  isMapActivated: boolean;
  deviceKey: string;
  towns: Town[];
  selectedYear: number;
  initialPosition: { longitude: number; latitude: number };
  initialZoom: number;
  maxBounds?: [[number, number], [number, number]];
  mapArea: { effectiveWidth: number; effectiveHeight: number };
  handleFirstIdle: () => void;
  showOverlayButtons: boolean;
  isResizing: boolean;
  isMapIdle: boolean;
  showResizeSpinner: boolean;
  hasError: boolean;
};

export const MapStage: React.FC<MapStageProps> = ({
  mapMountGateRef,
  isMapActivated,
  deviceKey,
  towns,
  selectedYear,
  initialPosition,
  initialZoom,
  maxBounds,
  mapArea,
  handleFirstIdle,
  showOverlayButtons,
  isResizing,
  isMapIdle,
  showResizeSpinner,
  hasError,
}) => (
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
      <Suspense fallback={<LoadingSpinner message={strings.loading.default} />}>
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
    {!hasError && !isMapIdle && (
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
);
