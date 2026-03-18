export interface SpotifyProfile {
  id: string;
  displayName: string;
  imageUrl: string;
  followers: number;
  totalPlaylists: number;
  topGenres: string[];
  topArtists: { name: string; imageUrl: string; genres: string[] }[];
  topTracks: { name: string; artist: string; albumArt: string }[];
  recentlyPlayedCount: number;
}

export interface BuildingParams {
  height: number;
  width: number;
  depth: number;
  primaryColor: string;
  secondaryColor: string;
  windowGlow: number;
  style: 'modern' | 'classic' | 'neon' | 'minimal';
  position: [number, number, number];
  profile: SpotifyProfile;
}
