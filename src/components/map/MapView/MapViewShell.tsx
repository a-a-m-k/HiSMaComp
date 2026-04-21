import React from "react";

import { strings } from "@/locales";
import { LoadingSpinner } from "@/components/ui";

type MapViewShellProps = {
  mapStyles: string;
  atMinZoom: boolean;
  mapDescription: string;
  mapStyleMode: "light" | "dark";
  showOverlayButtons: boolean;
  isStyleSwitching: boolean;
  /** True after overlay map has fired `idle` at least once (tiles/styles settled). */
  mapReady: boolean;
  containerRef: React.RefObject<HTMLDivElement | null>;
  children: React.ReactNode;
};

export const MapViewShell: React.FC<MapViewShellProps> = ({
  mapStyles,
  atMinZoom,
  mapDescription,
  mapStyleMode,
  showOverlayButtons,
  isStyleSwitching,
  mapReady,
  containerRef,
  children,
}) => (
  <div
    data-zoom-at-min={atMinZoom ? "" : undefined}
    style={{ position: "relative", width: "100%", height: "100%" }}
  >
    <style>{mapStyles}</style>
    <div id="map-description" className="sr-only">
      {mapDescription}
    </div>
    <div
      id="map-container-area"
      ref={containerRef as React.Ref<HTMLDivElement>}
      role="application"
      aria-busy={isStyleSwitching}
      aria-label={strings.map.ariaLabel}
      aria-describedby="map-description"
      data-map-appearance={mapStyleMode}
      data-map-ready={mapReady ? "true" : undefined}
      data-overlay-buttons-hidden={showOverlayButtons ? undefined : ""}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        outline: "none",
      }}
      tabIndex={0}
    >
      {children}
      {isStyleSwitching && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 2,
            pointerEvents: "none",
          }}
        >
          <LoadingSpinner
            message={strings.loading.switchingMapStyle}
            overlayOpacity={1}
            blurPx={0}
          />
        </div>
      )}
    </div>
  </div>
);
