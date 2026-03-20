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

## Decision #4 - Landing Page Polish Round 2 (Mar 20, 2026)
**Problem:** Feature cards nearly invisible (0.03 opacity bg), city still hidden behind dark overlay, attribution awkwardly centered, loading was boring.
**Decision:** Bump card contrast, lighten hero overlay, move attribution to corner, add storytelling loader phases.
**Result:** Shipped. Cards visible with borders, city more atmospheric through lighter overlay, loading now tells a story ("Scanning your library..." → "Building your skyline..." → "Welcome to your city").

## Decision #5 - Premium Artist Detail Panel (Mar 20, 2026)
**Problem:** Clicking a building showed a basic profile card. No real engagement or delight.
**Decision:** Build a premium glass slide-in panel with artist info, genre pills, stats grid, skyline rank bar chart, color palette, and top tracks.
**Result:** Shipped. Panel slides from right with accent-colored glow border, smooth transitions between buildings, close on X/escape/click-outside.

## Decision #6 - WebGL Fallback + Loading State + SVG Icons (Mar 20, 2026)
**Problem:** Headless browsers (and some old browsers) show black screen with no feedback. Mode toggle used raw emoji. No loading indicator between hero and city.
**Decision:** WebGL detection fallback, "Loading city..." pulse animation, SVG icons for all toggle buttons.
**Result:** Shipped. Clean degradation for unsupported browsers, smooth transition from hero to city, professional toggle icons.

## Decision #7 - Viral Share Card Redesign (Mar 20, 2026)
**Problem:** Old share card was basic. Not screenshot-worthy or shareable.
**Decision:** Full redesign - dark glass card with genre gradients, stats grid, top 3 artists, genre pills, CSS city skyline, QR code, download/copy/share buttons.
**Result:** Shipped. Card is portrait-optimized (540x960), download as PNG via html2canvas, Web Share API support.

## Decision #8 - Full Mobile Responsiveness (Mar 20, 2026)
**Problem:** Touch controls didn't exist, hero too large on mobile, detail panel wrong layout, minimap overlapping.
**Decision:** Virtual joystick for explore mode, responsive hero typography, bottom-sheet ProfileCard on mobile, 44px tap targets, scaled share card, hidden minimap on small screens.
**Result:** Shipped. Full touch support with joystick, pinch zoom, responsive layouts across all components.

---

## Backlog (prioritized)
1. Sound design - ambient city sounds per time of day
2. Social proof - live activity ticker (inspired by GitCity)
3. Confetti/celebration on city reveal
4. Typography polish - evaluate pixel font vs clean sans-serif
5. Building name labels floating above buildings in the city
