# LCP Mobile Optimization Plan

**Current Issue:** LCP is 4 seconds on mobile (Target: < 2.5s)  
**Gap:** 1.5 seconds over target

## Root Cause Analysis

### Current Loading Sequence (Mobile)
1. **HTML + Critical CSS** (~100ms) ✅ Fast
2. **Main JS bundle** (13.59 KB gzipped) (~200-300ms on 3G)
3. **Towns data** (3.01 KB gzipped) (~100ms) - **Blocking**
4. **AppContext processing** (~50-100ms) - **Blocking**
5. **MapView lazy load** (9.48 KB gzipped) (~150ms)
6. **MapLibre GL** (247.79 KB gzipped) (~800-1200ms on 3G) - **Major bottleneck**
7. **Vendor bundle** (142.91 KB gzipped) (~500-700ms on 3G)
8. **Map initialization** (~200-300ms)
9. **First tile load** (~200-400ms)
10. **Map render** (~100ms)

**Total:** ~2.5-3.5s (theoretical) + network overhead = **~4s actual**

### Key Bottlenecks
1. **MapLibre GL bundle** (247KB gzipped) - Largest single file
2. **Sequential loading** - Each step waits for previous
3. **Towns data blocking** - Map can't render without data
4. **No progressive rendering** - Map container empty until everything loads

---

## Optimization Options (Prioritized)

### 🚀 **Option 1: Preload MapLibre GL (High Impact, Low Effort)**

**What:** Preload MapLibre GL bundle before it's needed

**Implementation:**
- Add `<link rel="modulepreload">` for MapLibre chunk
- Detect MapLibre chunk in build output
- Inject preload hint in HTML

**Expected Impact:**
- **-300 to -500ms** on mobile
- MapLibre starts downloading earlier
- Parallel with other resources

**Effort:** 30 minutes  
**Risk:** Low  
**Priority:** ⭐⭐⭐⭐⭐

---

### 🚀 **Option 2: Progressive Map Rendering (High Impact, Medium Effort)**

**What:** Show map container immediately with placeholder, render map progressively

**Implementation:**
- Render map container immediately (no lazy load)
- Show static placeholder image or gradient
- Load MapLibre in background
- Swap placeholder when map ready

**Expected Impact:**
- **-400 to -600ms** perceived LCP
- User sees content immediately
- Better perceived performance

**Effort:** 2-3 hours  
**Risk:** Medium (layout shift potential)  
**Priority:** ⭐⭐⭐⭐⭐

**Code Changes:**
```tsx
// Render container immediately, load map async
<div id="map-container" style={{ background: 'linear-gradient(...)' }}>
  {mapReady ? <MapView /> : <MapPlaceholder />}
</div>
```

---

### 🚀 **Option 3: Optimize Loading Sequence (High Impact, Medium Effort)**

**What:** Load towns data and MapLibre in parallel, don't block on data processing

**Implementation:**
- Start MapLibre download immediately (don't wait for towns)
- Process towns data in parallel with map initialization
- Use default map view while data processes
- Update map when data ready

**Expected Impact:**
- **-200 to -400ms** on mobile
- Parallel resource loading
- Faster time to interactive

**Effort:** 2-3 hours  
**Risk:** Medium (requires refactoring)  
**Priority:** ⭐⭐⭐⭐

**Code Changes:**
```tsx
// Start map load immediately, update when data ready
useEffect(() => {
  // Start map load
  loadMapLibre();
  // Load towns in parallel
  loadTowns().then(processData);
}, []);
```

---

### ⚡ **Option 4: Reduce MapLibre Bundle Size (Medium Impact, High Effort)**

**What:** Use lighter map library or tree-shake MapLibre

**Implementation Options:**
- **A)** Use MapLibre CDN with selective imports (if possible)
- **B)** Replace with lighter alternative (Leaflet, Mapbox GL Lite)
- **C)** Tree-shake unused MapLibre features
- **D)** Use MapLibre worker build (if available)

**Expected Impact:**
- **-200 to -400ms** if bundle reduced by 30-50%
- Smaller download on mobile
- Faster parse/execute

**Effort:** 4-8 hours (depending on option)  
**Risk:** High (breaking changes, feature loss)  
**Priority:** ⭐⭐⭐

**Note:** MapLibre is already optimized, this may not be feasible

---

### ⚡ **Option 5: Intersection Observer for Map (Medium Impact, Low Effort)**

**What:** Only load map when viewport is ready/visible

**Implementation:**
- Use Intersection Observer API
- Load map when container enters viewport
- Preload map resources on page load
- Start initialization when visible

**Expected Impact:**
- **-100 to -200ms** on mobile
- Better resource prioritization
- Faster initial page load

**Effort:** 1-2 hours  
**Risk:** Low  
**Priority:** ⭐⭐⭐⭐

**Code Changes:**
```tsx
const [shouldLoadMap, setShouldLoadMap] = useState(false);

useEffect(() => {
  const observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      setShouldLoadMap(true);
      observer.disconnect();
    }
  });
  observer.observe(containerRef.current);
}, []);
```

---

### ⚡ **Option 6: Preconnect to Tile Server (Medium Impact, Low Effort)**

**What:** Establish connection to Stadia Maps earlier

**Implementation:**
- Add `<link rel="preconnect">` for tiles.stadiamaps.com (already done ✅)
- Add `<link rel="dns-prefetch">` as fallback
- Preconnect to API endpoint if needed

**Expected Impact:**
- **-50 to -100ms** on first tile load
- Faster tile requests
- Better connection reuse

**Effort:** 15 minutes  
**Risk:** Low  
**Priority:** ⭐⭐⭐

**Note:** Already implemented, verify it's working

---

### ⚡ **Option 7: Optimize Towns Data Loading (Low Impact, Medium Effort)**

**What:** Stream or chunk towns data, use default view first

**Implementation:**
- Load minimal data for initial view
- Stream remaining data
- Use default map center/zoom initially
- Update when full data loads

**Expected Impact:**
- **-100 to -200ms** on mobile
- Faster initial render
- Progressive enhancement

**Effort:** 3-4 hours  
**Risk:** Medium (data structure changes)  
**Priority:** ⭐⭐⭐

---

### ⚡ **Option 8: Service Worker Precache (Low Impact, Low Effort)**

**What:** Precache MapLibre and vendor bundles in service worker

**Implementation:**
- Update service worker to precache critical bundles
- Cache MapLibre on first visit
- Serve from cache on repeat visits

**Expected Impact:**
- **-800 to -1200ms** on repeat visits
- **0ms** on first visit (no change)
- Better mobile experience for returning users

**Effort:** 1-2 hours  
**Risk:** Low  
**Priority:** ⭐⭐⭐⭐ (for repeat visits)

---

### ⚡ **Option 9: Reduce Vendor Bundle (Low Impact, High Effort)**

**What:** Further optimize Material-UI usage

**Implementation:**
- Audit Material-UI imports
- Replace with lighter alternatives where possible
- Use CSS-in-JS only for dynamic styles
- Consider removing unused MUI features

**Expected Impact:**
- **-100 to -200ms** if 20-30% reduction
- Smaller bundle size
- Faster parse/execute

**Effort:** 4-6 hours  
**Risk:** Medium (UI changes)  
**Priority:** ⭐⭐

---

### ⚡ **Option 10: Mobile-Specific Bundle (High Impact, High Effort)**

**What:** Create separate mobile bundle with lighter features

**Implementation:**
- Detect mobile device
- Load mobile-optimized bundle
- Remove non-essential features on mobile
- Use lighter map library on mobile

**Expected Impact:**
- **-500 to -800ms** on mobile
- Significantly smaller bundle
- Better mobile performance

**Effort:** 8-12 hours  
**Risk:** High (maintenance burden)  
**Priority:** ⭐⭐⭐ (if other options don't work)

---

## Recommended Implementation Plan

### Phase 1: Quick Wins (Target: -500ms)
1. ✅ **Option 1:** Preload MapLibre GL (30 min)
2. ✅ **Option 5:** Intersection Observer (1-2 hours)
3. ✅ **Option 6:** Verify preconnect (15 min)

**Expected Result:** LCP ~3.5s → **~3.0s**

### Phase 2: Progressive Rendering (Target: -400ms)
4. ✅ **Option 2:** Progressive map rendering (2-3 hours)

**Expected Result:** LCP ~3.0s → **~2.6s** (perceived)

### Phase 3: Parallel Loading (Target: -300ms)
5. ✅ **Option 3:** Optimize loading sequence (2-3 hours)

**Expected Result:** LCP ~2.6s → **~2.3s** ✅ **Target achieved!**

### Phase 4: Further Optimization (If needed)
6. ✅ **Option 8:** Service worker precache (1-2 hours) - for repeat visits
7. ✅ **Option 7:** Optimize towns data (3-4 hours) - if still needed

---

## Implementation Priority Matrix

| Option | Impact | Effort | Priority | ETA |
|--------|--------|--------|----------|-----|
| **1. Preload MapLibre** | High | Low | ⭐⭐⭐⭐⭐ | 30 min |
| **2. Progressive Rendering** | High | Medium | ⭐⭐⭐⭐⭐ | 2-3 hrs |
| **3. Parallel Loading** | High | Medium | ⭐⭐⭐⭐ | 2-3 hrs |
| **5. Intersection Observer** | Medium | Low | ⭐⭐⭐⭐ | 1-2 hrs |
| **8. Service Worker** | Low (first) / High (repeat) | Low | ⭐⭐⭐⭐ | 1-2 hrs |
| **6. Preconnect** | Medium | Low | ⭐⭐⭐ | 15 min |
| **7. Towns Data** | Low | Medium | ⭐⭐⭐ | 3-4 hrs |
| **4. Reduce Bundle** | Medium | High | ⭐⭐⭐ | 4-8 hrs |
| **9. Vendor Bundle** | Low | High | ⭐⭐ | 4-6 hrs |
| **10. Mobile Bundle** | High | High | ⭐⭐⭐ | 8-12 hrs |

---

## Expected Results

### After Phase 1 (Quick Wins)
- **LCP:** ~3.0s (from 4.0s)
- **Improvement:** -1.0s
- **Status:** Still above target, but better

### After Phase 2 (Progressive Rendering)
- **LCP:** ~2.6s (perceived)
- **Improvement:** -1.4s
- **Status:** Close to target

### After Phase 3 (Parallel Loading)
- **LCP:** ~2.3s
- **Improvement:** -1.7s
- **Status:** ✅ **Target achieved!**

### After Phase 4 (Further Optimization)
- **LCP:** ~2.0s (first visit), ~1.5s (repeat visit)
- **Improvement:** -2.0s / -2.5s
- **Status:** ✅ **Excellent performance**

---

## Testing Strategy

1. **Before Implementation:**
   - Run Lighthouse on mobile (3G throttling)
   - Document baseline LCP
   - Test on real mobile device

2. **After Each Phase:**
   - Re-run Lighthouse
   - Compare metrics
   - Test on real device

3. **Validation:**
   - LCP < 2.5s on mobile
   - No layout shifts
   - Map still functional
   - All features work

---

## Risk Mitigation

### Option 2 (Progressive Rendering)
- **Risk:** Layout shift if placeholder size differs
- **Mitigation:** Match placeholder dimensions exactly

### Option 3 (Parallel Loading)
- **Risk:** Map renders before data, shows empty
- **Mitigation:** Show default view, update when data ready

### Option 4 (Reduce Bundle)
- **Risk:** Breaking changes, feature loss
- **Mitigation:** Test thoroughly, have rollback plan

---

## Next Steps

1. **Review this plan** and select options to implement
2. **Start with Phase 1** (quick wins)
3. **Measure results** after each phase
4. **Iterate** until target achieved

---

## Notes

- **Mobile network conditions** vary significantly (3G vs 4G vs 5G)
- **Device performance** affects parse/execute time
- **First visit vs repeat visit** has different optimization needs
- **Perceived performance** (progressive rendering) may be more important than actual LCP

---

## Questions to Consider

1. **Is 4s LCP acceptable for first visit?** (Focus on repeat visits)
2. **Can we show placeholder immediately?** (Progressive rendering)
3. **Is MapLibre bundle size acceptable?** (Consider alternatives)
4. **Should we optimize for 3G or 4G?** (Target audience)
