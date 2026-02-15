# Rollback Plan for Option 4: Reduce MapLibre Bundle Size

## Overview

This document outlines rollback strategies for Option 4 (Reduce MapLibre Bundle Size), which involves potentially replacing or significantly modifying the MapLibre GL library usage. This is a high-risk optimization that could introduce breaking changes.

---

## Risk Assessment

### High-Risk Scenarios

1. **Library Replacement** (Option 4B: Replace with Leaflet/Mapbox GL Lite)
   - Different API surface
   - Feature compatibility issues
   - Styling differences
   - Performance regressions

2. **Tree-Shaking** (Option 4C: Tree-shake unused features)
   - Accidental removal of required features
   - Runtime errors from missing dependencies
   - Build configuration issues

3. **CDN Migration** (Option 4A: Use MapLibre CDN)
   - Network dependency
   - Version compatibility
   - CSP policy changes

---

## Rollback Strategies

### Strategy 1: Git-Based Rollback (Simplest)

**When to use:** Complete failure, breaking changes, or significant performance regression

**Implementation:**

```bash
# Create a backup branch before starting
git checkout -b backup/maplibre-optimization
git push origin backup/maplibre-optimization

# Work on optimization branch
git checkout -b feature/reduce-maplibre-bundle
# ... make changes ...

# If rollback needed:
git checkout optimization-v1
git branch -D feature/reduce-maplibre-bundle
```

**Pros:**

- ✅ Simple and fast
- ✅ Complete restoration
- ✅ No code changes needed

**Cons:**

- ❌ Loses all optimization work
- ❌ Requires manual re-application of other changes

**Best for:** Complete failures or when optimization proves infeasible

---

### Strategy 2: Feature Flag Rollback (Recommended)

**When to use:** Gradual rollout, A/B testing, or partial failures

**Implementation:**

1. **Create a feature flag system:**

```typescript
// src/config/featureFlags.ts
export const FEATURE_FLAGS = {
  USE_LIGHTWEIGHT_MAP: process.env.VITE_USE_LIGHTWEIGHT_MAP === "true",
  USE_MAPLIBRE_CDN: process.env.VITE_USE_MAPLIBRE_CDN === "true",
} as const;
```

2. **Wrap map implementation:**

```typescript
// src/components/map/MapView/MapView.tsx
import { FEATURE_FLAGS } from '@/config/featureFlags';

const MapView: React.FC<MapViewComponentProps> = (props) => {
  if (FEATURE_FLAGS.USE_LIGHTWEIGHT_MAP) {
    return <LightweightMapView {...props} />;
  }
  return <MapLibreMapView {...props} />;
};
```

3. **Environment-based control:**

```bash
# .env.production
VITE_USE_LIGHTWEIGHT_MAP=false  # Rollback: set to false

# .env.development
VITE_USE_LIGHTWEIGHT_MAP=true   # Test new implementation
```

4. **Quick rollback:**

```bash
# Just change environment variable
VITE_USE_LIGHTWEIGHT_MAP=false npm run build
```

**Pros:**

- ✅ Instant rollback (no code changes)
- ✅ Can test both implementations
- ✅ Gradual rollout possible
- ✅ Easy A/B testing

**Cons:**

- ❌ Requires maintaining two implementations
- ❌ Slightly larger bundle (unused code)

**Best for:** Production deployments, gradual rollouts

---

### Strategy 3: Incremental Migration with Compatibility Layer

**When to use:** Large API changes, library replacement

**Implementation:**

1. **Create abstraction layer:**

```typescript
// src/services/map/MapAdapter.ts
export interface IMapAdapter {
  renderMap(container: HTMLElement, options: MapOptions): Promise<void>;
  updateView(center: LatLng, zoom: number): void;
  addLayer(layer: LayerConfig): void;
  // ... other methods
}

// MapLibre implementation
export class MapLibreAdapter implements IMapAdapter {
  // ... existing MapLibre code
}

// Lightweight implementation
export class LightweightMapAdapter implements IMapAdapter {
  // ... new lightweight implementation
}
```

2. **Factory pattern:**

```typescript
// src/services/map/MapFactory.ts
export function createMapAdapter(): IMapAdapter {
  if (FEATURE_FLAGS.USE_LIGHTWEIGHT_MAP) {
    return new LightweightMapAdapter();
  }
  return new MapLibreAdapter();
}
```

3. **Rollback:**

```typescript
// Just change factory return
export function createMapAdapter(): IMapAdapter {
  return new MapLibreAdapter(); // Rollback to original
}
```

**Pros:**

- ✅ Clean separation of concerns
- ✅ Easy to swap implementations
- ✅ Can test both side-by-side
- ✅ Maintains type safety

**Cons:**

- ❌ More upfront work
- ❌ Requires refactoring existing code

**Best for:** Library replacements, major API changes

---

### Strategy 4: Conditional Build Configuration

**When to use:** Build-time optimizations, tree-shaking experiments

**Implementation:**

1. **Vite conditional config:**

```typescript
// vite.config.ts
export default defineConfig(({ command, mode }) => {
  const useOptimizedMap = process.env.VITE_OPTIMIZE_MAP === "true";

  return {
    build: {
      rollupOptions: {
        external: useOptimizedMap ? [] : ["maplibre-gl"], // Conditional external
        // ... other optimizations
      },
    },
    resolve: {
      alias: useOptimizedMap
        ? { "maplibre-gl": "maplibre-gl/dist/maplibre-gl.min.js" }
        : {},
    },
  };
});
```

2. **Rollback:**

```bash
# Remove optimization flag
unset VITE_OPTIMIZE_MAP
npm run build
```

**Pros:**

- ✅ Build-time only
- ✅ No runtime overhead
- ✅ Easy to toggle

**Cons:**

- ❌ Requires rebuild
- ❌ Limited to build-time changes

**Best for:** Tree-shaking, bundle optimization experiments

---

## Testing Strategy Before Rollback

### Pre-Rollback Checklist

1. **Functional Testing:**
   - [ ] Map renders correctly
   - [ ] All interactions work (pan, zoom, click)
   - [ ] Markers display properly
   - [ ] Timeline filtering works
   - [ ] Screenshot functionality works
   - [ ] Keyboard navigation works
   - [ ] Mobile touch gestures work

2. **Performance Testing:**
   - [ ] Lighthouse scores (should improve)
   - [ ] Bundle size (should decrease)
   - [ ] LCP metric (should improve)
   - [ ] Memory usage (should not increase)

3. **Cross-Browser Testing:**
   - [ ] Chrome/Edge
   - [ ] Firefox
   - [ ] Safari
   - [ ] Mobile browsers

4. **Regression Testing:**
   - [ ] All existing tests pass
   - [ ] No console errors
   - [ ] No visual regressions

### Rollback Triggers

**Immediate Rollback Required:**

- ❌ Map doesn't render
- ❌ Critical features broken
- ❌ Performance worse than before
- ❌ Bundle size increased
- ❌ Breaking errors in production

**Consider Rollback:**

- ⚠️ Minor visual differences
- ⚠️ Slight performance regression
- ⚠️ Non-critical features missing
- ⚠️ Browser compatibility issues

---

## Rollback Procedures

### Quick Rollback (Feature Flag)

```bash
# 1. Update environment variable
echo "VITE_USE_LIGHTWEIGHT_MAP=false" >> .env.production

# 2. Rebuild
npm run build

# 3. Deploy
npm run deploy
```

**Time:** ~2 minutes

### Git Rollback

```bash
# 1. Identify last good commit
git log --oneline | grep "before maplibre optimization"

# 2. Create rollback branch
git checkout -b rollback/maplibre-$(date +%Y%m%d)

# 3. Revert commits
git revert <commit-hash>..HEAD

# 4. Test rollback
npm run build
npm run test

# 5. Merge rollback
git checkout optimization-v1
git merge rollback/maplibre-$(date +%Y%m%d)
git push origin optimization-v1
```

**Time:** ~10 minutes

### Full Restoration

```bash
# 1. Switch to backup branch
git checkout backup/maplibre-optimization

# 2. Create new branch from backup
git checkout -b restore/maplibre-original

# 3. Cherry-pick any unrelated changes
git cherry-pick <commit-hash>

# 4. Replace current branch
git branch -f optimization-v1 restore/maplibre-original
git push origin optimization-v1 --force
```

**Time:** ~15 minutes

---

## Documentation Requirements

### Before Starting Optimization

1. **Baseline Metrics:**

   ```markdown
   ## Baseline (Before Optimization)

   - Bundle Size: 424 KB (gzipped)
   - MapLibre: 247.79 KB (gzipped)
   - LCP: 4.0s
   - FCP: 3.0s
   - Lighthouse Score: [score]
   ```

2. **Feature Inventory:**
   - List all MapLibre features used
   - Document API usage
   - Note any custom configurations

3. **Test Coverage:**
   - Ensure all map-related tests pass
   - Document test scenarios

### During Optimization

1. **Change Log:**
   - Document each change
   - Note any API differences
   - Record performance metrics

2. **Comparison Matrix:**
   ```markdown
   | Feature       | MapLibre | Alternative | Status     |
   | ------------- | -------- | ----------- | ---------- |
   | Vector Tiles  | ✅       | ✅          | Compatible |
   | Custom Layers | ✅       | ⚠️          | Partial    |
   | WebGL         | ✅       | ❌          | Missing    |
   ```

### After Rollback

1. **Post-Mortem:**
   - Why rollback was needed
   - What went wrong
   - Lessons learned
   - Future considerations

---

## Recommended Approach for This Project

### For Code Example / Interview Project

**Recommended:** **Strategy 1 (Git-Based Rollback)** + **Strategy 2 (Feature Flag)**

**Why:**

1. **Simple and clear** - Easy to explain in interviews
2. **Demonstrates best practices** - Shows you think about risk
3. **Flexible** - Can test without breaking production
4. **Documented** - Shows planning and foresight

**Implementation Steps:**

1. **Before starting:**

   ```bash
   # Create backup branch
   git checkout -b backup/before-maplibre-optimization
   git push origin backup/before-maplibre-optimization

   # Tag current state
   git tag v1.0-stable
   git push origin v1.0-stable
   ```

2. **During optimization:**

   ```bash
   # Work on feature branch
   git checkout -b feature/maplibre-optimization
   # ... make changes with feature flags ...
   ```

3. **If rollback needed:**

   ```bash
   # Quick rollback via feature flag
   VITE_USE_LIGHTWEIGHT_MAP=false npm run build

   # Or full rollback
   git checkout backup/before-maplibre-optimization
   ```

---

## Monitoring and Alerts

### Key Metrics to Monitor

1. **Performance:**
   - LCP (should improve)
   - FCP (should improve)
   - Bundle size (should decrease)
   - Memory usage (should not increase)

2. **Functionality:**
   - Error rate
   - User interactions
   - Feature usage

3. **User Experience:**
   - Page load time
   - Map render time
   - Interaction responsiveness

### Rollback Decision Matrix

| Metric            | Threshold        | Action   |
| ----------------- | ---------------- | -------- |
| LCP               | > 4.5s (worse)   | Rollback |
| Bundle Size       | > 250KB (larger) | Rollback |
| Error Rate        | > 1%             | Rollback |
| Test Failures     | Any              | Rollback |
| Visual Regression | Critical         | Rollback |

---

## Best Practices

1. **Always create backup branch** before major changes
2. **Use feature flags** for risky optimizations
3. **Test thoroughly** before considering rollback unnecessary
4. **Document everything** - changes, metrics, decisions
5. **Monitor closely** after deployment
6. **Have rollback plan ready** before starting
7. **Test rollback procedure** before you need it

---

## Example: Complete Rollback Workflow

```bash
# 1. BEFORE: Create safety net
git checkout optimization-v1
git checkout -b backup/before-maplibre-$(date +%Y%m%d)
git push origin backup/before-maplibre-$(date +%Y%m%d)
git tag v1.0-stable
git push origin v1.0-stable

# 2. DURING: Work on optimization
git checkout -b feature/maplibre-optimization
# ... implement with feature flags ...

# 3. TEST: Verify optimization works
npm run build
npm run test
npm run preview
# Test in browser, check Lighthouse

# 4. IF ROLLBACK NEEDED: Quick rollback
git checkout optimization-v1
# Or use feature flag: VITE_USE_LIGHTWEIGHT_MAP=false

# 5. IF COMPLETE FAILURE: Full restoration
git checkout backup/before-maplibre-$(date +%Y%m%d)
git checkout -b restore/maplibre-original
git push origin restore/maplibre-original
```

---

## Summary

**For this project (code example), I recommend:**

1. ✅ **Git-based rollback** (backup branch + tags)
2. ✅ **Feature flag approach** (if implementing new library)
3. ✅ **Thorough testing** before and after
4. ✅ **Documentation** of all changes
5. ✅ **Monitoring** of key metrics

**Quick Rollback Options:**

- **Feature Flag:** Change env variable (2 min)
- **Git Revert:** Revert commits (10 min)
- **Branch Switch:** Switch to backup (5 min)

**Remember:** It's better to have a rollback plan and not need it, than to need it and not have one!
