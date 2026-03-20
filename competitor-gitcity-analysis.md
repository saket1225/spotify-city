# Git City (thegitcity.com) — Visual Design Intelligence Report
Date: 2026-03-20

---

## Overall Concept
Git City is a 3D pixel-art city where each GitHub user is represented as a building.
Built with Next.js + Three.js (WebGL). It is a PWA (Progressive Web App).
Author: Samuel Rizzon (@samuelrizzondev)

---

## Color Palette (Exact Values)

### Core Theme Tokens
| Token | Hex |
|---|---|
| `--color-bg` (page background) | `#0d0d0f` |
| `--color-warm` (primary text) | `#d4cfc4` |
| `--color-cream` (highlight text) | `#e8dcc8` |
| `--color-border` | `#2a2a30` |
| `--color-border-light` | `#3a3a44` |
| `--color-muted` | `#8c8c9c` |
| `--color-dim` | `#5c5c6c` |
| bg-card | `#1c1c20` |
| bg-raised | `#161618` |
| lime/accent | `#c8e64a` |

### PWA / Manifest Colors
| Usage | Hex |
|---|---|
| background_color | `#0d1117` |
| theme_color | `#4ade80` |

### Building/District Accent Colors
| Usage | Hex |
|---|---|
| Blue district accent | `#6090e0` |
| Lime district accent | `#c8e64a` |
| Pink district accent | `#e040c0` |
| Gold district accent | `#f0c060` |
| Blue shadow | `#203870` |
| Lime shadow | `#5a7a00` |
| Pink shadow | `#600860` |
| Gold shadow | `#806020` |

### UI Accent Colors
| Usage | Hex |
|---|---|
| Green (GitHub contributions) | `#4ade80` |
| Blue (stats) | `#60a5fa` |
| Purple | `#a78bfa` |
| Yellow/gold | `#fbbf24` |
| Cyan | `#22d3ee` |
| Orange | `#ffb428` |
| Discord blurple | `#5865f2` |

---

## Typography

- **Primary font**: `Silkscreen` (Google Fonts) — a pixel/retro bitmap-style font
- **Font class**: `font-pixel`
- **Fallback**: `monospace`
- **Body classes**: `bg-bg font-pixel text-warm`
- **Letter spacing tokens**: `--tracking-wide`, `--tracking-wider`, `--tracking-widest`
- **Font weights used**: 500 (medium), 700 (bold)
- **Size scale**: 0.75rem → 8rem (xs through 9xl)

The entire UI uses a pixel/retro aesthetic font, consistent with the 8-bit city theme.

---

## Hero Section

### Loading/Intro Sequence (5 phases with timed delays)
Delays: 0ms, 2000ms, 5000ms, 9000ms, 13000ms
Loading messages (typed out progressively):
1. "Checking your browser..."
2. "Fetching developers..."
3. "Laying down streets..."
4. "Building the skyline..."
5. "Welcome to the city"

### Confetti Animation on Intro
`@keyframes introConfettiFall` — elements fall from top to bottom (translateY 0 → 100vh) with 720deg rotation, fading out. Duration: 720s ease-in forwards.

---

## Navigation Structure

### Top Nav Items
- Logo / "Git City" branding
- "Explore City" (main CTA)
- "✈ Fly" + "Collect PX" subtitle
- "Shop"
- "♛ Leaderboard"
- "Place your Ad" (marked NEW)
- "🎁 Open Free Gift!"
- "Sign in with GitHub" (auth CTA)

### Routes
- `/` — landing/city view
- `/dev/[username]` — individual developer profile
- `/shop` — item shop
- `/leaderboard?tab=contributors|stars|architects`
- `/live` — live activity feed
- `/advertise` — ad placement
- `/auth/callback` — OAuth callback
- `/terms`, `/privacy`, `/support`

---

## CTA / Login Button Design

- **Primary auth CTA**: "Sign in with GitHub" — GitHub OAuth via Supabase
- **Secondary CTA when viewing own profile**: "This is me? Sign in"
- **Social CTA**: "Invite this dev"
- **Main action button**: "Explore City"
- **Gift CTA**: "🎁 Open Free Gift!" — uses `.gift-cta` class with shimmer + glow + bounce animations

### Button Style
- Class: `.btn-press` — simulates physical press via CSS transform on hover/active
- Border: `border-[3px] border-border`
- Background: `bg-bg/70 backdrop-blur-sm` (glass-morphism effect)
- Shadow: `pixel-shadow` — `box-shadow: 4px 4px #00000080` (hard pixel drop shadow, no blur)

---

## Animations & Micro-Interactions

| Animation | Description |
|---|---|
| `fade-in` | opacity 0→1, translateY -4px→0, 0.3s ease-out |
| `slide-up` | opacity 0→1, translateY 100%→0, 0.3s ease-out |
| `slide-in-right` | opacity 0→1, translateX 100%→0 |
| `blink-dot` | opacity pulse at 50% (live indicator) |
| `pulse-node` | box-shadow expands to lime glow (12px 4px lime) |
| `gift-glow` | box-shadow intensity pulses 8px→20px |
| `gift-shimmer` | background-position shifts 400% (shine sweep) |
| `gift-bounce` | translateY oscillates -4px at 50% |
| `kudos-float` | upward float with scale increase + fade out |
| `radio-pulse` | border-color toggle |
| `eq-bar-1/2/3` | equalizer height variations (3px↔10px, 8px↔3px, 5px↔12px) |
| `introConfettiFall` | fall + 720deg rotation + fade |
| `streak-pulse` | box-shadow animation 1.5s ease-in-out |
| `live-pulse` | opacity + box-shadow combined |
| `district-in` | opacity + translateX (district reveal) |
| `ticker-scroll` | horizontal infinite scroll ticker, pauses on hover |

### Transition Speeds
0.15s, 0.2s, 0.3s, 0.5s, 0.6s, 0.7s, 1s, 1.2s, 2s, 2.5s, 3s

---

## Activity Feed / Live Ticker
Bottom bar: `fixed bottom-11.5 sm:bottom-0` — real-time activity ticker
Events displayed:
- "🏆 unlocked achievements"
- "🏗️ claimed their building"
- "🛍️ bought an item"
- "👏 gave kudos"
- "🤝 brought to the city"
- "🎁 gifted an item"
- "📈 climbed to rank"
- "👑 entered top position"
- "💥 battled building"
- "🛡️ defended against"
- "🔥 checked in (streak)"

---

## Interactive Elements

- **Onboarding dialog**: "Not in the city yet" → "Claim your building"
- **City controls**: ESC / Back, Pause / Resume, "Got it, let's fly!"
- **Radio player**: play/pause, previous track, mute, shuffle (bottom bar)
- **Leaderboard tabs**: contributors | stars | architects
- **Gift modal**: "🎁 Open Free Gift!" with shimmer CTA
- **Kudos system**: "👏 gave kudos" — floating emoji animation
- **Raids**: battle system (`/api/raid/preview`, `/api/raid/execute`)
- **VS Code Extension**: "Git City: Pulse" marketplace integration

---

## Layout Patterns

- **Glass-morphism cards**: `bg-bg/70 backdrop-blur-sm border border-border`
- **Pixel shadows**: hard 4px 4px drop shadow (no blur) — consistent retro aesthetic
- **Z-index stack**: 10, 20, 25, 30, 31, 35, 39, 40, 50, 55, 60, 70, 80, 90, 100
- **Spacing unit**: 0.25rem base (`--spacing`)
- **Border radius**: mostly sharp (1px, 3px, 4px) — consistent with pixel art aesthetic

---

## Footer

Links: Terms | Privacy | Support
External: Discord (`https://discord.gg/2bTjFAkny7`) | GitHub repo

---

## Mobile Responsiveness

Breakpoints: 40rem (sm), 48rem (md), 64rem (lg), 80rem, 96rem
Bottom bar adjusts: `bottom-11.5 sm:bottom-0` (mobile has extra bottom padding)

---

## Sponsors / Monetization

- AbacatePay (Pix/Card payments — Brazilian market)
- Acelera Dev
- Viral Day
- `/advertise` route for billboard ads in the 3D city (`/api/sky-ads`)
- PX currency system (collected while flying)

---

## Technical Stack

- Framework: Next.js (App Router)
- 3D Engine: Three.js (WebGL)
- Auth: Supabase + GitHub OAuth
- Database: Supabase/PostgreSQL
- Analytics: Himetrica
- PWA: Yes (manifest.webmanifest)
- Font: Silkscreen (Google Fonts)
