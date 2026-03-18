import { SpotifyProfile, BuildingParams } from "@/types";

const GENRE_COLORS: Record<string, string> = {
  pop: "#FF6B9D",
  rock: "#C73E1D",
  "hip hop": "#FFD700",
  rap: "#FFD700",
  "r&b": "#9B59B6",
  jazz: "#2ECC71",
  classical: "#ECF0F1",
  electronic: "#00FFFF",
  edm: "#FF00FF",
  indie: "#E67E22",
  metal: "#555555",
  punk: "#FF4444",
  country: "#D4A574",
  latin: "#FF6347",
  soul: "#8B4513",
  folk: "#A0522D",
  blues: "#4169E1",
  reggae: "#00FF00",
  "k-pop": "#FF69B4",
  anime: "#FF1493",
  default: "#1DB954",
};

const GENRE_STYLES: Record<string, BuildingParams["style"]> = {
  electronic: "neon",
  edm: "neon",
  pop: "modern",
  "k-pop": "modern",
  classical: "classic",
  jazz: "classic",
  blues: "classic",
  indie: "minimal",
  folk: "minimal",
  metal: "classic",
};

function getGenreColor(genres: string[]): string {
  for (const genre of genres) {
    const lower = genre.toLowerCase();
    for (const [key, color] of Object.entries(GENRE_COLORS)) {
      if (lower.includes(key)) return color;
    }
  }
  return GENRE_COLORS.default;
}

function getGenreStyle(genres: string[]): BuildingParams["style"] {
  for (const genre of genres) {
    const lower = genre.toLowerCase();
    for (const [key, style] of Object.entries(GENRE_STYLES)) {
      if (lower.includes(key)) return style;
    }
  }
  return "modern";
}

export function generateBuildingParams(
  profile: SpotifyProfile,
  index: number = 0
): BuildingParams {
  // Height: log scale of followers (min 2, max 20)
  const height = Math.min(
    20,
    Math.max(2, Math.log10(Math.max(1, profile.followers)) * 4)
  );

  // Width: based on playlists (1 - 5)
  const width = Math.min(5, Math.max(1, Math.ceil(profile.totalPlaylists / 10)));

  // Depth similar to width
  const depth = Math.min(4, Math.max(1, Math.ceil(profile.totalPlaylists / 15)));

  // Color from top genre
  const color = getGenreColor(profile.topGenres);

  // Window glow from recently played (0 - 1)
  const windowGlow = Math.min(1, profile.recentlyPlayed / 30);

  // Style from genre
  const style = getGenreStyle(profile.topGenres);

  // Position in grid
  const gridSize = 8;
  const spacing = 7;
  const row = Math.floor(index / gridSize);
  const col = index % gridSize;
  const x = (col - gridSize / 2) * spacing;
  const z = (row - gridSize / 2) * spacing;

  return {
    height,
    width,
    depth,
    color,
    windowGlow,
    style,
    position: [x, 0, z],
    profile,
  };
}

// Generate demo buildings with fake profiles
export function generateDemoBuildings(): BuildingParams[] {
  const demoProfiles: SpotifyProfile[] = [
    {
      id: "demo1",
      displayName: "Luna Waves",
      imageUrl: "",
      followers: 125000,
      totalPlaylists: 34,
      topGenres: ["electronic", "house", "techno"],
      topArtists: [{ name: "Disclosure", imageUrl: "" }],
      topTracks: [{ name: "Latch", artist: "Disclosure", albumArt: "" }],
      recentlyPlayed: 28,
    },
    {
      id: "demo2",
      displayName: "RockStar42",
      imageUrl: "",
      followers: 850,
      totalPlaylists: 12,
      topGenres: ["rock", "alternative", "grunge"],
      topArtists: [{ name: "Foo Fighters", imageUrl: "" }],
      topTracks: [{ name: "Everlong", artist: "Foo Fighters", albumArt: "" }],
      recentlyPlayed: 15,
    },
    {
      id: "demo3",
      displayName: "JazzCat",
      imageUrl: "",
      followers: 3200,
      totalPlaylists: 45,
      topGenres: ["jazz", "soul", "blues"],
      topArtists: [{ name: "Miles Davis", imageUrl: "" }],
      topTracks: [
        { name: "So What", artist: "Miles Davis", albumArt: "" },
      ],
      recentlyPlayed: 8,
    },
    {
      id: "demo4",
      displayName: "PopPrincess",
      imageUrl: "",
      followers: 50000,
      totalPlaylists: 28,
      topGenres: ["pop", "dance pop", "synth pop"],
      topArtists: [{ name: "Dua Lipa", imageUrl: "" }],
      topTracks: [
        { name: "Levitating", artist: "Dua Lipa", albumArt: "" },
      ],
      recentlyPlayed: 35,
    },
    {
      id: "demo5",
      displayName: "HipHopHead",
      imageUrl: "",
      followers: 420,
      totalPlaylists: 8,
      topGenres: ["hip hop", "rap", "trap"],
      topArtists: [{ name: "Kendrick Lamar", imageUrl: "" }],
      topTracks: [
        { name: "HUMBLE.", artist: "Kendrick Lamar", albumArt: "" },
      ],
      recentlyPlayed: 22,
    },
    {
      id: "demo6",
      displayName: "ClassicalNerd",
      imageUrl: "",
      followers: 15000,
      totalPlaylists: 60,
      topGenres: ["classical", "orchestral", "piano"],
      topArtists: [{ name: "Ludovico Einaudi", imageUrl: "" }],
      topTracks: [
        { name: "Nuvole Bianche", artist: "Ludovico Einaudi", albumArt: "" },
      ],
      recentlyPlayed: 5,
    },
    {
      id: "demo7",
      displayName: "IndieSoul",
      imageUrl: "",
      followers: 200,
      totalPlaylists: 15,
      topGenres: ["indie", "folk", "singer-songwriter"],
      topArtists: [{ name: "Bon Iver", imageUrl: "" }],
      topTracks: [
        { name: "Skinny Love", artist: "Bon Iver", albumArt: "" },
      ],
      recentlyPlayed: 12,
    },
    {
      id: "demo8",
      displayName: "MetalHead666",
      imageUrl: "",
      followers: 6500,
      totalPlaylists: 20,
      topGenres: ["metal", "heavy metal", "thrash metal"],
      topArtists: [{ name: "Metallica", imageUrl: "" }],
      topTracks: [
        {
          name: "Master of Puppets",
          artist: "Metallica",
          albumArt: "",
        },
      ],
      recentlyPlayed: 18,
    },
    {
      id: "demo9",
      displayName: "LatinVibes",
      imageUrl: "",
      followers: 89000,
      totalPlaylists: 22,
      topGenres: ["latin", "reggaeton", "latin pop"],
      topArtists: [{ name: "Bad Bunny", imageUrl: "" }],
      topTracks: [
        { name: "Dakiti", artist: "Bad Bunny", albumArt: "" },
      ],
      recentlyPlayed: 30,
    },
    {
      id: "demo10",
      displayName: "KpopStan",
      imageUrl: "",
      followers: 250000,
      totalPlaylists: 40,
      topGenres: ["k-pop", "korean pop", "j-pop"],
      topArtists: [{ name: "BTS", imageUrl: "" }],
      topTracks: [{ name: "Dynamite", artist: "BTS", albumArt: "" }],
      recentlyPlayed: 42,
    },
    {
      id: "demo11",
      displayName: "CountryRoads",
      imageUrl: "",
      followers: 1800,
      totalPlaylists: 10,
      topGenres: ["country", "americana", "bluegrass"],
      topArtists: [{ name: "Chris Stapleton", imageUrl: "" }],
      topTracks: [
        {
          name: "Tennessee Whiskey",
          artist: "Chris Stapleton",
          albumArt: "",
        },
      ],
      recentlyPlayed: 9,
    },
    {
      id: "demo12",
      displayName: "NeonDreamer",
      imageUrl: "",
      followers: 32000,
      totalPlaylists: 55,
      topGenres: ["edm", "future bass", "dubstep"],
      topArtists: [{ name: "Flume", imageUrl: "" }],
      topTracks: [
        { name: "Never Be Like You", artist: "Flume", albumArt: "" },
      ],
      recentlyPlayed: 25,
    },
    {
      id: "demo13",
      displayName: "ReggaeKing",
      imageUrl: "",
      followers: 7700,
      totalPlaylists: 18,
      topGenres: ["reggae", "dancehall", "ska"],
      topArtists: [{ name: "Bob Marley", imageUrl: "" }],
      topTracks: [
        { name: "Three Little Birds", artist: "Bob Marley", albumArt: "" },
      ],
      recentlyPlayed: 14,
    },
    {
      id: "demo14",
      displayName: "PunkRocker",
      imageUrl: "",
      followers: 500,
      totalPlaylists: 6,
      topGenres: ["punk", "punk rock", "pop punk"],
      topArtists: [{ name: "Green Day", imageUrl: "" }],
      topTracks: [
        {
          name: "Basket Case",
          artist: "Green Day",
          albumArt: "",
        },
      ],
      recentlyPlayed: 20,
    },
    {
      id: "demo15",
      displayName: "RnBSmooth",
      imageUrl: "",
      followers: 18000,
      totalPlaylists: 30,
      topGenres: ["r&b", "neo soul", "contemporary r&b"],
      topArtists: [{ name: "SZA", imageUrl: "" }],
      topTracks: [{ name: "Kill Bill", artist: "SZA", albumArt: "" }],
      recentlyPlayed: 17,
    },
  ];

  return demoProfiles.map((profile, i) => generateBuildingParams(profile, i));
}
