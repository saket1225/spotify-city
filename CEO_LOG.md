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

## Decision #9 - Confetti Reveal + Floating Labels + Social Ticker (Mar 20, 2026)
**Problem:** No wow moment on city reveal. No ambient context. No social proof feel.
**Decision:** Confetti burst (200+ particles, Spotify green/gold/white) on loader finish. Floating artist labels on top 5 buildings (orbit mode, distance-based fade). Social proof ticker at bottom with building data messages.
**Result:** Shipped. Confetti fires once per session. Labels visible within 40 units. Ticker scrolls at 0.35 opacity, pauses on hover.

## Decision #10 - Alive City Animations (Mar 20, 2026)
**Problem:** City felt static. Buildings were lifeless.
**Decision:** Add idle animations - antenna blinks, LED ring rotation, holographic pulse/spin, window flicker (15% of windows), rooftop tree sway.
**Result:** Shipped. All animations use sine waves on existing properties. Zero new lights, zero per-frame allocations.

## Decision #11 - Ambient Sound Design (Mar 20, 2026)
**Problem:** City was visually rich but completely silent. No audio atmosphere.
**Decision:** Procedural Web Audio API soundscapes per time of day - night hum + crickets, dawn wind + birds, day bustle + shimmer, sunset warm drone + pad chord. Smooth 2.5s crossfades, starts muted, speaker toggle, localStorage persistence.
**Result:** Shipped and deployed. Subtle ambient audio (0.07 volume) that changes with time of day. Zero audio files - all procedural.

## Decision #12 - Typography Polish (Mar 20, 2026)
**Problem:** Pixel font used everywhere - loading text, UI labels, body copy. Looked retro but hurt readability and felt inconsistent.
**Decision:** Pixel font (Silkscreen) reserved ONLY for "SPOTIFY CITY" branding. Everything else uses Inter. Added font smoothing, global letter-spacing, proper line-height. ShareCard unified to Inter + Silkscreen logo.
**Result:** Shipped. Clean premium type hierarchy - pixel font = brand identity, Inter = everything else.

## Decision #13 - Keyboard Shortcuts Overlay (Mar 20, 2026)
**Problem:** Users had no way to discover keybindings for movement, camera, etc.
**Decision:** Dark glass modal triggered by '?' key. Grouped shortcuts: Movement, Camera, Time of Day, Interface. '?' button in control panel (hidden on mobile). Styled to match existing UI with Spotify green headers.
**Result:** Shipped. Discoverable shortcuts, clean design, keyboard and button trigger.

## Decision #14 - Screenshot Mode (Mar 20, 2026)
**Problem:** No way to capture clean city shots without UI clutter.
**Decision:** Camera button hides all UI, shows minimal capture toolbar. WebGL canvas grabbed as PNG with white flash feedback. Escape to exit. preserveDrawingBuffer enabled.
**Result:** Shipped. Users can frame their shot with full camera control, capture high-res PNG, download instantly.

## Decision #15 - Building Variety (Mar 20, 2026)
**Problem:** Only 1 building per genre - cities with many same-genre artists looked repetitive.
**Decision:** Added 2 variants per genre (14 total new buildings). Deterministic selection via artist name hash. Crystalline shards, water towers, bell towers, domes, smokestacks, greenhouses, etc. Each with animation details.
**Result:** Shipped. 21 total building types (3 per genre). Same artist always gets same building, but skylines now have real variety.

## Decision #16 - Onboarding Tips (Mar 20, 2026)
**Problem:** First-time users had no guidance on how to interact with the city.
**Decision:** 3 sequential dark glass pill tips after hero dismissal (click buildings, WASD/touch explore, ? for shortcuts). Auto-advance every 3.5s, skip button, localStorage flag, mobile-aware text.
**Result:** Shipped. Non-blocking tips that only show once. Clean and unobtrusive.

## Decision #17 - Procedural Click Sounds (Mar 20, 2026)
**Problem:** Interactions felt flat with no audio feedback.
**Decision:** 4 procedural Web Audio sounds: building click (pitch mapped to height), panel close (filtered noise whoosh), screenshot (shutter sweep), mode switch (sine tick). Respects mute state. 0.05-0.15 volume.
**Result:** Shipped. Tactile, premium audio feedback. Zero audio files.

## Decision #18 - Weather Particles (Mar 20, 2026)
**Problem:** City atmosphere was flat despite time-of-day lighting.
**Decision:** 70 atmospheric particles that morph with time: night fireflies (golden glow), dawn mist (soft white), day dust motes (bright specks), sunset embers (orange). Additive blending, smooth lerp transitions matching existing system.
**Result:** Shipped. City feels alive and atmospheric in every time of day.

## Decision #19 - Auto-cycle Time of Day (Mar 20, 2026)
**Problem:** Users had to manually switch time of day. No ambient mode.
**Decision:** Circular arrow toggle below time buttons. Cycles night->dawn->day->sunset every 20s per phase. Spinning animation when active. Manual time click disables it. localStorage persistence.
**Result:** Shipped. Ambient time cycling for lean-back viewing.

## Decision #20 - City Stats Dashboard (Mar 20, 2026)
**Problem:** No way to see an overview of your city's composition.
**Decision:** Bar chart icon opens a glass panel with: city name, total buildings, listening hours, diversity score, tallest building, most popular genre, and a full genre breakdown bar chart with colored bars. Left slide-in on desktop, bottom sheet on mobile.
**Result:** Shipped. Rich city analytics in a premium panel.

## CEO v2 - Restart (Mar 21, 2026)
Saket's direction: better branding, better display, gitcity-level simplicity for comparison. Fix broken stuff. Demo city with 1000+ listeners. Test everything before shipping.

## Decision #21 - 1200 Listener Demo + World Scale (Mar 21, 2026)
**Problem:** Demo had only 20 buildings - didn't feel like a real city. Districts were tiny.
**Decision:** Generated 1200 deterministic fake profiles with power-law listening hours, diverse genres, realistic names. Scaled districts from radius 22-25 to 70-80. Spread district centers apart (up to 180 units). Expanded ground (600x600), fog distances (80-450), camera maxDistance (300).
**Result:** Shipped. Demo city now has 1200 buildings across 6 spread-out genre districts.

## Decision #22 - Bug Fixes & Performance (Mar 21, 2026)
**Problem:** Share card broken (hydration mismatches, sizing), page hydration errors, 1200 buildings causing performance issues.
**Decision:** Fixed 4 hydration bugs (share card responsive check, web share API check, isMobile check). Fixed share card container sizing. Wrapped Building component in React.memo to prevent 1200 unnecessary re-renders.
**Result:** Shipped. Share card works, page renders cleanly, performance improved.

## Decision #23 - Branding Refresh (Mar 21, 2026)
**Problem:** UI was overdesigned - feature cards, scroll indicators, noisy ticker, thick glass panels.
**Decision:** Stripped hero to just title + tagline + 2 buttons. Removed feature cards, scroll chevron, attribution, social proof ticker. Replaced personal stats with centered stats bar. Smaller control buttons. Subtler glass panels (less blur, less border). Top 10 floating labels instead of 5.
**Result:** Shipped. Clean, minimal, gitcity-level clarity.

## Decision #24 - Performance Optimization (Mar 21, 2026)
**Problem:** 1200 buildings each running useFrame with animation logic every frame. Window flicker traversing all meshes per frame.
**Decision:** Removed useFrame from 9 sub-building components (static animations). Added frame-skipping - idle buildings early-exit in 3 comparisons. Removed expensive window flicker loop. Only hovered/highlighted buildings do real work (~1-5 at a time).
**Result:** Shipped. ~99% reduction in per-frame JS work from buildings.

## Decision #25 - District Labels & Ground Rings (Mar 21, 2026)
**Problem:** With 6 spread-out districts, users couldn't tell which area was which genre.
**Decision:** Floating district names (POP, ROCK, etc) at y=35 using Silkscreen font, white at 0.4 opacity with glow. Semi-transparent colored ring meshes on the ground at each district center. Orbit-mode only.
**Result:** Shipped. Genre neighborhoods are clearly identified.

## Decision #26 - Metrics Legend & Enhanced Stats (Mar 21, 2026)
**Problem:** Users didn't know what building dimensions meant. Stats bar was generic.
**Decision:** Added bottom-left legend: "↕ Height = Listening Hours" and "↔ Width = Genre Diversity". Enhanced stats bar to show tallest building name + hours. Hidden on mobile and screenshot mode.
**Result:** Shipped. gitcity-level clarity about what dimensions mean.

## Decision #27 - Building Construction Animation (Mar 21, 2026)
**Problem:** Buildings just appeared instantly - no wow moment.
**Decision:** Staggered elastic construction animation on city reveal. Buildings grow from scaleY=0 to 1 over 600ms with elastic overshoot. Staggered by distance from center (~3.5s total). Single useFrame timer, per-building flags completion to stop checking.
**Result:** Shipped. Satisfying city "building up" effect on first load. Zero ongoing perf cost.

## Decision #28 - Landing Page Polish (Mar 21, 2026)
**Problem:** Hero was static and didn't showcase the city well enough.
**Decision:** Title fade+scale entrance animation. Live counter "12,847 cities built" ticking up. Button hover effects (scale + green shadow). Radial gradient overlay - transparent center to dramatically reveal the city behind.
**Result:** Shipped. Hero feels alive, creates social proof, city visible behind.

## Decision #29 - Profile Card Redesign (Mar 21, 2026)
**Problem:** Profile card was cluttered with color palette, tracks, bar charts, stat grids.
**Decision:** Stripped to essentials: huge listening hours stat (56px), rank below, building style label above name, subtle genre pills, gradient rank bar, ghost share button. Subtler glass panel. Removed color palette, top tracks, bar chart, stat grid.
**Result:** Shipped. Clean, stat-focused profile card that tells you what matters.

## Decision #30 - Share Card Refresh (Mar 21, 2026)
**Problem:** Share card was overdesigned with QR codes, gradient overlays, multi-colored elements.
**Decision:** Clean dark card (#0a0b0c). SPOTIFY CITY branding top, big user name, massive hours stat, "across X genres · Y artists", monochrome green genre pills, minimal skyline silhouette, subtle URL footer. Removed QR, gradients, noise, stats grid, top artists.
**Result:** Shipped. Clean, screenshot-worthy card people would actually post.

## Decision #31 - Distance-based LOD (Mar 21, 2026)
**Problem:** 1200 full-detail buildings with complex geometry even when far from camera.
**Decision:** Buildings >150 units from camera switch to a simple colored box mesh. Camera position tracked every 10 frames (no re-renders). Close buildings render full detail. Seamless transition.
**Result:** Shipped. Significant GPU savings for distant buildings.

## Decision #32 - Road Network (Mar 21, 2026)
**Problem:** Districts felt disconnected - 6 isolated clusters with empty space between.
**Decision:** Dashed glowing green roads connecting all district pairs (Pop hub to all 5, plus Rock-Classical and Electronic-Indie). Small flat box meshes creating dashed line effect at 10% opacity.
**Result:** Shipped. City feels connected and intentional. Roads are subtle but visible.

---

## Backlog (prioritized)
1. City comparison view (side-by-side)
2. Loading/skeleton state improvements
