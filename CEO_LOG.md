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

---

## Backlog (prioritized)
1. Branding refresh - gitcity-level clean and viral
2. Simple comparison metrics (height = hours, base = genres)
3. Leaderboard view
4. Animated building construction on first load
5. Landing page redesign - cleaner, simpler hero
