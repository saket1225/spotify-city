export interface SpotifyProfile {
  id: string;
  displayName: string;
  imageUrl: string;
  estimatedListeningHours: number;
  totalTracksPlayed: number;
  avgTrackDuration: number; // minutes
  listeningStreak: number; // days active recently
  playlistDuration: number; // total mins across playlists
  totalPlaylists: number;
  topGenres: string[];
  topArtists: { name: string; imageUrl: string; genres: string[] }[];
  topTracks: { name: string; artist: string; albumArt: string }[];
  accountAge?: number; // years
}

export type BuildingStyle = 'skyscraper' | 'fortress' | 'neon-tower' | 'penthouse' | 'brownstone' | 'cathedral' | 'modern';

export interface BuildingParams {
  height: number;
  width: number;
  depth: number;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  windowGlow: number;
  style: BuildingStyle;
  position: [number, number, number];
  profile: SpotifyProfile;
  isCurrentUser?: boolean;
  dimmed?: boolean;
  highlighted?: boolean;
  variant?: number;
}
