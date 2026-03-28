import { MAP_DARK_BASEMAP_FILTER } from "@/constants/map";

function scheduleWhenIdle(cb: () => void): void {
  if (typeof window !== "undefined" && "requestIdleCallback" in window) {
    window.requestIdleCallback(() => cb(), { timeout: 2000 });
  } else {
    setTimeout(cb, 0);
  }
}

/**
 * html2canvas clones WebGL canvases but does not apply ancestor CSS `filter`. For split dark mode,
 * replace the basemap clone with a 2D bitmap that applies the same filter as the live map.
 *
 * Returns a Promise because html2canvas awaits `onclone` when it returns a thenable. Heavy work is
 * deferred with `requestIdleCallback` (with `setTimeout` fallback) so the clone callback stays off
 * the critical path until the browser is idle.
 */
export function bakeDarkBasemapIntoScreenshotClone(
  clonedDoc: Document
): Promise<void> {
  return new Promise(resolve => {
    scheduleWhenIdle(() => {
      try {
        const liveHost =
          document.querySelector<HTMLElement>("[data-map-basemap]");
        const cloneHost =
          clonedDoc.querySelector<HTMLElement>("[data-map-basemap]");
        if (!liveHost || !cloneHost) return;

        const sourceCanvas = liveHost.querySelector<HTMLCanvasElement>(
          "canvas.maplibregl-canvas"
        );
        if (!sourceCanvas?.width || !sourceCanvas?.height) return;

        const w = sourceCanvas.width;
        const h = sourceCanvas.height;
        const baked = document.createElement("canvas");
        baked.width = w;
        baked.height = h;
        const ctx = baked.getContext("2d");
        if (!ctx) return;

        ctx.filter = MAP_DARK_BASEMAP_FILTER;
        ctx.drawImage(sourceCanvas, 0, 0);
        const img = clonedDoc.createElement("img");
        img.src = baked.toDataURL("image/png");
        img.alt = "";
        img.style.cssText =
          "display:block;width:100%;height:100%;object-fit:fill;pointer-events:none;";
        cloneHost.style.filter = "none";
        cloneHost.replaceChildren(img);
      } catch {
        // Tainted canvas or unsupported filter — leave clone unchanged.
      } finally {
        resolve();
      }
    });
  });
}
