export interface SpotifyProfile {
  id: string;
  displayName: string;
  imageUrl: string;
  followers: number;
  totalPlaylists: number;
  topGenres: string[];
  topArtists: { name: string; imageUrl: string }[];
  topTracks: { name: string; artist: string; albumArt: string }[];
  recentlyPlayed: number;
  accountCreated?: string;
}

export interface BuildingParams {
  height: number;
  width: number;
  depth: number;
  color: string;
  windowGlow: number;
  style: "modern" | "classic" | "neon" | "minimal";
  position: [number, number, number];
  profile: SpotifyProfile;
}
