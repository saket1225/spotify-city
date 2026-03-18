import { SpotifyProfile } from '@/types';

const SPOTIFY_API = 'https://api.spotify.com/v1';

async function spotifyFetch(endpoint: string, accessToken: string) {
  const res = await fetch(`${SPOTIFY_API}${endpoint}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`Spotify API error: ${res.status}`);
  return res.json();
}

export async function fetchTopArtists(accessToken: string) {
  const data = await spotifyFetch(
    '/me/top/artists?limit=20&time_range=medium_term',
    accessToken
  );
  return data.items.map((a: Record<string, unknown>) => ({
    name: a.name as string,
    imageUrl: ((a.images as { url: string }[])?.[0]?.url) ?? '',
    genres: (a.genres as string[]) ?? [],
  }));
}

export async function fetchTopTracks(accessToken: string) {
  const data = await spotifyFetch(
    '/me/top/tracks?limit=20&time_range=medium_term',
    accessToken
  );
  return data.items.map((t: Record<string, unknown>) => ({
    name: t.name as string,
    artist: ((t.artists as { name: string }[])?.[0]?.name) ?? '',
    albumArt:
      (((t.album as { images: { url: string }[] })?.images)?.[0]?.url) ?? '',
    durationMs: (t.duration_ms as number) ?? 0,
  }));
}

export async function fetchPlaylists(accessToken: string) {
  const data = await spotifyFetch('/me/playlists?limit=50', accessToken);
  return { total: data.total as number, items: data.items };
}

export async function fetchRecentlyPlayed(accessToken: string) {
  const data = await spotifyFetch(
    '/me/player/recently-played?limit=50',
    accessToken
  );
  const items = data.items as { played_at: string; track: { duration_ms: number } }[];
  const now = Date.now();

  // Count unique days with activity for streak
  const activeDays = new Set(
    items.map((item) => new Date(item.played_at).toDateString())
  );

  // Sum duration of recently played tracks
  const totalDurationMs = items.reduce(
    (sum, item) => sum + (item.track?.duration_ms ?? 0), 0
  );

  return {
    count: items.length,
    activeDays: activeDays.size,
    totalDurationMs,
  };
}

export async function fetchUserProfile(
  accessToken: string
): Promise<SpotifyProfile> {
  const [me, artists, tracks, playlists, recentData] = await Promise.all([
    spotifyFetch('/me', accessToken),
    fetchTopArtists(accessToken),
    fetchTopTracks(accessToken),
    fetchPlaylists(accessToken),
    fetchRecentlyPlayed(accessToken),
  ]);

  const allGenres = artists.flatMap(
    (a: { genres: string[] }) => a.genres ?? []
  );
  const genreCounts: Record<string, number> = {};
  for (const g of allGenres) {
    genreCounts[g] = (genreCounts[g] ?? 0) + 1;
  }
  const topGenres = Object.entries(genreCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([genre]) => genre);

  // Estimate listening time from recently played tracks
  const avgTrackDurationMs = tracks.length > 0
    ? tracks.reduce((sum: number, t: { durationMs: number }) => sum + t.durationMs, 0) / tracks.length
    : 210000; // 3.5 min default
  const avgTrackDuration = avgTrackDurationMs / 60000;

  // Estimate total hours: extrapolate from recent activity
  // 50 recently played tracks gives us a window; scale up
  const recentHours = recentData.totalDurationMs / 3600000;
  const estimatedListeningHours = Math.round(recentHours * 365); // rough yearly estimate

  // Estimate total playlist duration
  const playlistDuration = Math.round(playlists.total * avgTrackDuration * 15); // ~15 tracks per playlist avg

  return {
    id: me.id,
    displayName: me.display_name ?? me.id,
    imageUrl: me.images?.[0]?.url ?? '',
    estimatedListeningHours: Math.max(50, estimatedListeningHours),
    totalTracksPlayed: recentData.count,
    avgTrackDuration: Math.round(avgTrackDuration * 10) / 10,
    listeningStreak: recentData.activeDays,
    playlistDuration,
    totalPlaylists: playlists.total,
    topGenres,
    topArtists: artists.slice(0, 5),
    topTracks: tracks.slice(0, 5).map((t: { name: string; artist: string; albumArt: string }) => ({
      name: t.name,
      artist: t.artist,
      albumArt: t.albumArt,
    })),
  };
}
