# 3D Web Design Analysis: What Makes Premium 3D Experiences

Research date: 2026-03-19
Sites analyzed: Bruno Simon, Awwwards Three.js collection, Three.js Examples, Lusion, Linear, Vast Space, Springs Estate, AstroDither

---

## Executive Summary

After visiting and technically dissecting multiple award-winning 3D web experiences, the central finding is: **premium 3D on the web is not about showing off Three.js — it is about purposeful art direction backed by invisible engineering**. The best sites use 3D as a storytelling vehicle, not a technical demonstration. Every technical choice — from the 1MB bundled JS in Bruno Simon to the 66 WebP images in Springs Estate — is in service of a specific emotional experience.

The clearest dividing line between polished and amateur: **do you notice the technology, or do you notice the feeling?**

---

## Site-by-Site Analysis

### 1. Bruno Simon (bruno-simon.com)

**What it is:** Full-screen interactive 3D portfolio where the user drives a toy car through a miniature world containing links to Bruno's work. Navigation is the experience.

**What makes it premium:**
- The conceit is total — the entire interface is the 3D scene. There is no "3D hero section with normal HTML below." This commitment is what elevates it from demo to art.
- Uses **Three.js r182 with WebGPU renderer** — cutting edge, not legacy WebGL. The canvas explicitly declares `data-engine="three.js r182 webgpu"`.
- Canvas size is locked to 1280×720 regardless of viewport, ensuring consistent render budget.
- Service worker is registered — caching for instant repeat visits.
- Tiny initial payload: only 3 files matter at load — a 1MB JS bundle (everything), 21KB of .ktx compressed textures, and a 3KB .glb file for respawn points. That's it. No GLTF/binary blob megabytes of meshes.

**Technical techniques observed:**
- KTX2 texture format (GPU-compressed, only 21KB for 3 textures) — this is the gold standard for texture delivery.
- The `.glb` is only 3KB, meaning world geometry is likely procedurally generated or baked into the JS bundle as BufferGeometry data.
- Assets preloaded via `<link rel="preload">` before JS executes — fonts, textures, and models are fetched in parallel.
- WebGPU (not WebGL) for better GPU utilization on modern browsers.
- Memory footprint after full load: ~16MB JS heap — extremely lean for a full 3D world.

**Color palette:** Dark theme. Warm white text (`rgb(255,255,255)`) on dark background. Accent colors: `rgb(213, 255, 149)` (acid green for success/achievements), `rgb(255, 106, 124)` (coral red for warnings), `rgb(255, 206, 202)` (peach for secondary text). The overall scene has warm, low-saturation earth tones with stylized cartoon rendering.

**Loading strategy:**
- Single JS bundle (1003KB gzip) — everything ships in one request.
- KTX2 preloaded via link tags — textures arrive before JS finishes parsing.
- Font `display: block` — text appears correctly before font swap, no layout shift.
- Tiny GLB for spawn points only — scene geometry is generated in JS.

**Camera/navigation feel:** The camera follows the car with spring-based damping. It never snaps. The offset gives a slightly overhead isometric feel. Collision with scene objects creates satisfying physical feedback. This is the key: **input → physics → camera**, not **input → camera directly**.

**Mobile handling:** Touch buttons appear as an overlay when on touch devices (`js-touch-buttons` class). The interaction is re-mapped from keyboard (WASD/arrows) to on-screen D-pad. The experience is preserved, not degraded.

**What separates demo from product:** Bruno's site has progression systems (achievements, whispers, hidden items). There is a map, a menu with navigation to real pages, a community/whispers feature. It is a *world*, not a screenshot. The 3D is the product.

---

### 2. Lusion (lusion.co)

**What it is:** Premium 3D digital production studio. Their site is their portfolio — showcasing work for Devin AI, Choo Choo World, DDD 2024, etc.

**What makes it premium:**
- Uses **Three.js r158** with 3 canvases visible in the DOM — likely one for the hero background, one for project thumbnails, one for ambient effects.
- The color system is meticulous: `--color-off-white: #f0f1fa`, `--color-green: #c1ff00` (electric lime), `--color-blue: #1a2ffb` (deep electric blue), `--color-grey-blue: #2b2e3a`.
- Body background is pure white but text color is `--color-off-white (#f0f1fa)` — subtle blue tint to white for depth.
- Custom font: **Aeonik** (loaded as 2 woff2 weights, 75KB total). Not Google Fonts. Custom type = professional signal.
- Grid system uses `--grid-space: calc((100% - 11 * var(--grid-gap)) / 12)` — proper 12-column grid with 2vw gutters.
- Global border radius: `--global-border-radius: 20px` — rounded, friendly, modern.
- Base padding: `max(5vw, 40px)` — fluid but with a minimum.

**Technical techniques observed:**
- Ultra-lean JS: 303KB main bundle (vs Bruno's 1003KB). Split code aggressively.
- Hoisted script pattern — critical JS separated from route code.
- Only 2 SVGs, no PNG/JPG images on the home page — everything is 3D or CSS.

**Color palette deep dive:**
```
Background:     #ffffff / rgb(240, 241, 250) — slightly blue-tinted white
Primary text:   #000000
Off-white:      #f0f1fa — the "white" that reads as white but has depth
Electric green: #c1ff00 — the signature accent (lime/acid green)
Electric blue:  #1a2ffb
Dark blue:      #071bdf
Purple:         #8832f7
Red:            #ff4c41
Dark:           #2b2e3a (grey-blue, not pure black)
```

**Loading strategy:** 303KB JS + 75KB custom fonts + 2 tiny SVGs. Everything is lazy-loaded per route using Astro-style component architecture. The CSS is 14KB — highly optimized.

**Camera/navigation feel:** Scroll-driven. As you scroll, 3D elements translate, scale and rotate. Camera does not move; the objects move. This is actually more performant — the camera staying still means fewer view matrix recalculations.

**What separates demo from product:** Lusion's 3D is contextual — it exists to show *their work*, not to demonstrate 3D. Each project card shows a 3D render of what they built. The 3D is evidence, not decoration.

---

### 3. Linear (linear.app)

**What it is:** Product management SaaS. Not a 3D site — included as a benchmark for "polished without 3D."

**What makes it premium (non-3D polish lessons):**
- Background: `rgb(8, 9, 10)` — not pure black. A very dark grey-blue. Prevents harsh edge on any display.
- Theme color meta tag: `#08090a` — matches body exactly for native browser chrome integration.
- **Grain texture overlay:** `url("https://static.linear.app/static/grain-default.png")` applied via a dedicated `Grain_grain` component with `Grain_grainSubtle` variant. Premium dark UIs almost universally use film grain to break up the uniform dark background.
- Radial glow effects: `radial-gradient(50% 50%, rgba(255, 255, 255, 0.04) 0px, rgba(255, 255, 255, 0) 90%)` — a barely-visible centered highlight. Prevents the flat, lifeless look of solid dark backgrounds.
- Header blur: `linear-gradient(rgba(11, 11, 11, 0.8) 0px, oklab(0.149576.../ 0.761905) 100%)` — uses `oklab` color space for the frosted nav bar. This is next-level color science.
- Typography: **Inter Variable** with `font-weight: 510` — a variable font value between regular (400) and medium (500). This is the specific "heaviness" that feels premium.
- Line height on hero: 64px/64px (tight) — density and confidence.
- Image delivery: Cloudflare `imagedelivery` CDN with `f=auto,dpr=2,q=95,fit=scale-down` — automatic format selection, 2x DPR, 95% quality.
- Lazy loading: 29 of 31 images have `loading="lazy"`.

**Key takeaways for polished product feel:**
1. Never use pure `#000000` or `#ffffff` — use near-blacks and near-whites with a subtle color cast.
2. Film grain on dark backgrounds is a must.
3. Use variable fonts with non-round weight values (510 not 500).
4. Radial glow behind UI elements adds depth without real 3D.
5. `oklab` and `oklch` color spaces for gradients eliminate the "muddy midpoint" problem.

---

### 4. Vast Space (vastspace.com)

**What it is:** SpaceX partner building commercial space stations. Premium brand requiring awe-inspiring visuals.

**What makes it premium:**
- **9 GLB files** for different space station models (Haven-1, Haven-2, Dragon capsule, low-poly figures). Each section of the page gets its own 3D model.
- **12 MP4 video files** alongside the 3D — mixing real footage with 3D renders is a powerful technique. It grounds the 3D in reality.
- Custom easing function stored as a CSS variable: `--motion-ease-vast: cubic-bezier(0.4, 1.35, 0.5, 0.97)` — slight overshoot (>1 at midpoint) creates the signature "elastic" feel.
- Spring easing defined as `linear()` with 30+ control points — a mathematically accurate spring simulation in pure CSS.
- `--motion: 1` global multiplier — multiplied into animation durations. Set to 0 for `prefers-reduced-motion`. Elegant and systematic.
- Draco-compressed GLB files (hence `draco_decoder.wasm`) — geometry compression that reduces model file sizes dramatically.
- AVIF format used for 23 images — next-gen format, ~50% smaller than WebP.
- Responsive breakpoints stored as CSS variables: `--css-mobile-mockup-width: 393`, `--css-tablet-mockup-width: 1024`, `--css-desktop-mockup-width: 1440`.

**Color palette:**
```
Meteorite Black:  #2a2c2f — not pure black, slightly warm
Warm White:       #fdfcf4 — not pure white, creamy
Warm Gray:        #ece8e3 — off-white background tones
Moon Rock:        #b3aba3 — mid-gray with warm undertone
Solar Orange:     #ff5623 — the signature accent
Green:            #2da046 — secondary accent
Asteroid Dust:    #897f75 — muted brown-gray
```

**Loading strategy:**
- AVIF for static images (23 files), WebP fallback.
- MP4 videos: autoplay, muted, loop — used as animated hero content.
- Draco WASM for GLB decompression — loads once, decompresses all models.
- Models are lazy-loaded per section (only needed when scrolled into view).

**Mobile handling:** Variables `--css-mobile-mockup-width: 393` suggest the 3D is calibrated to iPhone 15 dimensions. The 3D scenes likely swap to video loops on mobile.

**Camera/navigation feel:** Section-based scroll storytelling. Each scroll section reveals a new perspective on the space station. Camera positions are authored (not user-controlled) — maximum art direction, zero user disorientation.

---

### 5. Springs Estate (springs.estate)

**What it is:** Luxury real estate development ("Splendor of Renewal"). Uses 3D and high-end visuals to sell property.

**What makes it premium:**
- 5 canvas elements — complex multi-layer 3D composition.
- **7.4MB of WebP images** — high fidelity photography is core to the experience. 3D enhances; photos sell.
- Body background: `rgb(245, 232, 209)` — warm beige. This choice sets an entirely different register than dark-mode 3D sites.
- Mature design system: `--t-background`, `--t-text`, `--t-heading` semantic tokens that map to color primitives. Dark and light modes expressed through variable reassignment.
- Custom spring animation: `--motion-ease-spring: linear(...)` with precisely tuned spring coefficients.
- `--motion: 1` global motion multiplier (same pattern as Vast Space — this is becoming a standard pattern).
- `dvh`/`lvh`/`svh` units — uses all three viewport height variants for different elements. `--dvh` for dynamic (mobile browser chrome), `--lvh` for large (ignore chrome), `--svh` for small (always include chrome).

**Color palette:**
```
Dark Green:    #162d24 — primary dark
Green:         #1b4732 — body background (dark mode)
Light Green:   #a7b431 — accent
Olive:         #758535
Dark Blue:     #101e27
Blue:          #005160
Light Blue:    #67bfda
Sky:           #bee5ee
Beige:         #e0d1b6 — text (dark mode)
Beige BG:      #f5e8d1 — body background (light mode)
```

**Loading strategy:**
- 66 WebP images (7.4MB) — aggressively lazy-loaded via IntersectionObserver.
- 3 custom woff2 fonts (214KB).
- Cloudflare CDN with speculation rules for prefetching.
- Only 395KB JS — the 3D is lightweight relative to the photography.

**What it teaches:** Sometimes the most "premium" 3D experience is knowing when not to use 3D. Springs Estate puts photography first, uses 3D as atmosphere and transition (particles, cursor effects, loading screens), and lets the real photography do the emotional heavy lifting.

---

### 6. AstroDither (astrodither.robertborghesi.is)

**What it is:** Experimental art portfolio by Robert Borghesi. Push-the-limits aesthetics.

**What makes it interesting (not mainstream):**
- 1 canvas (full viewport). Minimalist philosophy.
- Body background: `rgb(8, 8, 8)` — near-black, same register as Linear.
- Font: `"Azeret Mono", monospace` — monospace for everything. Signals hacker/experimental/technical identity.
- Key resources: 1.8MB ambient MP3 loop (mood-setting sound), 203KB JS, 151KB JPEG texture, 77KB Draco WASM decoder, 42KB hand.glb model.
- **Draco-compressed GLB** (42KB for a hand model — without Draco this would be 400KB+).
- Built with **Astro** — static site generator with island architecture, extremely performance-optimized.
- The sound file (1.8MB) being pre-loaded signals that audio is core to the experience, not optional.

**What it teaches about demo vs product:** AstroDither is clearly a demo — beautiful, but with no call-to-action, no clear narrative, no commercial purpose. The polish comes from technical mastery, not UX intentionality. This is the *artistic* end of the spectrum.

---

## Common Patterns Across Premium Sites

### Pattern 1: Never Use Pure Black or White
Every premium site uses near-blacks and near-whites with subtle hue shifts:
- Bruno Simon: warm mid-tones, cartoon palette
- Lusion: `#f0f1fa` (blue-tinted white), `#2b2e3a` (blue-grey dark)
- Linear: `rgb(8, 9, 10)` (near-black)
- Vast Space: `#2a2c2f` (warm near-black), `#fdfcf4` (creamy white)
- Springs: `#f5e8d1` (warm beige)
- AstroDither: `rgb(8, 8, 8)` (near-black)

### Pattern 2: Custom Easing Is Non-Negotiable
Amateur 3D uses `ease-in-out`. Premium 3D uses custom cubic-bezier or spring functions:
- `cubic-bezier(0.62, 0.05, 0.01, 0.99)` — Vast Space primary
- `cubic-bezier(0.4, 1.35, 0.5, 0.97)` — Vast Space overshoot
- `linear()` with 30+ points — mathematically accurate spring simulation
These are not chosen randomly — they are the result of motion design systems.

### Pattern 3: The `--motion: 1` Multiplier Pattern
Both Vast Space and Springs Estate use `--motion: 1` as a global CSS variable multiplied into animation durations. When `prefers-reduced-motion` is active, set `--motion: 0` and all animations disable without touching individual animation rules. This is the correct way to handle accessibility for animation-heavy sites.

### Pattern 4: KTX2/AVIF/WebP — Not PNG/JPG
- Bruno Simon: KTX2 (GPU-native compressed textures) — only 21KB for 3 textures
- Vast Space: AVIF (23 images), GLB+Draco (models)
- Springs: WebP (66 images)
- AstroDither: Draco WASM, compressed GLB
PNG and JPG are absent from premium 3D sites. The pipeline is: PNG source → KTX2 for WebGL textures, AVIF/WebP for UI images, Draco-compressed GLB for models.

### Pattern 5: Grain Texture on Dark Backgrounds
Linear's `Grain_grain` component is deliberate. Film grain on flat dark backgrounds:
1. Breaks up banding artifacts on gradients
2. Adds tactile, physical quality (reference to film, analog warmth)
3. Makes dark backgrounds feel intentional rather than empty
This is cheap to implement (one repeating PNG) and has outsized visual impact.

### Pattern 6: Custom Typography at Scale
Every premium site uses either (a) a custom/licensed typeface or (b) a variable font with non-standard weights:
- Bruno Simon: Amatic SC + custom Pally Medium (woff2)
- Lusion: Aeonik (custom, 2 weights)
- Linear: Inter Variable at weight 510 (non-standard value)
- Vast Space: Custom sans
- AstroDither: Azeret Mono (monospace as brand statement)
Using Google Fonts defaults (Roboto, Open Sans, Lato) reads as amateur.

### Pattern 7: Section-Based Scroll Storytelling
For commercial/product 3D sites (Vast Space, Springs, Linear), camera positions are *authored*, not user-controlled. Each scroll section reveals a specific designed view. This:
- Eliminates user disorientation
- Allows precise art direction
- Works with assistive technology
- Degrades gracefully to static screenshots

### Pattern 8: Tiny GLB + Procedural World
Bruno Simon's world fits in 3KB of GLB — the scene geometry is generated procedurally in JavaScript. This is dramatically more flexible than loading a pre-authored 3D scene and allows the world to be reactive to game state.

---

## Specific Technical Techniques

### Texture Optimization
```
Source:    PNG/JPG master files
Pipeline:  toktx / basis-universal converter
Output:    .ktx2 with GPU compression (ETC2, BC7, ASTC)
Result:    5-10x smaller on GPU, zero decompression cost
```

### Model Optimization
```
Source:    High-poly FBX/OBJ
Pipeline:  Blender → glTF export → gltf-transform → Draco compression
Output:    .glb with Draco geometry compression
Result:    60-80% smaller file, minimal GPU overhead
Loader:    THREE.DRACOLoader (async WASM decode)
```

### Scroll-Driven Camera
```javascript
// Pattern used by Vast Space, Springs Estate, Linear
const scrollProgress = window.scrollY / (document.body.scrollHeight - window.innerHeight);
const cameraPosition = cameraPath.getPointAt(scrollProgress);
camera.position.lerp(cameraPosition, 0.1); // smooth follow
```

### Spring CSS Easing
```css
/* Exact pattern from Vast Space */
--motion-ease-spring: linear(
  0, 0.007, 0.03 2.1%, 0.122 4.6%, 0.243 6.9%,
  0.645 13.7%, 0.85 18.1%, 0.926, 0.987,
  1.032 24.7%, 1.064 27.1%, 1.077 28.7%,
  1.085, 1.088 32.3%, 1.086 34.3%,
  1.074 37.8%, 1.033 45.8%, 1.015 50%,
  1.002 54.7%, 0.994 59.6%, 0.992 66.4%,
  0.999 85%, 1.001
);
```

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  :root { --motion: 0; }
}

.element {
  transition: transform calc(var(--animation-duration) * var(--motion)) var(--easing);
}
```

### Viewport Height on Mobile
```css
/* The correct modern pattern */
--dvh: calc((100dvh - var(--cookie-height)) / 100);
--lvh: calc((100lvh - var(--cookie-height)) / 100);
--svh: calc((100svh - var(--cookie-height)) / 100);
--vh: var(--lvh); /* Default: ignore dynamic chrome */
```

---

## Color Palette Notes

### For Dark 3D Experiences (Space, Sci-Fi, Cosmic)
```
Background:  rgb(8, 9, 10) or #0a0a0f (slight blue shift)
Cards:       rgba(255, 255, 255, 0.04) — barely visible panels
Borders:     rgba(255, 255, 255, 0.08)
Text:        #f0f1fa (blue-tinted white) or #e4e6ef
Accent:      Electric choices: #c1ff00 (lime), #1a2ffb (blue), #8832f7 (purple)
Glow:        radial-gradient with rgba(255,255,255,0.04) — subtle, centered
```

### For Light/Natural 3D Experiences (Nature, Architecture, Real Estate)
```
Background:  #f5e8d1 (warm beige) or #fdfcf4 (creamy white)
Dark text:   #2a2c2f (warm near-black) or #162d24 (dark green)
Mid tones:   #b3aba3 (moon rock) or #897f75 (asteroid dust)
Accent:      #ff5623 (solar orange) or #a7b431 (olive green)
Atmosphere:  Use soft shadows, warm ambient light
```

### For Electric/Brutalist 3D (Tech, Developer, Experimental)
```
Background:  rgb(8, 8, 8) — near pure black
Text:        #e0d1b6 (warm off-white) or #f0f1fa
Accent:      #c1ff00 (acid lime) — the most "tech" accent
Font:        Monospace (Azeret Mono, JetBrains Mono, IBM Plex Mono)
```

---

## Performance Strategies

### 1. WebGPU First (With WebGL Fallback)
Bruno Simon uses WebGPU (`data-engine="three.js r182 webgpu"`). Three.js r125+ supports both. WebGPU provides:
- Compute shaders for GPU-side particle systems
- Better memory management
- Lower CPU overhead for draw calls

### 2. Everything in One Bundle (For Small Sites)
Bruno Simon ships 1003KB of JS. This is deliberate: one HTTP/2 connection, one parse/compile cycle, no waterfall. For a single-page experience without routes, this beats code splitting.

### 3. Preload Critical 3D Assets
```html
<link rel="preload" href="/textures/palette.ktx2" as="fetch" crossorigin>
<link rel="preload" href="/models/world.glb" as="fetch" crossorigin>
```
Assets begin loading before JS parses — critical for first meaningful paint.

### 4. Draco Compression for All Models
Draco reduces GLB size 60-80%. The `draco_decoder.wasm` (77KB) loads once and handles all subsequent models. Net result: enormous savings after the first model.

### 5. Instance Mesh for Repeated Objects
For repeated geometry (trees, buildings, crowd, stars), `THREE.InstancedMesh` renders thousands of instances as a single draw call. Essential for city/landscape scenes.

### 6. Level of Detail (LOD)
```javascript
const lod = new THREE.LOD();
lod.addLevel(highPolyMesh, 0);    // < 50 units
lod.addLevel(medPolyMesh, 50);   // 50-200 units
lod.addLevel(lowPolyMesh, 200);  // > 200 units
```
Three.js has native LOD support. Critical for open world scenes.

### 7. Frustum Culling
Enable `object.frustumCulled = true` (default). Objects outside camera view are not rendered. For large scenes, supplement with spatial subdivision (octree, BVH).

### 8. Render Loop Budget
Target 60fps = 16.6ms per frame. Budget:
- Physics: ≤ 2ms
- Frustum cull + scene graph traverse: ≤ 1ms
- JavaScript animation updates: ≤ 2ms
- GPU render: ≤ 8ms
- Buffer remaining: 3ms

### 9. requestAnimationFrame Only When Dirty
For scroll-driven scenes where nothing moves when the user is not scrolling:
```javascript
let isDirty = false;
scroll.on('scroll', () => { isDirty = true; });
function animate() {
  requestAnimationFrame(animate);
  if (!isDirty) return;
  renderer.render(scene, camera);
  isDirty = false;
}
```

---

## Mobile Handling

### Approach 1: Full Preservation (Bruno Simon)
Map touch events to game controls. Show on-screen D-pad. The experience is the same, input method changes. This works when the 3D is the primary interaction.

### Approach 2: Video Fallback
On mobile (`navigator.maxTouchPoints > 0` or `window.innerWidth < 768`), replace Three.js canvas with a pre-rendered MP4 video loop. Vast Space uses 12 MP4s alongside GLBs — the videos are the mobile fallback. No WebGL = no battery drain on iPhone.

### Approach 3: Reduced Scene
Detect GPU tier using WebGL renderer info:
```javascript
const renderer = new THREE.WebGLRenderer();
const info = renderer.info.render;
// Or use gpu-benchmark-index library
// Low tier: show static image or simplified scene
// High tier: full 3D
```

### Approach 4: CSS-Only Atmosphere
Springs Estate achieves richness on mobile through photographic images (66 WebP) with CSS scroll animations and parallax. The 3D is a desktop enhancement, not a requirement.

---

## Loading Strategies

### Stage 1: Skeleton (0-500ms)
Show background color, font glyphs (preloaded), basic layout. No spinner — just the designed background. Linear does this perfectly: `rgb(8, 9, 10)` fills instantly, content arrives fast.

### Stage 2: Critical Assets (500ms-2s)
Load what the user sees first: hero texture, primary 3D model, hero text. Preloaded via `<link rel="preload">` with `fetchpriority="high"`.

### Stage 3: World Loads (2-5s)
For complex scenes like Bruno Simon's, the 3D world assembles while the user reads the loading progress. The loading screen *is* part of the experience — it should be designed, not apologized for.

### Stage 4: Lazy Load Everything Else
All below-fold 3D, images, and models load via IntersectionObserver. Linear has 29/31 images lazy loaded. Springs Estate uses Cloudflare's speculation API.

---

## Camera and Navigation Feel

### Principles That Feel Professional

**1. Never snap.** All camera transitions use interpolation (`lerp`, `slerp`, or spring damping). Even instant jumps should have a 100-200ms ease.

**2. Camera lag = weight.** A slight delay between user input and camera response implies physical mass. This is the single biggest factor in whether 3D feels "right" or "janky".

**3. Limit degrees of freedom.** Give users only the camera movement they need, nothing more. Bruno Simon: top-down follow. Vast Space: authored scroll positions. The less freedom, the more control over the experience.

**4. Dampen, don't stop.** When the user releases input, the camera should continue with momentum and gently decelerate. Hard stops feel wrong.

**5. Authored paths for storytelling.** Commercial sites use authored camera paths (gsap ScrollTrigger + Three.js CatmullRomCurve3). This ensures every user sees the intended composition.

**6. Responsive to gravity.** Slight camera bob, rock, or sway tied to scroll velocity gives an organic quality impossible with pure math.

---

## What Separates Polished from Amateur: The 12 Principles

1. **Intentional imperfection.** Grain texture, slight bloom, color aberration, vignette. Mathematically perfect 3D looks CG; carefully imperfect 3D looks *craft*.

2. **Color casts over neutral grays.** `#0a0a0f` not `#000000`. `#fdfcf4` not `#ffffff`. Pure neutrals look "default."

3. **Custom type.** Licensed typefaces are a signal of professional intent. Variable fonts with non-standard weights (510, 625) are visible in screenshots.

4. **Loading is designed.** The loading state, its duration, and the transition into the experience are as designed as the experience itself.

5. **3D earns its place.** Amateur: 3D hero section as decoration, with normal HTML below. Professional: 3D that cannot be replaced by an image because it *is* the interface.

6. **Compression pipeline.** KTX2 textures, Draco GLB, AVIF images. The invisible work of compression is what makes performance possible without sacrificing quality.

7. **Sound is optional but intended.** AstroDither's 1.8MB ambient MP3 is not an afterthought — it is the emotional layer. But it is never auto-played without user consent (or is muted by default with an opt-in).

8. **Mobile is first-class, not degraded.** The mobile experience is designed, not stripped. Usually means video loops replacing WebGL, but with the same visual quality.

9. **Spring, not ease.** CSS cubic-bezier is sufficient; spring simulations (`linear()`) are exceptional. Springs overshoot slightly — they feel alive.

10. **Semantic design tokens.** `--t-background`, `--t-text` (semantic) that map to `--c-dark-green` (primitive) enable dark/light mode, theming, and brand changes without refactoring.

11. **Micro-interactions are macro-signals.** The hover state on a button, the cursor effect, the scroll behavior — these are noticed in aggregate. Each one individually is tiny; collectively they define quality.

12. **No visible complexity.** The user should never think "this is Three.js." They should think "this is beautiful." The technology is the means, not the message.

---

## Recommendations for Spotify City

Based on this research, here are the most impactful technical and design decisions for a premium Spotify city experience:

### Must-Have Technical
- **KTX2 textures** — especially for music visualization textures, city building faces, particle systems
- **Draco-compressed GLB** for city architecture models
- **WebGPU renderer** (Three.js r155+) — critical for particle density needed for music visualization
- **Instanced meshes** for buildings, trees, streetlights, crowd elements
- **Scroll/audio-driven camera** on authored paths — never give users full orbital control
- **Service worker** for asset caching

### Color System
- Pick a signature near-black with a hue cast matching the Spotify brand: consider `#0a0d14` (dark navy) or `#08090a` (near-neutral dark)
- Spotify Green: `#1DB954` — but use sparingly. At full saturation it reads as notification/alert. Use 20% opacity variants for ambient glow.
- Off-white text: `#f0f1fa` or `#e8eaf0`
- Film grain overlay — mandatory for dark-mode premium feel

### Motion
- Define `--motion: 1` global multiplier from day one
- Spring easing for all city transitions (building growth, camera moves, UI reveals)
- Audio-reactive animations should use `lerp` with small coefficients (0.02-0.05) for smooth reactivity without jitter

### Loading
- Show the city skyline silhouette immediately (just geometry, no textures) while textures load
- Music starts after user interaction (browser autoplay policy)
- Progressive detail: low-poly city first, then texture streaming

### Mobile
- Below 768px: replace Three.js with a video loop of the city + 2D music visualizer overlay
- Or: simplified 2D canvas-based visualization that is still beautiful
- Never ship the full 3D scene to a device that will struggle to run it

---

*Analysis based on direct browser inspection of live sites using agent-browser. Technical data extracted via JavaScript evaluation of page internals, CSS rules, and performance APIs.*
