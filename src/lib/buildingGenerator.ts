import { SpotifyProfile, BuildingParams, BuildingStyle } from '@/types';

const GENRE_COLORS: Record<string, string> = {
  pop: '#FF69B4',
  rock: '#FF2244',
  'hip hop': '#FFD700',
  'hip-hop': '#FFD700',
  rap: '#FFD700',
  electronic: '#00FFFF',
  edm: '#00FFFF',
  'r&b': '#BF5FFF',
  soul: '#BF5FFF',
  jazz: '#4488FF',
  classical: '#AA66FF',
  indie: '#39FF8F',
  metal: '#FF3333',
  country: '#FF8800',
  latin: '#FF5544',
  reggae: '#00FF66',
  'k-pop': '#FF44CC',
  punk: '#FF2222',
  blues: '#3388FF',
  folk: '#22FFAA',
  afrobeats: '#FF6600',
  funk: '#FF00FF',
  synthwave: '#AA00FF',
};

const DEFAULT_COLOR = '#1DB954';

const GENRE_STYLE_MAP: Record<string, BuildingStyle> = {
  pop: 'skyscraper',
  'dance pop': 'skyscraper',
  'synth pop': 'skyscraper',
  'k-pop': 'skyscraper',
  rock: 'fortress',
  metal: 'fortress',
  'heavy metal': 'fortress',
  'thrash metal': 'fortress',
  punk: 'fortress',
  'punk rock': 'fortress',
  grunge: 'fortress',
  electronic: 'neon-tower',
  edm: 'neon-tower',
  synthwave: 'neon-tower',
  'future bass': 'neon-tower',
  techno: 'neon-tower',
  house: 'neon-tower',
  'hip hop': 'penthouse',
  'hip-hop': 'penthouse',
  rap: 'penthouse',
  trap: 'penthouse',
  indie: 'brownstone',
  folk: 'brownstone',
  'indie folk': 'brownstone',
  'singer-songwriter': 'brownstone',
  alternative: 'brownstone',
  americana: 'brownstone',
  country: 'brownstone',
  classical: 'cathedral',
  jazz: 'cathedral',
  orchestral: 'cathedral',
  piano: 'cathedral',
  blues: 'cathedral',
};

function getGenreColor(genres: string[]): string {
  for (const genre of genres) {
    const lower = genre.toLowerCase();
    for (const [key, color] of Object.entries(GENRE_COLORS)) {
      if (lower.includes(key)) return color;
    }
  }
  return DEFAULT_COLOR;
}

function darkenColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, (num >> 16) - amount);
  const g = Math.max(0, ((num >> 8) & 0x00ff) - amount);
  const b = Math.max(0, (num & 0x0000ff) - amount);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

function lightenColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, (num >> 16) + amount);
  const g = Math.min(255, ((num >> 8) & 0x00ff) + amount);
  const b = Math.min(255, (num & 0x0000ff) + amount);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

function getGenreStyle(genres: string[]): BuildingStyle {
  for (const genre of genres) {
    const lower = genre.toLowerCase();
    if (GENRE_STYLE_MAP[lower]) return GENRE_STYLE_MAP[lower];
    for (const [key, style] of Object.entries(GENRE_STYLE_MAP)) {
      if (lower.includes(key)) return style;
    }
  }
  return 'modern';
}

// Genre district definitions
export const GENRE_DISTRICTS: { name: string; label: string; center: [number, number]; radius: number; keywords: string[] }[] = [
  { name: 'pop', label: 'POP', center: [0, 0], radius: 25, keywords: ['pop', 'dance pop', 'synth pop', 'k-pop', 'korean pop', 'j-pop', 'latin pop'] },
  { name: 'rock', label: 'ROCK', center: [40, -30], radius: 22, keywords: ['rock', 'metal', 'heavy metal', 'thrash metal', 'punk', 'punk rock', 'grunge', 'alternative'] },
  { name: 'hiphop', label: 'HIP-HOP', center: [-35, -25], radius: 22, keywords: ['hip hop', 'hip-hop', 'rap', 'trap', 'r&b', 'neo soul', 'soul'] },
  { name: 'electronic', label: 'ELECTRONIC', center: [-30, 35], radius: 22, keywords: ['electronic', 'edm', 'house', 'techno', 'synthwave', 'future bass', 'dubstep', 'ambient', 'chillhop'] },
  { name: 'indie', label: 'INDIE', center: [35, 30], radius: 22, keywords: ['indie', 'folk', 'singer-songwriter', 'indie folk', 'americana', 'country', 'bluegrass'] },
  { name: 'classical', label: 'CLASSICAL', center: [0, -45], radius: 22, keywords: ['classical', 'jazz', 'orchestral', 'piano', 'blues', 'cello', 'violin'] },
];

function getDistrict(genres: string[]): typeof GENRE_DISTRICTS[number] {
  for (const genre of genres) {
    const lower = genre.toLowerCase();
    for (const district of GENRE_DISTRICTS) {
      for (const keyword of district.keywords) {
        if (lower.includes(keyword) || keyword.includes(lower)) {
          return district;
        }
      }
    }
  }
  return GENRE_DISTRICTS[0]; // default to pop
}

// Seeded pseudo-random for deterministic placement
function seededRand(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

export function generateBuildingParams(
  profile: SpotifyProfile,
  index: number
): BuildingParams {
  // HEIGHT based on estimatedListeningHours (logarithmic, min 2, max 25)
  const height = Math.max(2, Math.min(25, Math.log2(profile.estimatedListeningHours + 1) * 2.5));

  // WIDTH based on genre diversity (more genres = wider foundation)
  const genreCount = profile.topGenres.length;
  const width = Math.max(1.8, Math.min(5, genreCount * 0.6 + 1));

  // DEPTH proportional to playlist count
  const depth = Math.max(1.5, Math.min(4, profile.totalPlaylists * 0.08 + 1.2));

  const primaryColor = getGenreColor(profile.topGenres);
  const secondaryColor = darkenColor(primaryColor, 50);
  const accentColor = lightenColor(primaryColor, 60);

  // Window glow based on listening streak
  const windowGlow = Math.min(1, profile.listeningStreak / 14);
  const style = getGenreStyle(profile.topGenres);

  // Genre district placement - taller buildings closer to center
  const district = getDistrict(profile.topGenres);
  const maxHeight = 25;
  // Normalized height: 1 = tallest, 0 = shortest
  const heightNorm = (height - 2) / (maxHeight - 2);
  // Taller buildings get placed closer to center (smaller distance factor)
  const distanceFactor = (1 - heightNorm) * 0.8 + 0.1; // range [0.1, 0.9]

  // Deterministic random angle and spread within district
  const angle = seededRand(index * 73 + 17) * Math.PI * 2;
  const minSpread = 3 + index * 0.5; // minimum distance from center to prevent stacking
  const rawSpread = seededRand(index * 137 + 53) * district.radius * distanceFactor;
  const spread = Math.max(minSpread, rawSpread);

  const x = district.center[0] + Math.cos(angle) * spread;
  const z = district.center[1] + Math.sin(angle) * spread;

  // Hash artist name to pick variant 0-2
  const nameHash = profile.displayName.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const variant = nameHash % 3;

  return {
    height,
    width,
    depth,
    primaryColor,
    secondaryColor,
    accentColor,
    windowGlow,
    style,
    position: [x, 0, z],
    profile,
    variant,
  };
}

export function generateDemoBuildings(profiles: SpotifyProfile[]): BuildingParams[] {
  const placed: { x: number; z: number; radius: number }[] = [];

  return profiles.map((p, i) => {
    const params = generateBuildingParams(p, i);
    const minDist = Math.max(params.width, params.depth) * 1.5 + 1;

    let x = params.position[0];
    let z = params.position[2];
    let attempts = 0;

    while (attempts < 50) {
      let overlapping = false;
      for (const pl of placed) {
        const dx = x - pl.x;
        const dz = z - pl.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist < minDist + pl.radius) {
          overlapping = true;
          break;
        }
      }
      if (!overlapping) break;
      // Nudge outward with some angular variation to avoid all going same direction
      const district = getDistrict(params.profile.topGenres);
      const dx = x - district.center[0];
      const dz = z - district.center[1];
      const atCenter = Math.abs(dx) < 0.5 && Math.abs(dz) < 0.5;
      const nudgeAngle = atCenter
        ? seededRand(i * 31 + attempts * 7) * Math.PI * 2  // random direction if at center
        : Math.atan2(dz, dx) + (seededRand(attempts * 13 + i) - 0.5) * 0.8; // outward with jitter
      x += Math.cos(nudgeAngle) * 3;
      z += Math.sin(nudgeAngle) * 3;
      attempts++;
    }

    params.position = [x, 0, z];
    placed.push({ x, z, radius: minDist / 2 });
    return params;
  });
}
