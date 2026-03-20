# The Git City — Competitor Analysis
> Researched: 2026-03-19
> Source: https://www.thegitcity.com/ + GitHub repo srizzon/git-city (4.2k stars)

---

## 1. Visual Design

### Color Palette
- **Background**: Near-black `~#0a0a0f` (custom token `bg-bg`)
- **Primary accent**: `#c8e64a` — sharp lime-yellow-green (active states, highlights, selected tabs)
- **Text**: Warm cream `~#f5ead0` (custom token `text-warm`)
- **Secondary text**: Muted gray `~#888` (custom token `text-muted`)
- **Card backgrounds**: `~#141420` (slightly lighter than bg)
- **Borders**: Dark charcoal `~#2a2a3a`
- **Gold / Silver / Bronze**: `#ffd700` / `#c0c0c0` / `#cd7f32` (leaderboard medals)

### Typography
- **Font**: Silkscreen (Google Fonts) — pixel-art bitmap monospace font
- Used for EVERY piece of UI text across the entire product
- Creates complete aesthetic coherence — feels like a retro game HUD, not a dashboard

### Overall Aesthetic
- Retrowave / cyberpunk pixel city
- Dark background + bright lime + warm cream accents
- Buildings glow with emissive window light against dark sky
- "Lo-fi hi-tech" — old school pixel art rendered with modern real-time 3D WebGL
- Buildings = William Gibson cyberspace meets mid-2000s isometric city games

### Lighting & Atmosphere
- No harsh directional sun — ambient night-city glow
- Buildings emit window glow (emissive Three.js materials)
- Active developers' buildings have a "breathing/flash pulse" — living city feel
- LOD system: close buildings have fully animated glowing windows; far buildings simplified with ambient light only

---

## 2. Buildings

### Data → Visual Mapping

| GitHub Metric | Visual Element |
|---|---|
| Total contributions (commits) | Building **height** — more commits = taller skyscraper |
| Public repositories count | Building **width / base footprint** — more repos = wider base |
| Total stars received | Window **brightness** — more stars = more lit windows |
| Recent activity | Window **glow patterns** — active devs show breathing/pulse effect |

### Appearance
- Pixel art voxel/block style — each floor is a discrete pixel layer stacked
- Windows = emissive (self-lit) yellow/warm orange squares
- Chunky 8-bit skyscrapers — identifiably retro but rendered in 3D
- Each building = one developer's unique "house"
- Buildings sit in **10 specialized districts** (Frontend, Backend, DevOps, etc.) based on primary language

### Cosmetic Items (22 types)
Crown, auras, rooftop fire, particle aura, helipad, flag, custom color, neon trim, solar panels, LED banner, lightning aura, rooftop garden, helicopter, satellite dish, water tower, pool party, GitHub Star decoration, hologram ring, spotlight, neon outline, billboard, streak freeze

### Rendering Tech
- THREE.InstancedMesh — all buildings of same type = ONE draw call (critical for 60,000+ buildings)
- THREE.LOD — dynamic geometry switching by camera distance
- Emissive window materials — glow without expensive post-processing
- THREE.NearestFilter on textures — keeps pixel art crisp at any scale

---

## 3. Onboarding / Sign-In Flow

### Authentication
- GitHub OAuth via Supabase — single "Sign in with GitHub" button
- No email/password; entirely GitHub-linked
- Requires GitHub personal access token for private data; public profiles work without

### First Visit Experience
1. **Cinematic intro flyover**: Camera sweeps cinematically over cityscape — descends/flies through the city while data loads in the background (loading masking!)
2. **Building generation**: After sign-in, user's building is auto-generated from GitHub data
3. **Placement**: Building placed in the appropriate language district
4. **Tutorial** (Q2 2026): Guided first-90-seconds learning flight controls

### CTA Copy
- Homepage: **"Enter the City"**
- Meta description: "Explore GitHub users as buildings in a 3D pixel art city. Fly through the city and discover developers."

---

## 4. Interactions

### Navigation Metaphor
- Users pilot a **pixel-style paper plane** through the city
- Free-flight 3D camera with smooth momentum/inertia
- Fly between buildings, ascend above skyline, descend to street level
- WASD ground-level street mode planned (Q2 2026)

### Building Interactions
- Flying close → LOD upgrade (windows animate, details appear)
- Clicking / landing on a building → opens developer's profile page
- Profile shows: stats, achievements, XP level, cosmetics, kudos button, compare option, repos list

### Animations
- Window pulse/breathing on active developer buildings
- Cinematic flyover on entry
- Animated window cycle (glow, flash patterns)
- Plane flight = smooth momentum + inertia
- LOD pop-in managed gracefully (no jarring transition)

### Profile Pages (`/dev/[username]`)
- Pixelated avatar (`imageRendering: pixelated`)
- Username, bio, stats, district + global rank
- Achievement badges, XP bar
- Cosmetic items equipped
- Invited developers list, kudos/visit count

---

## 5. Social / Viral Features

- **Kudos system**: Send kudos from any building profile
- **Item gifting**: Gift shop items to other developers
- **Referral mechanics**: Invite friends for in-game rewards
- **Live activity feed**: Real-time stream of player actions across the city
- **Side-by-side comparison**: Compare two developers head-to-head
- **Shareable profile cards**: Downloadable image cards (landscape + portrait/story format) — optimized for Twitter/Instagram/LinkedIn
- **Leaderboard**: 6 dimensions — Contributors | Stars | Architects | Achievers | Recruiters | XP
- **District rankings**: Ranked within your language district (e.g., "#1264 in Creator district")
- **Achievement badges**: Bronze → Diamond tiers, 14+ named achievements
  - 10K Pioneer, White Rabbit, Popular, Burglar, Grinder, Patron, Builder, Committed, Daily Rookie, First Push, Generous, On Fire, Pickpocket, Rising Star
- **Daily check-in/streak mechanic**: Coding streaks visible as building stat
- **Passport/stamp collecting** (Q2 2026): Collect stamps by visiting buildings, complete districts for district badges

---

## 6. Shareability — The "Wow" Moments

### Primary Wow Moment
"My GitHub contributions are a skyscraper." Seeing your own building for the first time — taller or wider than neighbors — is immediately personal and shareable.

### Narrative Delight
You can "tell when someone got promoted to manager" by a visible height drop (fewer commits). Human narrative emerges from the data — generates organic conversations.

### Shareable Profile Card
- One-click downloadable card
- Building rendered, stats overlaid, username shown
- Purpose-built for Twitter/LinkedIn/Instagram sharing
- Proven format (cf. Spotify Wrapped)

### Leaderboard Ego
Global rank + district rank numbers are highly personal → motivates sharing, competing, improving.

### Cosmetic Flex Culture
Your crown, helipad, hologram ring, rooftop fire = visible to every other player flying past. Cosmetics serve as social status markers.

### The Advertise-on-me Mechanic
Billboards on buildings carry real ads → city feels like a living economic ecosystem

---

## 7. Loading / Data Handling

- **Cinematic flyover masks loading**: While you watch the intro animation, buildings are populating in the background
- **LOD progressive reveal**: City loads at low detail, upgrades as you navigate — loading hidden behind exploration
- **Instanced mesh rendering**: 60,000+ buildings rendered efficiently via single draw calls
- **Next.js RSC**: Initial HTML server-rendered, 3D canvas hydrates client-side
- **React Three Fiber lazy loading**: 3D scene lazy-loaded, doesn't block initial page render
- **Vercel CDN**: Global edge hosting

---

## 8. Mobile Experience

- Web manifest + apple-icon suggest PWA-like consideration
- Profile pages (`/dev/[username]`) are fully responsive (Tailwind CSS)
- Leaderboard + profile pages use standard responsive Tailwind patterns
- 3D city on mobile: likely simplified view; touch-drag to fly controls needed
- Mobile optimization NOT explicitly prioritized in roadmap (desktop-first product)

---

## 9. Performance

- Instanced meshes: all same-tier buildings = 1 GPU draw call (critical for 60k buildings)
- LOD: near-zero polygon count for distant objects
- Next.js Turbopack: fast dev builds, optimized production bundles
- Vercel hosting: edge CDN globally
- Lightweight analytics (Himetrica, not GA)
- Described by users as "fluid and fast" for browser-based 3D

---

## 10. Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| 3D Engine | Three.js via `@react-three/fiber` + `@react-three/drei` |
| Language | TypeScript (95.7%), PL/pgSQL (2.3%), JavaScript (1.6%) |
| Styling | Tailwind CSS v4 + custom design tokens |
| Font | Silkscreen (Google Fonts) |
| Auth / DB | Supabase (PostgreSQL, GitHub OAuth, Row Level Security) |
| Payments | Stripe (USD) + AbacatePay (BRL/PIX) |
| Email | Resend |
| Analytics | Himetrica |
| Hosting | Vercel |
| Scheduling | Vercel cron jobs |
| License | AGPL-3.0 (open source) |

---

## Key Takeaways for Spotify City

### What to Match
1. **Cinematic reveal that masks loading** — flyover intro while data loads in background
2. **One font commitment** — Silkscreen everywhere = total aesthetic coherence. Pick ONE bold font for Spotify City.
3. **LOD progressive rendering** — start low detail, upgrade as user explores
4. **Shareable card** — one-click download card with venue/stats, sized for Twitter + Stories
5. **Personal building = personal identity** — the user must feel ownership of their space
6. **Leaderboard + rank numbers** — specific rank = highly personal, highly shareable
7. **Instanced mesh rendering** — required for 50k+ users in one scene

### What to Exceed
1. **Richer data axes** — Spotify has genre, tempo, energy, decade, artist, plays, recency — far more expressive than commits/stars/repos
2. **Sound design** — Git City is silent. Spotify City should play music. A building you approach starts playing that artist's track.
3. **Genre districts** — more meaningful than language districts; visitors can explore genres
4. **Temporal storytelling** — show listening history over time (building construction animation?)
5. **Friend graph** — Spotify already has social; show friend buildings, see what they're listening to live
6. **Collaborative playlists as parks/plazas** — shared spaces between users
7. **Wrapped integration** — annual building "redesign" based on yearly data, shareable as annual report card

---

## Sources
- https://www.thegitcity.com/
- https://github.com/srizzon/git-city
- https://www.thegitcity.com/roadmap
- https://www.thegitcity.com/leaderboard
- https://www.thegitcity.com/advertise
- https://www.thegitcity.com/dev/srizzon
- https://news.ycombinator.com/item?id=47162639
