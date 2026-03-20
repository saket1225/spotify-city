# Spotify City - The Plan

## The Core Insight
> Viral web experiences don't visualize data. They create a new language for people to talk about themselves.

Receiptify = your music as a receipt. Icebergify = your taste depth as an iceberg. Git City = your code as a building.
**Spotify City = your listening life as a city skyline.**

The metaphor IS the product. Everything else serves it.

---

## What's Wrong Right Now
The current build has too many features thrown together without a clear user journey. It feels like a tech demo, not an experience. The 3D is heavy, the UI is cluttered, and there's no clear "wow moment."

**The fix: strip it back, make it focused, make it fast, make it personal.**

---

## The User Journey (30 seconds to share)

### Step 1: Landing (0-3 seconds)
- Dark screen. A single line appears: **"Your music. Your city."**
- Below it: a green "Sign in with Spotify" button
- Behind the text: a slowly rotating demo city, out of focus, atmospheric
- That's it. Nothing else. No nav, no features, no clutter.

### Step 2: Loading (3-8 seconds)
- After OAuth, show: **"Building your city..."**
- Animated skyline silhouette rising from the ground (already built this)
- Actually fetching Spotify data in the background
- Quick stats flash as they load: "427 hours listened... 12 genres... 847 tracks..."

### Step 3: The Reveal (8-15 seconds) - THE WOW MOMENT
- Camera starts high above, looking down at darkness
- Your city fades in from below - buildings rise up one by one
- Camera swoops down in a cinematic arc through YOUR city
- Your tallest building (top artist) is front and center, glowing brightest
- Buildings are arranged in genre neighborhoods
- Camera settles into orbit. City rotates slowly.
- Your name appears: **"[Name]'s City"**
- Below: "427 hours | 12 genres | Top 1% of [Artist] listeners"

### Step 4: Explore (15-30 seconds)
- Click any building to see: artist name, hours listened, top tracks
- Your building has a beacon/crown
- Genre districts labeled subtly on the ground
- Leaderboard accessible but not in your face

### Step 5: Share (the whole point)
- One button: **"Share Your City"**
- Generates a 9:16 card (Instagram Story format) with:
  - Your city skyline silhouette
  - Your name
  - Key stats (hours, top artist, genres)
  - "spotifycity.app" watermark
  - QR code to build yours
- Also generates a 1:1 square card for Twitter/X
- One-tap share to Instagram Stories, Twitter, or download

---

## Design Principles

### 1. Less is more
- Remove: Leaderboard panel, Compare mode, Invite friends panel, Badge system, keyboard hints, genre filter chips, search bar
- These are features for Day 30, not Day 1. Day 1 is about the wow moment and the share.

### 2. Performance is non-negotiable
- Must run at 60fps on a 2020 MacBook Air
- Max 20-30 buildings (your actual artists, not random sample data)
- Instanced meshes where possible
- No bloom if it tanks performance - better to be smooth than pretty

### 3. The share card is the product
- If the share card doesn't make someone stop scrolling, nothing else matters
- Design the card FIRST, then build the 3D experience around it
- The card needs to work at thumbnail size on a phone screen

### 4. Personal, not generic
- Every building is one of YOUR artists
- Building height = how much you listened to that artist
- Building color = that artist's genre
- The city is YOUR city, not a random demo

### 5. The aesthetic (from 3D design research)
- Dark, but NEVER pure black. Use near-blacks with blue/purple hue cast (e.g. #08090a not #000000)
- One accent color: Spotify green (#1DB954)
- One font: Silkscreen (pixel/retro) for headings, Inter for body
- Film grain overlay on dark backgrounds - hides color banding, adds tactility
- Authored camera path, not free orbit - guide users through the city cinematically
- Spring easing for animations - not ease-in-out. Use CSS linear() with 30+ control points for physical feel
- Fog, particles, subtle glow - but performance first
- Think: Blade Runner meets Spotify Wrapped
- Reduce motion support: all animations multiplied by --motion CSS variable (0 for prefers-reduced-motion)

---

## Building Mapping (Simplified)

Each building = one of your top artists.

| Artist Data | Building Visual |
|---|---|
| Listening hours | Height (taller = more hours) |
| Genre | Color (blue = electronic, red = rock, etc) |
| How recently played | Window glow brightness |
| Number of tracks played | Building width |
| Your #1 artist | Gets a crown/beacon + center position |

Genre neighborhoods:
- Pop/Dance: city center
- Rock/Metal: north
- Hip-Hop/R&B: east
- Electronic: west
- Indie/Folk: south
- Classical/Jazz: southeast

---

## The Share Card Design

### Portrait (9:16 - Instagram Stories)
```
+---------------------------+
|                           |
|     [City Skyline]        |
|     silhouette render     |
|     with glow effects     |
|                           |
|                           |
|     [NAME]'s CITY         |
|                           |
|     427 hours listened    |
|     #1: Taylor Swift      |
|     12 genres explored    |
|                           |
|     Top 1% of Swift       |
|     listeners worldwide   |
|                           |
|     +---------+           |
|     | QR Code |           |
|     +---------+           |
|     build yours at        |
|     spotifycity.app       |
|                           |
|     @codanium_            |
+---------------------------+
```

### Square (1:1 - Twitter/X)
```
+---------------------------+
|  [Name]'s City            |
|                           |
|  [City Skyline Render]    |
|                           |
|  427h | 12 genres | #1 TS |
|  spotifycity.app          |
+---------------------------+
```

---

## Technical Architecture

### Stack (keep what works)
- Next.js 14 App Router + TypeScript
- Three.js via React Three Fiber
- Tailwind CSS
- Spotify OAuth via NextAuth
- Vercel hosting

### Performance Budget
- First paint: < 2 seconds
- Interactive (3D loaded): < 5 seconds
- Share card generation: < 3 seconds
- Target: 60fps on M1 MacBook Air

### Key Technical Decisions
1. **Max 25 buildings** - your top 25 artists. Not 100, not 50. 25.
2. **Instanced rendering** - one geometry type per building style, instanced
3. **No individual useFrame per building** - batch animations
4. **Share card** = server-side rendered SVG or canvas snapshot
5. **Progressive loading** - show city shell immediately, fill in details

---

## What to Build (in order)

### Phase 1: Strip & Rebuild (Day 1)
1. Remove all secondary features (leaderboard, compare, invite, badges, search)
2. Rebuild the landing page (minimal: title + sign in + demo city behind)
3. Wire up real Spotify data: fetch top artists, calculate listening time
4. Map each artist to a building (height = hours, color = genre)
5. The reveal animation: buildings rise up, camera swoops in

### Phase 2: The Share Card (Day 1-2)
1. Design and build the 9:16 share card
2. Design and build the 1:1 share card
3. One-tap share to Instagram Stories / Twitter
4. Download button
5. "Build yours" QR code

### Phase 3: Polish (Day 2)
1. Performance optimization pass
2. Mobile experience (the card + simple city view)
3. Loading states and transitions
4. Error handling (expired tokens, API limits)

### Phase 4: Ship & Distribute (Day 2-3)
1. Deploy to spotifycity.app (or similar domain)
2. Saket posts on Twitter (@codanium_)
3. Submit to Spotify Developer Showcase
4. Post on Reddit (r/spotify, r/dataisbeautiful, r/webdev)
5. Submit to Product Hunt

---

## What NOT to Build (yet)

- Leaderboards (maybe v2)
- Compare mode (maybe v2)
- Invite friends system (maybe v2)
- Achievement badges (maybe v2)
- Keyboard shortcuts
- Genre filter chips
- Search bar
- Multiple building styles per artist
- Sound/music integration
- Real-time activity signals

These are all good ideas. But they're v2. v1 is: sign in, see your city, share it.

---

## Success Metrics
- Time to share: under 30 seconds
- Share card looks good at thumbnail size
- Runs at 60fps on normal hardware
- Someone sees the share card and immediately wants to build their own city
