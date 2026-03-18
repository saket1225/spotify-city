import { SpotifyProfile, BuildingParams } from '@/types';

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
};

const DEFAULT_COLOR = '#1DB954';

const GENRE_STYLES: Record<string, BuildingParams['style']> = {
  electronic: 'neon',
  edm: 'neon',
  pop: 'modern',
  'k-pop': 'modern',
  'hip hop': 'modern',
  'hip-hop': 'modern',
  rap: 'modern',
  classical: 'classic',
  jazz: 'classic',
  blues: 'classic',
  indie: 'minimal',
  folk: 'minimal',
  metal: 'classic',
  country: 'minimal',
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

function getGenreStyle(genres: string[]): BuildingParams['style'] {
  for (const genre of genres) {
    const lower = genre.toLowerCase();
    for (const [key, style] of Object.entries(GENRE_STYLES)) {
      if (lower.includes(key)) return style;
    }
  }
  return 'modern';
}

export function generateBuildingParams(
  profile: SpotifyProfile,
  index: number
): BuildingParams {
  const height = Math.max(2, Math.min(18, Math.log2(profile.followers + 1) * 1.5));
  const width = Math.max(1.5, Math.min(4, profile.totalPlaylists * 0.15 + 1));
  const depth = Math.max(1.5, Math.min(3.5, profile.totalPlaylists * 0.1 + 1));

  const primaryColor = getGenreColor(profile.topGenres);
  const secondaryColor = darkenColor(primaryColor, 40);

  const windowGlow = Math.min(1, profile.recentlyPlayedCount / 30);
  const style = getGenreStyle(profile.topGenres);

  const gridCols = 5;
  const spacing = 8;
  const row = Math.floor(index / gridCols);
  const col = index % gridCols;
  const offsetX = Math.sin(index * 7.3) * 0.8;
  const offsetZ = Math.cos(index * 4.1) * 0.8;
  const x = (col - gridCols / 2) * spacing + offsetX;
  const z = (row - 2) * spacing + offsetZ;

  return {
    height,
    width,
    depth,
    primaryColor,
    secondaryColor,
    windowGlow,
    style,
    position: [x, 0, z],
    profile,
  };
}

export function generateDemoBuildings(): BuildingParams[] {
  const demos: SpotifyProfile[] = [
    { id: 'd1', displayName: 'Luna Waves', imageUrl: '', followers: 125000, totalPlaylists: 34, topGenres: ['electronic', 'house'], topArtists: [{ name: 'Disclosure', imageUrl: '', genres: ['electronic'] }], topTracks: [{ name: 'Latch', artist: 'Disclosure', albumArt: '' }], recentlyPlayedCount: 28 },
    { id: 'd2', displayName: 'RockStar42', imageUrl: '', followers: 850, totalPlaylists: 12, topGenres: ['rock', 'alternative'], topArtists: [{ name: 'Foo Fighters', imageUrl: '', genres: ['rock'] }], topTracks: [{ name: 'Everlong', artist: 'Foo Fighters', albumArt: '' }], recentlyPlayedCount: 15 },
    { id: 'd3', displayName: 'JazzCat', imageUrl: '', followers: 3200, totalPlaylists: 45, topGenres: ['jazz', 'soul'], topArtists: [{ name: 'Miles Davis', imageUrl: '', genres: ['jazz'] }], topTracks: [{ name: 'So What', artist: 'Miles Davis', albumArt: '' }], recentlyPlayedCount: 8 },
    { id: 'd4', displayName: 'PopPrincess', imageUrl: '', followers: 50000, totalPlaylists: 28, topGenres: ['pop', 'dance pop'], topArtists: [{ name: 'Dua Lipa', imageUrl: '', genres: ['pop'] }], topTracks: [{ name: 'Levitating', artist: 'Dua Lipa', albumArt: '' }], recentlyPlayedCount: 35 },
    { id: 'd5', displayName: 'HipHopHead', imageUrl: '', followers: 420, totalPlaylists: 8, topGenres: ['hip hop', 'rap'], topArtists: [{ name: 'Kendrick Lamar', imageUrl: '', genres: ['hip hop'] }], topTracks: [{ name: 'HUMBLE.', artist: 'Kendrick Lamar', albumArt: '' }], recentlyPlayedCount: 22 },
    { id: 'd6', displayName: 'ClassicalNerd', imageUrl: '', followers: 15000, totalPlaylists: 60, topGenres: ['classical', 'orchestral'], topArtists: [{ name: 'Einaudi', imageUrl: '', genres: ['classical'] }], topTracks: [{ name: 'Nuvole Bianche', artist: 'Einaudi', albumArt: '' }], recentlyPlayedCount: 5 },
    { id: 'd7', displayName: 'IndieSoul', imageUrl: '', followers: 200, totalPlaylists: 15, topGenres: ['indie', 'folk'], topArtists: [{ name: 'Bon Iver', imageUrl: '', genres: ['indie'] }], topTracks: [{ name: 'Skinny Love', artist: 'Bon Iver', albumArt: '' }], recentlyPlayedCount: 12 },
    { id: 'd8', displayName: 'MetalHead666', imageUrl: '', followers: 6500, totalPlaylists: 20, topGenres: ['metal', 'heavy metal'], topArtists: [{ name: 'Metallica', imageUrl: '', genres: ['metal'] }], topTracks: [{ name: 'Master of Puppets', artist: 'Metallica', albumArt: '' }], recentlyPlayedCount: 18 },
    { id: 'd9', displayName: 'LatinVibes', imageUrl: '', followers: 89000, totalPlaylists: 22, topGenres: ['latin', 'reggaeton'], topArtists: [{ name: 'Bad Bunny', imageUrl: '', genres: ['latin'] }], topTracks: [{ name: 'Dakiti', artist: 'Bad Bunny', albumArt: '' }], recentlyPlayedCount: 30 },
    { id: 'd10', displayName: 'KpopStan', imageUrl: '', followers: 250000, totalPlaylists: 40, topGenres: ['k-pop', 'korean pop'], topArtists: [{ name: 'BTS', imageUrl: '', genres: ['k-pop'] }], topTracks: [{ name: 'Dynamite', artist: 'BTS', albumArt: '' }], recentlyPlayedCount: 42 },
    { id: 'd11', displayName: 'CountryRoads', imageUrl: '', followers: 1800, totalPlaylists: 10, topGenres: ['country', 'americana'], topArtists: [{ name: 'Chris Stapleton', imageUrl: '', genres: ['country'] }], topTracks: [{ name: 'Tennessee Whiskey', artist: 'Chris Stapleton', albumArt: '' }], recentlyPlayedCount: 9 },
    { id: 'd12', displayName: 'NeonDreamer', imageUrl: '', followers: 32000, totalPlaylists: 55, topGenres: ['edm', 'future bass'], topArtists: [{ name: 'Flume', imageUrl: '', genres: ['edm'] }], topTracks: [{ name: 'Never Be Like You', artist: 'Flume', albumArt: '' }], recentlyPlayedCount: 25 },
    { id: 'd13', displayName: 'ReggaeKing', imageUrl: '', followers: 7700, totalPlaylists: 18, topGenres: ['reggae', 'dancehall'], topArtists: [{ name: 'Bob Marley', imageUrl: '', genres: ['reggae'] }], topTracks: [{ name: 'Three Little Birds', artist: 'Bob Marley', albumArt: '' }], recentlyPlayedCount: 14 },
    { id: 'd14', displayName: 'PunkRocker', imageUrl: '', followers: 500, totalPlaylists: 6, topGenres: ['punk', 'punk rock'], topArtists: [{ name: 'Green Day', imageUrl: '', genres: ['punk'] }], topTracks: [{ name: 'Basket Case', artist: 'Green Day', albumArt: '' }], recentlyPlayedCount: 20 },
    { id: 'd15', displayName: 'RnBSmooth', imageUrl: '', followers: 18000, totalPlaylists: 30, topGenres: ['r&b', 'neo soul'], topArtists: [{ name: 'SZA', imageUrl: '', genres: ['r&b'] }], topTracks: [{ name: 'Kill Bill', artist: 'SZA', albumArt: '' }], recentlyPlayedCount: 17 },
  ];
  return demos.map((p, i) => generateBuildingParams(p, i));
}
