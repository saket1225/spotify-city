import { SpotifyProfile, BuildingParams, BuildingStyle } from '@/types';

const GENRE_COLORS: Record<string, string> = {
  pop: '#FF69B4',
  rock: '#DC143C',
  'hip hop': '#FFD700',
  'hip-hop': '#FFD700',
  rap: '#FFD700',
  electronic: '#00FFFF',
  edm: '#00FFFF',
  'r&b': '#9370DB',
  soul: '#9370DB',
  jazz: '#CD853F',
  classical: '#F5F5DC',
  indie: '#98FB98',
  metal: '#2F4F4F',
  country: '#DEB887',
  latin: '#FF6347',
  reggae: '#00FF00',
  'k-pop': '#FF69B4',
  punk: '#FF4444',
  blues: '#4169E1',
  folk: '#A0522D',
  afrobeats: '#FF8C00',
  funk: '#FF00FF',
  synthwave: '#8B00FF',
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

  const gridCols = 5;
  const spacing = 9;
  const row = Math.floor(index / gridCols);
  const col = index % gridCols;
  const offsetX = Math.sin(index * 7.3) * 1.0;
  const offsetZ = Math.cos(index * 4.1) * 1.0;
  const x = (col - gridCols / 2) * spacing + offsetX;
  const z = (row - 2) * spacing + offsetZ;

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
  };
}

export function generateDemoBuildings(profiles: SpotifyProfile[]): BuildingParams[] {
  return profiles.map((p, i) => generateBuildingParams(p, i));
}
