# Redundancy Audit Report

## Scope

This review focuses on redundant logic, duplicate configuration, repeated scripts, and maintainability risks across:

- Source code (`src/`)
- Tooling/config (`package.json`, `vite`, `eslint`, `vitest`)
- CI/CD workflows (`.github/workflows`)
- Tests (`tests/`)

## Findings (Ordered by Priority)

### High

#### 1) Timeline height constants are duplicated and inconsistent

Multiple locations define timeline heights with conflicting values:

- `src/constants/ui.ts`
- `src/utils/zoom/zoomHelpers.ts`
- `src/constants/map.ts`
- `src/index.css`

Current mismatch examples:

- Desktop timeline height appears as both `110` and `100`
- `MOBILE_TIMELINE_HEIGHT = 110` in `src/constants/map.ts` conflicts with other mobile values

**Risk:** layout drift, incorrect positioning math, subtle mobile/desktop regressions.

**Recommendation:** keep one source of truth (prefer `src/constants/ui.ts`) and derive other usage from it.

---

#### 2) Marker size/color logic is duplicated in two systems

Equivalent behavior exists in:

- MapLibre expression builders:
  - `src/components/map/MapView/MapLayer/expressions.ts`
- JS helpers for marker components:
  - `src/utils/markers/markerSize.ts`
  - `src/utils/markers/markerColor.ts`

**Risk:** future updates can diverge between map layer and marker components.

**Recommendation:** extract a shared marker scaling/color model and generate both expression + JS logic from the same data model.

---

### Medium

#### 3) Tooltip style generation is duplicated

In `src/constants/ui.ts`, tooltip CSS is generated via helper functions and also repeated inline in navigation control styles.

**Risk:** duplicated maintenance and inconsistent tooltip behavior over time.

**Recommendation:** route all tooltip CSS generation through one helper path.

---

#### 4) Test scripts repeat `NODE_OPTIONS` 5 times

`package.json` repeats:

`NODE_OPTIONS=--max-old-space-size=4096`

for `test`, `test:ui`, `test:run`, `test:coverage`, `test:unit`.

**Risk:** noisy scripts, easy to forget updates.

**Recommendation:** centralize this setting in a wrapper script or environment configuration.

---

#### 5) Bundle size script hides gzip/read failures

In `scripts/check-bundle-size.js`, `getGzipSizeKiB()` returns `0` on errors.

**Risk:** false sense of compliance if a file read/compression fails.

**Recommendation:** fail loudly (or log warning + strict mode) instead of silently returning zero.

---

### Low

#### 6) Minor documentation mismatch in LCP plugin comments

`vite-plugin-lcp-legend.ts` comments reference `legendLcp.ts`, while the actual source is `legendLcp.json`.

**Risk:** confusion for future contributors.

**Recommendation:** update comments to match real source.

---

#### 7) Test mocks are repeated across many files

Repeated mocks include:

- `@/utils/logger`
- `@/context/AppContext`
- `@/hooks/ui`
- `react-map-gl/maplibre`

**Risk:** high maintenance and drift between test files.

**Recommendation:** add shared test mock factories under `tests/helpers/mocks/`.

## What Is Already Improved

- Deployment was simplified to one active deploy workflow path.
- Recent map idle handling moved toward React state/prop flow in latest changes.

## Recommended Fix Order

1. Unify timeline constants into one source of truth.
2. Consolidate marker size/color logic.
3. Deduplicate tooltip style generation.
4. Centralize repeated test script memory option.
5. Harden bundle size check error handling.
6. Refactor repeated test mocks into shared helpers.

## Notes

This report prioritizes redundancy and maintainability. It is not a full security or performance audit, although several findings reduce performance/debugging risk indirectly.
