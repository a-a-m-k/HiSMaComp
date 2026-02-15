import type { Plugin } from "vite";

/**
 * Vite plugin to replace maplibre-gl imports with CDN global variable
 * 
 * This plugin ensures that all imports of maplibre-gl (including from react-map-gl)
 * are replaced with window.maplibregl, which is loaded from CDN.
 * 
 * The plugin works in two stages:
 * 1. resolveId: Marks maplibre-gl as external (prevents bundling)
 * 2. transform: Replaces import statements in source code before bundling
 * 3. renderChunk: Final safety check to replace any remaining references
 */
export function vitePluginMaplibreCDN(): Plugin {
  return {
    name: "vite-plugin-maplibre-cdn",
    enforce: "pre", // Run before other plugins to catch imports early
    apply: "build", // Only in production builds
    resolveId(id, importer) {
      // Mark maplibre-gl as external so it's not bundled
      // This handles imports from our code and from dependencies like react-map-gl
      if (id === "maplibre-gl") {
        return {
          id: "maplibre-gl",
          external: true,
        };
      }
      return null;
    },
    transform(code, id) {
      // Transform source code to replace maplibre-gl imports with global variable
      // This catches imports before they're processed by Rollup
      // Transform our code and any node_modules that import maplibre-gl
      if (
        !id.includes("node_modules") ||
        id.includes("react-map-gl") ||
        id.includes("maplibre-gl")
      ) {
        let modifiedCode = code;
        let hasChanges = false;
        
        // Replace: import X from 'maplibre-gl'
        if (code.includes("import") && code.includes("maplibre-gl")) {
          modifiedCode = modifiedCode.replace(
            /import\s+(\w+)\s+from\s+['"]maplibre-gl['"]/g,
            "const $1 = window.maplibregl"
          );
          hasChanges = true;
        }
        
        // Replace: import * as X from 'maplibre-gl'
        if (code.includes("import *") && code.includes("maplibre-gl")) {
          modifiedCode = modifiedCode.replace(
            /import\s+\*\s+as\s+(\w+)\s+from\s+['"]maplibre-gl['"]/g,
            "const $1 = window.maplibregl"
          );
          hasChanges = true;
        }
        
        // Replace: import { X, Y } from 'maplibre-gl'
        if (code.includes("import {") && code.includes("maplibre-gl")) {
          modifiedCode = modifiedCode.replace(
            /import\s+\{([^}]+)\}\s+from\s+['"]maplibre-gl['"]/g,
            (match, imports) => {
              const names = imports
                .split(",")
                .map((name: string) => name.trim().split(" as ")[0].trim());
              return names
                .map((name: string) => `const ${name} = window.maplibregl.${name}`)
                .join("; ");
            }
          );
          hasChanges = true;
        }
        
        // Replace: require('maplibre-gl')
        if (code.includes("require") && code.includes("maplibre-gl")) {
          modifiedCode = modifiedCode.replace(
            /require\(['"]maplibre-gl['"]\)/g,
            "window.maplibregl"
          );
          hasChanges = true;
        }
        
        // Replace: import('maplibre-gl')
        if (code.includes("import(") && code.includes("maplibre-gl")) {
          modifiedCode = modifiedCode.replace(
            /import\(['"]maplibre-gl['"]\)/g,
            "Promise.resolve(window.maplibregl)"
          );
          hasChanges = true;
        }
        
        if (hasChanges) {
          return {
            code: modifiedCode,
            map: null,
          };
        }
      }
      
      return null;
    },
    renderChunk(code, chunk) {
      // Critical: Replace ALL import statements for maplibre-gl in ALL chunks
      // In ES module format, external modules still create import statements
      // We must replace these with the global variable to prevent runtime errors
      // Process ALL chunks, not just entry chunks, as imports can be in any chunk
      if (!code.includes("maplibre-gl")) {
        return null; // Skip chunks that don't reference maplibre-gl
      }
      
      let modifiedCode = code;
      let hasChanges = false;
      
      // Replace ES module imports (most critical - these cause the runtime error)
      // Pattern: import X from 'maplibre-gl'
      const defaultImportPattern = /import\s+(\w+)\s+from\s+['"]maplibre-gl['"]/g;
      if (defaultImportPattern.test(code)) {
        modifiedCode = modifiedCode.replace(
          defaultImportPattern,
          "const $1 = window.maplibregl"
        );
        hasChanges = true;
      }
      
      // Replace: import * as X from 'maplibre-gl'
      const namespaceImportPattern = /import\s+\*\s+as\s+(\w+)\s+from\s+['"]maplibre-gl['"]/g;
      if (namespaceImportPattern.test(modifiedCode)) {
        modifiedCode = modifiedCode.replace(
          namespaceImportPattern,
          "const $1 = window.maplibregl"
        );
        hasChanges = true;
      }
      
      // Replace: import { X, Y } from 'maplibre-gl'
      const namedImportPattern = /import\s+\{([^}]+)\}\s+from\s+['"]maplibre-gl['"]/g;
      if (namedImportPattern.test(modifiedCode)) {
        modifiedCode = modifiedCode.replace(
          namedImportPattern,
          (match, imports) => {
            const names = imports
              .split(",")
              .map((name: string) => name.trim().split(" as ")[0].trim());
            return names
              .map((name: string) => `const ${name} = window.maplibregl.${name}`)
              .join("; ");
          }
        );
        hasChanges = true;
      }
      
      // Replace dynamic imports: import('maplibre-gl')
      const dynamicImportPattern = /import\(['"]maplibre-gl['"]\)/g;
      if (dynamicImportPattern.test(modifiedCode)) {
        modifiedCode = modifiedCode.replace(
          dynamicImportPattern,
          "Promise.resolve(window.maplibregl)"
        );
        hasChanges = true;
      }
      
      // Replace CommonJS requires (if any)
      const requirePattern = /(\w+)\s*=\s*require\(['"]maplibre-gl['"]\)/g;
      if (requirePattern.test(modifiedCode)) {
        modifiedCode = modifiedCode.replace(
          requirePattern,
          "$1 = window.maplibregl"
        );
        hasChanges = true;
      }
      
      if (hasChanges) {
        return {
          code: modifiedCode,
          map: null,
        };
      }
      
      return null;
    },
  };
}
