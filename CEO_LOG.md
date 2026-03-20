# Spotify City - CEO Decision Log

## Decision #1 - Landing Page Redesign (Mar 20, 2026)
**Problem:** Landing page was basically a black screen with a logo. No explanation of what the product does. Controls showing before the city was visible. Bottom half empty.
**Decision:** Redesign the hero - add description copy, make demo city visible behind overlay, add feature cards below fold, hide controls until city view.
**Result:** Shipped and deployed. Landing page now explains the product, has visual depth, and guides users to sign in or explore demo.

## Decision #2 - Performance Optimization (Mar 20, 2026)
**Problem:** Too many draw calls, per-building pointLights, per-frame GC pressure, high geometry segments.
**Decision:** LOD system, instanced meshes for street furniture, remove all per-building lights, reduce geometry, fix frame allocations.
**Result:** Shipped. Draw calls significantly reduced, no more per-frame allocations.

## Decision #3 - Unique Buildings + Time of Day + Fly Camera (Mar 20, 2026)
**Problem:** All buildings looked like generic boxes. Only night mode. Camera locked to orbit.
**Decision:** 7 distinct architectural styles per genre, 4 time-of-day modes, WASD explore camera with minimap.
**Result:** Shipped. Each genre has a unique building type. Day/night/dawn/sunset transitions. Free exploration mode.

---

## Backlog (prioritized)
1. Typography - the pixel font is polarizing. Consider testing a clean sans-serif alternative
2. The "explore demo" flow - does it actually work well? Need to test
3. Mobile experience - need to verify responsiveness
4. Share card redesign - make the share output viral-worthy
5. Loading experience - the building animation could be more dramatic
6. Sound design - ambient city sounds per time of day
7. Building interactions - clicking a building should show artist details beautifully
8. Social proof - add user count or testimonials
