import { SpotifyProfile } from "@/types";

const SPOTIFY_API = "https://api.spotify.com/v1";

async function spotifyFetch(endpoint: string, accessToken: string) {
  const res = await fetch(`${SPOTIFY_API}${endpoint}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`Spotify API error: ${res.status}`);
  return res.json();
}

export async function fetchTopArtists(accessToken: string) {
  const data = await spotifyFetch(
    "/me/top/artists?limit=20&time_range=medium_term",
    accessToken
  );
  return data.items.map((a: Record<string, unknown>) => ({
    name: a.name as string,
    imageUrl: ((a.images as { url: string }[])?.[0]?.url) ?? "",
    genres: a.genres as string[],
  }));
}

export async function fetchTopTracks(accessToken: string) {
  const data = await spotifyFetch(
    "/me/top/tracks?limit=20&time_range=medium_term",
    accessToken
  );
  return data.items.map((t: Record<string, unknown>) => ({
    name: t.name as string,
    artist: ((t.artists as { name: string }[])?.[0]?.name) ?? "",
    albumArt:
      (((t.album as { images: { url: string }[] })?.images)?.[0]?.url) ?? "",
  }));
}

export async function fetchPlaylists(accessToken: string) {
  const data = await spotifyFetch("/me/playlists?limit=50", accessToken);
  return { total: data.total as number };
}

export async function fetchRecentlyPlayed(accessToken: string) {
  const data = await spotifyFetch(
    "/me/player/recently-played?limit=50",
    accessToken
  );
  const now = Date.now();
  const dayAgo = now - 24 * 60 * 60 * 1000;
  const recentCount = data.items.filter(
    (item: { played_at: string }) =>
      new Date(item.played_at).getTime() > dayAgo
  ).length;
  return recentCount;
}

export async function fetchUserProfile(
  accessToken: string
): Promise<SpotifyProfile> {
  const [me, artists, tracks, playlists, recentCount] = await Promise.all([
    spotifyFetch("/me", accessToken),
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

  return {
    id: me.id,
    displayName: me.display_name ?? me.id,
    imageUrl: me.images?.[0]?.url ?? "",
    followers: me.followers?.total ?? 0,
    totalPlaylists: playlists.total,
    topGenres,
    topArtists: artists.slice(0, 5),
    topTracks: tracks.slice(0, 5),
    recentlyPlayed: recentCount,
    accountCreated: undefined,
  };
}
