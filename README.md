# Spotify City

Your music taste visualized as a 3D cyberpunk city.

Each building represents an artist you listen to:
- **Height** = listening hours
- **Color** = genre
- **Style** = variety of tracks

## Tech

Next.js 14, Three.js/React Three Fiber, Spotify API, NextAuth

## Setup

```bash
npm install
cp .env.example .env.local
# Fill in your Spotify API credentials in .env.local
npm run dev
```

Create a Spotify app at [developer.spotify.com](https://developer.spotify.com/dashboard) and add `http://localhost:3000/api/auth/callback/spotify` as a redirect URI.

## Credit

Built by [@codanium_](https://x.com/codanium_)
