# Viral Web Experiences: Deep Research Analysis
**Research Date:** March 19, 2026
**Purpose:** Reference document for Spotify City project — understanding what makes interactive web experiences go viral

---

## Table of Contents
1. [The Git City — thegitcity.com](#1-the-git-city)
2. [Receiptify — receiptify.herokuapp.com](#2-receiptify)
3. [The Pudding — pudding.cool](#3-the-pudding)
4. [Spotify Wrapped — Design Anatomy](#4-spotify-wrapped-design-anatomy)
5. [Companion Tools: Icebergify, Obscurify, Stats.fm](#5-companion-tools)
6. [The Pudding's "Judge My Music" — pudding.cool/judge-my-music](#6-pudding-judge-my-music)
7. [Common Patterns in Viral Web Apps](#7-common-patterns-in-viral-web-apps)
8. [Key Takeaways for Spotify City](#8-key-takeaways-for-spotify-city)

---

## 1. The Git City

**URL:** https://www.thegitcity.com
**Built by:** Samuel Rizzon (@samuelrizzondev)
**Tech Stack:** Next.js 16 (App Router, Turbopack), React Three Fiber (Three.js), TypeScript, Supabase (PostgreSQL + GitHub OAuth), Stripe, Tailwind CSS v4, Silkscreen pixel font, Vercel

### First Impression (First 3 Seconds)
Landing on Git City, the immediate hook is a minimalist interface with a text input asking for a GitHub username — but the real draw is implied: a 3D city is loading in the background. The UI shows live social proof immediately: "★ 4,165" GitHub stars and "Discord 552" members in the top bar. A button reads "6 coding now" — signaling real-time developer activity somewhere in the city. There are ambient music buttons (Midnight, Lo-fi, Intro) suggesting this is an *experience*, not just a tool.

The snapshot from browser interaction confirms the sparse, focused entry point:
- Star count and Discord membership as credibility signals
- A "Retry" button suggesting the 3D world is initializing
- Music playlist buttons suggesting an atmospheric, immersive intent

**Note:** The 3D canvas requires WebGL and does not render in headless browser environments, confirming this is a client-side WebGL experience that prioritizes rich rendering over fast load.

### The Wow Moment
The hook happens when your building appears. Each GitHub user becomes a 3D pixel-art building where:
- **Height** = contribution volume
- **Width** = repository count
- **Window brightness** = project star count / popularity
- **Glow effects** = recent coding activity
- **Live signals** = VS Code extension shows a building "lighting up" when a dev is actively writing code

The "aha" moment is recognizing yourself as architecture. Prolific developers see tall, glowing towers. Newer devs see smaller structures. The city is populated with real developers from around the world — you can fly through it and discover other builders.

### Visual Aesthetic
- **Style:** Pixel art / voxel aesthetic — chunky buildings, retro aesthetic meets modern 3D
- **Font:** Silkscreen (Google Fonts) — a pixel/bitmap typeface that reinforces the retro-digital theme
- **Atmosphere:** Ambient city lighting, glow effects, lo-fi music playlist built in
- **Feel:** Cozy, game-like — reminiscent of walking through a virtual city at night. Not intimidating, not corporate.
- **Color:** Dark night-time city palette with lit windows and aura effects

### Social Features
The platform goes beyond visualization into genuine social infrastructure:
- **Achievement system** based on contributions, stars, repos, and referrals
- **Kudos system** — send appreciation to other developers' buildings
- **Item gifting** — crowns, auras, roof effects, decorative items (with Stripe payments)
- **Building customization** shop
- **Side-by-side developer comparison**
- **Shareable profile cards** in multiple formats (the key viral output)
- **Activity feed** of what's happening in the city
- **VS Code extension** showing live coding activity

### How Sharing Works
The primary shareable artifact is a **profile card** — a formatted image showing your building and stats that's designed for social media sharing. The URL for any developer's building is shareable (e.g., thegitcity.com/username), and the profile card can be downloaded as an image.

### What Makes People WANT to Share It
1. **Developer identity is visualized** — your GitHub activity becomes something you can *show*, not just describe
2. **Comparison appeal** — you can see how your building stacks up against others, triggering social comparison
3. **The "I am a building" realization** is inherently shareworthy and strange/fun
4. **Gaming mechanics** — achievements, items, and the city exploration make it feel like a game you show friends
5. **The live coding indicator** is unique: developers can show "I'm currently coding" in real-time

### Technical Performance Notes
- Uses **instanced meshes and LOD (Level of Detail)** systems to render distant buildings with simplified geometry — essential for a world with potentially thousands of buildings
- Real-time updates via Supabase
- The 3D canvas is heavy — the "Retry" button visible in browser interaction suggests initialization can fail or take time
- Runs entirely on Vercel with SSR via Next.js App Router

### What Could Be Better
- **Load time for the 3D world** appears to be a bottleneck — a Retry button on first load suggests fragility
- **Hacker News reaction was modest** — 1 point and 2 comments, with the main observation being it resembles an earlier project (honzaap.github.io/GithubCity). The concept isn't novel, though the execution is superior.
- **The gamification/shop layer** may feel incongruous with the pure visualization concept
- **Discoverability** of other developers in the city is unclear — how do you find interesting people?
- The **pixel art aesthetic** may feel dated to some audiences; it leans retro-game rather than premium

---

## 2. Receiptify

**URL:** https://receiptify.herokuapp.com
**Built by:** Michelle Liu (independent developer/grad student)
**Tech Stack:** Heroku, Handlebars templating, Google Analytics, Spotify OAuth API

### First Impression (First 3 Seconds)
Landing on Receiptify shows a stark, simple login page with two prominent buttons: "Log in with Spotify" and "Last.fm." There's a navigation bar with Home, About, Privacy Policy, and Contact. The design is extremely minimal — white background, clean type. The promise is implicit: connect your Spotify and see something interesting.

Within 3 seconds: you know exactly what to do and you do it. No friction, no explanation needed.

### The Wow Moment
The hook fires the moment you see your receipt. Suddenly your listening history is formatted as a **point-of-sale receipt**:

```
ORDER #[your number]
CARDHOLDER: [your name]
────────────────────
QTY  ITEM              DURATION
 47  Song Title        3:24
 31  Another Song      4:12
...
────────────────────
TOTAL: [sum of durations]
```

The "wow" is the absurdist reframe: your musical taste rendered as a grocery receipt. The format is immediately recognizable (everyone has received a store receipt), but applying it to music is unexpected and funny. It creates instant self-awareness — "I've apparently listened to this track 47 times?"

### Visual Aesthetic
- **Core metaphor:** Point-of-sale receipt — monospace font, thermal printer aesthetic
- **Colors:** Black and white (classic receipt), with the "brat" mode offering a green alternative aesthetic
- **Font:** Monospaced, system-like — deliberately evokes a receipt printer
- **Feel:** Intentionally lo-fi, functional, anti-design. The beauty is in the contrast: your intimate musical life rendered in the cold format of commerce.
- **Alternatives:** "Classic" receipt or "brat" aesthetic (referencing Charli XCX's iconic lime-green album design)

### How Sharing Works
Receiptify's sharing is frictionless and beautifully designed:
1. **Download as image** — generates a PNG of your receipt, perfectly sized for Instagram/Twitter
2. **View in new tab** — for quick screenshot
3. **Save as Spotify playlist** — converts your receipt into an actual playlist

The PNG format is the viral engine. It's a complete, self-contained artifact. No app download, no account creation for viewers. You just see someone's receipt and immediately understand what it is.

**Customization options that drive sharing:**
- Time periods: Last month / 6 months / all-time
- Length: Top 10 or Top 50 tracks
- Font: Classic or "international" (wider character support)
- Mode: Classic receipt or "brat" aesthetic

### What Makes People WANT to Share It
1. **Humorous recontextualization** — the absurdity of a grocery receipt for music taste is inherently funny
2. **Reveals private habits** — "I didn't realize I listened to white noise while sleeping 60 times" creates self-awareness moments worth sharing
3. **Compact and readable** — unlike a full Wrapped slideshow, a receipt fits in one image and is instantly parseable
4. **Triggers comparison** — seeing a friend's receipt makes you want to generate your own
5. **Built by one person** — the organic, indie origin story resonates; it feels like a clever hack, not a corporate product
6. **Zero cost, zero account** — no barrier to entry

### Viral Success Metrics
Over **1 million uses in its initial months**. The project spread primarily through Twitter and TikTok, with users posting their receipts organically. It became a cultural shorthand for sharing music taste during the period between official Spotify Wrapped releases.

### What Could Be Better
- **Hosted on Heroku** — reliability concerns (Heroku free tier discontinuation) are a real risk for continued availability
- **No social graph** — you can't browse other people's receipts; it's purely a personal generator
- **No year-over-year comparison** — would be compelling to see how taste evolves
- **Limited to top tracks** — doesn't show genre breakdown or listening time in the same visual

---

## 3. The Pudding

**URL:** https://pudding.cool
**Format:** Digital publication with interactive data stories
**Publishing since:** 2017

### First Impression (First 3 Seconds)
The Pudding's homepage shows a grid of colorful thumbnail cards, each representing a different interactive story. The visual variety is immediate — no two cards look alike. Some are bold and typographic, others are data-dense, some are photography-driven. The tagline "visual essays about culture" sets expectation.

The navigation filters (Our Faves / Popular / Updating / Your Input / Video / Audio) hint at the breadth of content. Each story displays a publication date and brief description.

### What Makes The Pudding Special
The Pudding's fundamental insight is that **data becomes interesting when it reveals something you already suspected but couldn't prove, or something surprising you didn't expect.**

Their visual essays cover everything: why women's clothing sizes are inconsistent, how musical diversity in pop has declined, what congressional language reveals about political identity, regional climate patterns. The range is enormous, but the format is consistent: interactive, scroll-driven, data-backed.

### The Signature Technique
The Pudding popularized **scrollytelling** — where scrolling down the page triggers data transitions, chart animations, and narrative reveals. As you scroll:
- Charts animate into view
- Filters change to highlight what the text is discussing
- Audio samples play to illustrate musical comparisons
- The data responds to your reading pace

This creates an experience closer to a documentary than an article.

### Visual Aesthetic
- **Design philosophy:** Each story has its own unique visual identity — colors, fonts, layout are bespoke to the subject
- **Grid layouts** with generous whitespace
- **Colorful but purposeful** — color encodes meaning in charts, not decoration
- **Dark themes common** for music/culture stories; lighter for social data
- The homepage uses a sticker-style icon aesthetic for navigation

### Viral Stories & Interactive Elements
Key stories that generated significant sharing:
- **"How Bad Is Your Streaming Music?"** — AI-roasts your Spotify taste (see Section 6)
- **"Are Hit Songs Getting Less Musically Diverse?"** — interactive music similarity analysis with playable audio
- **Song lyric analysis stories** with filters by artist, era, and theme
- **Women's clothing size inconsistency** — resonated virally because it validated widespread frustration

### What Makes Pudding Stories Shareable
1. **Validate what you already feel** — "I knew pop was getting more samey!" confirmation bias fuel
2. **Surprise you with data you couldn't have found yourself** — original research, not regurgitated content
3. **Interactive = participatory** — you're not just reading, you're exploring; this creates ownership
4. **Each story feels like a product** — not a blog post — making it tweet-worthy as a link

---

## 4. Spotify Wrapped — Design Anatomy

Spotify Wrapped is the gold standard for viral product features. Released annually in early December, it generates **over 2 billion social media impressions** and turns every Spotify user into an organic advertiser.

### The Core Design Decisions That Create Virality

#### 1. The Slide Format (9:16 Vertical)
Wrapped is delivered as a series of full-screen slides in portrait orientation — perfectly sized for Instagram Stories and TikTok. **No cropping, no reformatting needed.** The friction of sharing is essentially zero. You tap through your story, then tap "Share," and it goes directly to your Story.

This is intentional engineering. The format was designed for the destination, not the app.

#### 2. Bold, High-Contrast Graphic Design
Each slide uses:
- **Extreme typographic scale** — numbers like "46,878 minutes" displayed at massive size
- **Gradient backgrounds** in Spotify's signature green, but also purples, pinks, oranges
- **Animated transitions** between slides — kinetic energy makes it feel alive
- **Minimal text per slide** — one stat, one insight, one emotion per screen

The visual language is closer to a concert poster or album cover than a data dashboard.

#### 3. Narrative Arc, Not Just Stats
Wrapped doesn't just list your top songs. It tells a story:
- "Your year started with..."
- "Your top genre was X, which tells us you're a..."
- "You're in the top 1% of [Artist] listeners worldwide"
- "Your listening personality type is: The Alchemist"

This transforms data into identity. You're not seeing numbers; you're seeing a character analysis of yourself.

#### 4. Social Comparison Built In
- **Top 1% listener** badges for specific artists trigger tribal belonging ("I'm one of the true fans")
- **City-based comparisons** — "You're the [X]th biggest [Artist] fan in [City]"
- **Listening personality archetypes** — shareable identity labels

The Social Comparison Theory effect: people want to know where they stand, and they want others to know too.

#### 5. Quantitative Fixation
Numbers are precise and large:
- "46,878 minutes listened"
- "63 different genres"
- "Your #1 song was played 147 times"

Precise numbers feel more real than round ones. "About 47,000 minutes" has less impact than the exact figure. The specificity creates the sensation that Spotify *really knows you.*

#### 6. Nostalgia Mechanics
Wrapped is explicitly a **time capsule**. It anchors songs to the emotional memories of the year — breakups, travel, late-night work sessions. This activates nostalgia, which is one of the most powerful sharing motivators. People don't just share data; they share their year.

#### 7. FOMO & Anticipation Engineering
- Notifications sent **a week before release**, building anticipation
- The feature disappears after a period, creating scarcity
- Social media floods with Wrapped content on launch day, making non-sharers feel left out
- Seeing friends' Wrappeds triggers immediate desire to check your own

#### 8. Identity as Performance
Music taste is identity shorthand — similar to astrology or Myers-Briggs. Sharing your Wrapped is saying: "This is who I am, this is my aesthetic, these are my people." The research (Harper's Bazaar Australia, Irrational Labs) confirms that people use Wrapped to signal:
- Cultural belonging (shared artists with social groups)
- Individuality (obscure artists at the bottom of their iceberg)
- Personality traits (genre mixes suggesting complexity or focus)
- Even sexuality and subculture membership within certain communities

#### 9. The 2024 Lesson: Human Touch Matters
The 2024 Wrapped introduced an AI-generated personalized podcast summarizing your year — and it **backfired**. Users described it as "boring," "AI overkill," and "barebones." The lesson: Wrapped's magic comes from feeling *seen by a human curator*, not processed by an algorithm. When the human editorial voice disappeared, so did the delight.

**Key insight:** People want personalization that feels like someone cared, not personalization that feels automated.

---

## 5. Companion Tools

### Icebergify (Spotify Iceberg)
**What it does:** Arranges your listened artists in an iceberg visualization — popular artists at the visible tip, obscure artists in the submerged depths.

**The hook:** The iceberg metaphor is perfect for music taste. Having artists "underwater" implies hidden depth, niche knowledge, and that you're more interesting than your surface taste suggests. It flatters the user's sense of being a "real music person."

**Design details:**
- 10-12 levels, artists ranked by Spotify's internal popularity score (0-100)
- Static image output — share by right-clicking or screenshot
- Analyzes streams, shares, saves, likes, followers
- Created by independent developer Akshay Raj (not Spotify)

**Why it went viral:**
- The iceberg meme format was already culturally established (everything has an iceberg now)
- It validates underground taste while not shaming mainstream taste
- Simple, single-image output perfect for Twitter/Instagram
- Organic indie origin makes it feel like a clever discovery, not marketing

---

### Obscurify
**What it does:** Gives you an "obscurity score" — a percentage indicating how unique your music taste is compared to other users. Higher score = more niche.

**The hook:** Music snobs love it. But even mainstream listeners are curious about where they land. The score creates instant competitive dynamics ("I'm 72% obscure, what are you?").

**Why it's shareable:** The obscurity score is a single number — the ultimate shareable stat. Like a credit score for music taste, but fun.

---

### Stats.fm
**What it does:** Deeper Spotify analytics accessible year-round (not just December). Also functions as a social network where you can see friends' listening in real-time.

**Key differentiator:** 27 million users as of early 2026. It's the most full-featured third-party Spotify stats platform, offering continuous access to data Spotify only surfaces once a year via Wrapped.

**Viral mechanic:** Real-time friend activity feeds create ambient awareness of what your social circle is listening to, driving organic sharing and music discovery.

---

### MusicScape
**What it does:** Analyzes your listening and generates a personalized landscape image. Background color = overall mood, mountains = rhythm patterns, mountain quantity/color = unique to your taste.

**Why it's compelling:** It's a *landscape painting* of your music taste — more artistic and unique than a list or chart. The output is visually beautiful in a way that makes people want to use it as a wallpaper or profile image.

---

## 6. Pudding "Judge My Music"

**URL:** https://pudding.cool/2021/10/judge-my-music/

This deserves its own section because it's a masterclass in viral interactive design.

### What It Does
A "faux pretentious music-loving AI" analyzes your Spotify or Apple Music and delivers satirical judgments about your taste. The output uses a chat-like interface with:
- Album artwork displayed on a virtual shelf with 3D perspective
- Animated waveforms
- Parody critic logos (Fantano, Pitchfork-style)
- A numerical "score"
- Hyphenated descriptive phrases like "tay-tay-fangirl-cabincore-trendy-middle-part bad"

### Why It's Brilliant
1. **Self-aware humor removes the sting** — you opt in to being roasted; the judgment is playful, not cruel
2. **Personalized insults are more shareable than compliments** — showing your "bad" taste is funnier and more interesting than showing you have great taste
3. **The language is highly specific** — "k-pop-for-breakfast bad" tells a story in 4 words; the format is instantly meme-able
4. **Technical foundation is honest** — they explicitly say it's NOT real AI, it's a database of jokes + your data. This transparency builds trust.
5. **Critical media parody** — mimicking Fantano and Pitchfork is inherently funny to anyone who follows music criticism

### Visual Design Details
- Dark, sophisticated aesthetic — not cutesy
- Recoleta font for headlines (warm, retro, slightly ironic)
- Inconsolata for interactive elements (monospace, technical feel)
- Album art displayed as a 3D shelf — the spatial metaphor reinforces "your collection"
- Chat interface format creates the illusion of a conversation with a snarky critic

### Viral Mechanics
- Spread primarily through Reddit and TikTok
- The "roast" format is inherently shareable — people love showing they can take a joke
- The hyphenated descriptors become "quotes" people use in captions
- Zero cost, immediate results, one-click auth

---

## 7. Common Patterns in Viral Web Apps

After analyzing all the above, these are the consistent patterns that separate viral tools from forgettable ones:

### Pattern 1: The Personalized Mirror
Every viral tool in this analysis does one thing: **shows you something true about yourself that you didn't have words for before.** Wrapped says you're a "Night Owl Indie Listener." Icebergify shows your depth of taste. Receiptify quantifies how often you returned to a song. The data existed; the tool makes it visible and communicable.

### Pattern 2: The Single Shareable Artifact
The most viral tools produce **one image** — not a link to a dashboard, not a video, not a complex visualization. A single image that:
- Fits in a social media post without cropping
- Is readable in a thumbnail
- Contains enough information to be interesting without clicking through
- Has the tool's name/branding subtly present (organic ad)

Receiptify produces a receipt PNG. Wrapped produces a 9:16 slide. Icebergify produces an iceberg image. Obscurify shows a score.

### Pattern 3: Zero Friction to Wow Moment
The fastest path from landing page to "I want to share this" wins. All of these tools share:
- OAuth login (one click — no email, no password to create)
- Instant result generation (seconds, not minutes)
- Immediate shareability (download/share button visible on result page)
- No paywall before the core experience

Time to wow moment: Receiptify ~15 seconds. Wrapped ~20 seconds. Icebergify ~30 seconds.

### Pattern 4: Identity Signaling, Not Just Data
The data is a vehicle for identity expression. When someone shares their Wrapped, they're not sharing data — they're saying:
- "I'm cultured / eclectic / passionate / focused"
- "I was going through [emotional period implied by music]"
- "I belong to [artist]'s fandom community"
- "I have good/interesting/deep taste"

The best viral tools understand that the content is never just the data — it's what the data says about *you.*

### Pattern 5: Social Comparison with Low Stakes
All of these tools invite comparison without real stakes:
- Being in the "top 1% of listeners" has no real-world consequence but feels meaningful
- Your Iceberg being deeper than someone else's is bragging rights but harmless
- Getting roasted by Pudding is funny, not actually hurtful

The comparison creates engagement without creating anxiety (mostly). When tools get this wrong — when they feel like judgment rather than play — the sharing drops.

### Pattern 6: Novelty of Recontextualization
The receipt is just data. The iceberg is just a ranked list. The 3D city is just a contribution graph. **But the frame transforms the meaning.** The power is not in the data — it's in the metaphor. Finding the right metaphor for familiar data is the core creative act in this design space.

Examples:
- Contribution graph → 3D city skyline (Git City)
- Listening history → grocery receipt (Receiptify)
- Artist popularity → iceberg depth (Icebergify)
- Listening stats → year-end story slides (Wrapped)
- Music taste → roast from a fake critic (Pudding)

### Pattern 7: The Organic Discovery Feeling
The tools that went most viral were **NOT made by Spotify** (except Wrapped). Receiptify (grad student), Icebergify (CS student Akshay Raj), Obscurify (two developers), Pudding's judge (two journalists). The indie origin is part of the appeal — it feels like a clever hack someone built for love, not a corporate feature. This triggers the "you have to try this thing I found" sharing impulse.

### Pattern 8: Timed Scarcity and Cultural Moments
Wrapped's December release creates a cultural moment — a window where everyone is doing the same thing simultaneously. This collective ritual amplifies individual sharing. Missing it creates FOMO. The compression of sharing into one week creates the impression of ubiquity.

### Pattern 9: Aesthetic Intentionality
None of the viral tools in this analysis have generic UI. Each has a distinct, deliberate aesthetic:
- Receiptify: thermal receipt printer
- Icebergify: iceberg diagram
- Git City: pixel art voxel city
- Wrapped: concert poster / bold gradient typography
- Pudding's Judge: vintage hi-fi shop meets music criticism

The aesthetic *is* the signal. People don't just share the data — they share the look. "My Receiptify" is recognizable as Receiptify from 5 feet away. Brand = format.

### Pattern 10: Music as Identity Shorthand
This is specific to music-visualization tools, but worth stating explicitly: **music taste is one of the most efficient identity signals humans have.** More than clothing, more than food preferences, music encodes:
- Generation and era
- Subculture and tribe
- Emotional life and sensitivity
- Class and geography (to some degree)
- Sexuality and community membership

This is why music visualization tools outperform almost all other data visualization tools in virality. The same patterns applied to, say, your grocery purchases or web browsing history would be interesting but not *identity-affirming*. Music is special.

---

## 8. Key Takeaways for Spotify City

Based on this research, here are the specific design implications for a Spotify-city-style project:

### What to steal from Git City
- **Building as metaphor** — turning abstract data (plays, saves, skips) into physical architecture is compelling
- **Live activity signals** — showing when something is "happening" creates real-time energy
- **Social layer** — the ability to explore other people's cities, not just your own
- **Achievement system** — gives returning users reasons to come back
- **Atmospheric music** — the ambient soundtrack built into Git City creates mood without effort

### What to steal from Receiptify
- **Single shareable artifact** — the output should be one beautiful, self-contained image
- **Instant OAuth flow** — Spotify login → result in under 30 seconds
- **Customization that affects the output** — time period, display mode, etc. increase engagement before sharing
- **Free, no login for the tool itself** — lower barrier = more users

### What to steal from Wrapped
- **Narrative framing** — don't just show stats; tell a story with them
- **Bold typography at scale** — the number "46,878 minutes" at massive scale is more powerful than a bar chart
- **9:16 output format** — design for Instagram Stories from day one
- **Identity archetypes** — give users a personality label derived from their data
- **Artist as top-1% signal** — the "you're in the top X% of [Artist] listeners" mechanic is extremely shareable

### What to steal from Icebergify
- **The metaphor is the product** — find the right visual container before anything else
- **Simple, single-image output** — no dashboard, no multiple views, one beautiful thing
- **Depth as a positive signal** — underground/niche content should feel like achievement, not obscurity

### What to steal from Pudding
- **Scrollytelling** — if there's a narrative journey, make it scroll-driven
- **Humor and self-awareness** — don't take the data too seriously; the best tools have wit
- **Each experience as a unique artifact** — every user's city should feel genuinely bespoke, not templated

### The Core Principle
The single most important insight from this research:

> **Viral web experiences don't visualize data. They create a new language for people to talk about themselves.**

The receipt, the iceberg, the 3D city — these are all new vocabularies for self-description. A Spotify city works if it gives users a new, beautiful, unexpected way to say "this is my musical world" — and makes sharing that world feel natural, frictionless, and identity-affirming.

The city metaphor has unique potential beyond existing tools:
- A music city is inherently richer than a receipt (more emotional, more spatial, more explorable)
- Other people's cities can be walked through — social discovery built into the metaphor
- Artists as buildings, genres as neighborhoods, time as weather or lighting — the design space is huge
- The feeling of "flying through your musical life" is experiential in a way a receipt can never be

The challenge is delivering that experience with the same zero-friction access and instant wow moment that makes Receiptify and Wrapped work.

---

*Research compiled from: thegitcity.com, receiptify.herokuapp.com, pudding.cool, Hacker News, Harper's Bazaar AU, Irrational Labs, oreateai.com, earezki.com, SlashGear, NoGood.io, Sprinklr, Medium/Bootcamp, icypluto.com, marketingwithdave.com, irrationallabs.com, GitHub (srizzon/git-city)*
