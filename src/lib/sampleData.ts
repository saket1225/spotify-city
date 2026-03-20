import { SpotifyProfile } from '@/types';
import { generateBuildingParams } from './buildingGenerator';
import type { BuildingParams } from '@/types';

// Seeded PRNG (mulberry32)
function mulberry32(seed: number) {
  return () => {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function generateSampleProfiles(count: number): SpotifyProfile[] {
  const rand = mulberry32(42);

  const firstNames = [
    'Luna', 'Max', 'Nova', 'Kai', 'Zara', 'Leo', 'Ivy', 'Finn', 'Aria', 'Milo',
    'Sage', 'Rex', 'Sky', 'Ash', 'Ruby', 'Cole', 'Jade', 'Cruz', 'Faye', 'Jett',
    'Wren', 'Nico', 'Cleo', 'Axel', 'Iris', 'Rhys', 'Vera', 'Hugo', 'Nyx', 'Troy',
    'Eden', 'Blake', 'Dawn', 'Drew', 'Elle', 'Gray', 'Hope', 'Jude', 'Kit', 'Lake',
    'Mars', 'Neil', 'Opal', 'Pax', 'Quinn', 'Rain', 'Sol', 'Tate', 'Uma', 'Vale',
    'Zeke', 'Bree', 'Clay', 'Dex', 'Echo', 'Fox', 'Gem', 'Hart', 'Ion', 'Jazz',
  ];

  const suffixes = [
    'Beats', 'Waves', 'Sound', 'Vibe', 'Mix', 'Tune', 'Flow', 'Pulse', 'Drop', 'Bass',
    'Keys', 'Riff', 'Spin', 'Loop', 'Dub', 'Sync', 'Amp', 'Freq', 'Echo', 'Tone',
    'Rush', 'Haze', 'Drift', 'Glow', 'Flux', 'Core', 'Edge', 'Fade', 'Rise', 'Snap',
  ];

  // Genre pools with sub-genres and representative artists
  const genrePools: Record<string, { subGenres: string[]; artists: { name: string; genres: string[] }[] }> = {
    pop: {
      subGenres: ['pop', 'dance pop', 'synth pop', 'electropop', 'indie pop', 'art pop', 'dream pop', 'chamber pop'],
      artists: [
        { name: 'Dua Lipa', genres: ['pop', 'dance pop'] },
        { name: 'Charli XCX', genres: ['pop', 'electropop'] },
        { name: 'Olivia Rodrigo', genres: ['pop', 'pop rock'] },
        { name: 'Taylor Swift', genres: ['pop', 'country pop'] },
        { name: 'The Weeknd', genres: ['pop', 'r&b'] },
        { name: 'Billie Eilish', genres: ['pop', 'electropop'] },
        { name: 'Harry Styles', genres: ['pop', 'brit pop'] },
        { name: 'Ariana Grande', genres: ['pop', 'dance pop'] },
        { name: 'Lorde', genres: ['pop', 'art pop'] },
        { name: 'Troye Sivan', genres: ['pop', 'electropop'] },
      ],
    },
    rock: {
      subGenres: ['rock', 'alternative', 'indie rock', 'classic rock', 'post-rock', 'garage rock', 'psychedelic rock', 'prog rock'],
      artists: [
        { name: 'Foo Fighters', genres: ['rock', 'alternative rock'] },
        { name: 'Arctic Monkeys', genres: ['indie rock', 'alternative'] },
        { name: 'Radiohead', genres: ['alternative rock', 'art rock'] },
        { name: 'Tame Impala', genres: ['psychedelic rock', 'indie'] },
        { name: 'The Strokes', genres: ['indie rock', 'garage rock'] },
        { name: 'Queens of the Stone Age', genres: ['rock', 'stoner rock'] },
        { name: 'Muse', genres: ['alternative rock', 'prog rock'] },
        { name: 'The Black Keys', genres: ['rock', 'blues rock'] },
      ],
    },
    'hip-hop': {
      subGenres: ['hip hop', 'rap', 'trap', 'boom bap', 'conscious rap', 'drill', 'cloud rap', 'g-funk'],
      artists: [
        { name: 'Kendrick Lamar', genres: ['hip hop', 'rap'] },
        { name: 'J. Cole', genres: ['hip hop', 'conscious rap'] },
        { name: 'Tyler, The Creator', genres: ['hip hop', 'rap'] },
        { name: 'Travis Scott', genres: ['hip hop', 'trap'] },
        { name: 'Drake', genres: ['hip hop', 'pop rap'] },
        { name: 'JID', genres: ['hip hop', 'rap'] },
        { name: 'Baby Keem', genres: ['hip hop', 'rap'] },
        { name: '21 Savage', genres: ['hip hop', 'trap'] },
      ],
    },
    electronic: {
      subGenres: ['electronic', 'house', 'techno', 'ambient', 'edm', 'future bass', 'synthwave', 'downtempo'],
      artists: [
        { name: 'Disclosure', genres: ['electronic', 'house'] },
        { name: 'RÜFÜS DU SOL', genres: ['electronic', 'indie dance'] },
        { name: 'Bonobo', genres: ['electronic', 'downtempo'] },
        { name: 'Flume', genres: ['electronic', 'future bass'] },
        { name: 'ODESZA', genres: ['electronic', 'edm'] },
        { name: 'Four Tet', genres: ['electronic', 'ambient'] },
        { name: 'Aphex Twin', genres: ['electronic', 'idm'] },
        { name: 'Caribou', genres: ['electronic', 'psychedelic'] },
      ],
    },
    indie: {
      subGenres: ['indie', 'indie folk', 'indie pop', 'singer-songwriter', 'folk', 'lo-fi', 'bedroom pop', 'emo'],
      artists: [
        { name: 'Bon Iver', genres: ['indie folk', 'folk'] },
        { name: 'Phoebe Bridgers', genres: ['indie', 'folk'] },
        { name: 'Fleet Foxes', genres: ['indie folk', 'folk'] },
        { name: 'Mac DeMarco', genres: ['indie', 'lo-fi'] },
        { name: 'Mitski', genres: ['indie', 'art pop'] },
        { name: 'Sufjan Stevens', genres: ['indie folk', 'folk'] },
        { name: 'Japanese Breakfast', genres: ['indie pop', 'dream pop'] },
        { name: 'Big Thief', genres: ['indie folk', 'indie rock'] },
      ],
    },
    classical: {
      subGenres: ['classical', 'orchestral', 'piano', 'chamber music', 'opera', 'baroque', 'romantic', 'contemporary classical'],
      artists: [
        { name: 'Ludovico Einaudi', genres: ['classical', 'piano'] },
        { name: 'Yo-Yo Ma', genres: ['classical', 'cello'] },
        { name: 'Hilary Hahn', genres: ['classical', 'violin'] },
        { name: 'Max Richter', genres: ['classical', 'contemporary'] },
        { name: 'Nils Frahm', genres: ['classical', 'ambient'] },
        { name: 'Ólafur Arnalds', genres: ['classical', 'ambient'] },
      ],
    },
    jazz: {
      subGenres: ['jazz', 'soul', 'blues', 'bebop', 'fusion', 'smooth jazz', 'acid jazz', 'nu jazz'],
      artists: [
        { name: 'Miles Davis', genres: ['jazz', 'bebop'] },
        { name: 'Kamasi Washington', genres: ['jazz', 'spiritual jazz'] },
        { name: 'Robert Glasper', genres: ['jazz', 'hip hop'] },
        { name: 'Snarky Puppy', genres: ['jazz', 'fusion'] },
        { name: 'Nubya Garcia', genres: ['jazz', 'nu jazz'] },
        { name: 'Esperanza Spalding', genres: ['jazz', 'soul'] },
      ],
    },
    latin: {
      subGenres: ['latin', 'reggaeton', 'latin pop', 'salsa', 'bachata', 'cumbia', 'bossa nova', 'latin trap'],
      artists: [
        { name: 'Bad Bunny', genres: ['reggaeton', 'latin'] },
        { name: 'Rosalía', genres: ['latin pop', 'flamenco'] },
        { name: 'Karol G', genres: ['reggaeton', 'latin'] },
        { name: 'Peso Pluma', genres: ['latin', 'corridos'] },
        { name: 'Rauw Alejandro', genres: ['reggaeton', 'latin pop'] },
        { name: 'Feid', genres: ['reggaeton', 'latin'] },
      ],
    },
    metal: {
      subGenres: ['metal', 'heavy metal', 'thrash metal', 'death metal', 'progressive metal', 'doom metal', 'black metal', 'metalcore'],
      artists: [
        { name: 'Metallica', genres: ['metal', 'thrash metal'] },
        { name: 'Gojira', genres: ['metal', 'progressive metal'] },
        { name: 'Tool', genres: ['metal', 'progressive metal'] },
        { name: 'Mastodon', genres: ['metal', 'progressive metal'] },
        { name: 'Opeth', genres: ['metal', 'progressive metal'] },
        { name: 'Spiritbox', genres: ['metalcore', 'metal'] },
      ],
    },
    other: {
      subGenres: ['r&b', 'country', 'afrobeats', 'reggae', 'punk', 'funk', 'k-pop', 'world music'],
      artists: [
        { name: 'SZA', genres: ['r&b', 'neo soul'] },
        { name: 'Burna Boy', genres: ['afrobeats', 'pop'] },
        { name: 'BTS', genres: ['k-pop', 'pop'] },
        { name: 'Chris Stapleton', genres: ['country', 'americana'] },
        { name: 'Vulfpeck', genres: ['funk', 'indie'] },
        { name: 'Thundercat', genres: ['funk', 'jazz'] },
        { name: 'Bob Marley', genres: ['reggae'] },
        { name: 'Green Day', genres: ['punk rock', 'pop punk'] },
      ],
    },
  };

  // Genre distribution weights (cumulative)
  const genreDistribution: [string, number][] = [
    ['pop', 0.25],
    ['rock', 0.40],
    ['hip-hop', 0.55],
    ['electronic', 0.65],
    ['indie', 0.75],
    ['classical', 0.80],
    ['jazz', 0.85],
    ['latin', 0.90],
    ['metal', 0.95],
    ['other', 1.0],
  ];

  function pickPrimaryGenre(): string {
    const r = rand();
    for (const [genre, threshold] of genreDistribution) {
      if (r < threshold) return genre;
    }
    return 'other';
  }

  // Power-law listening hours: most 100-1000, some 1000-10000, few 10k+
  function genListeningHours(): number {
    const r = rand();
    if (r < 0.65) return Math.floor(100 + rand() * 900);
    if (r < 0.90) return Math.floor(1000 + rand() * 4000);
    if (r < 0.97) return Math.floor(5000 + rand() * 5000);
    return Math.floor(10000 + rand() * 10000);
  }

  function genDisplayName(i: number): string {
    const first = firstNames[Math.floor(rand() * firstNames.length)];
    const r = rand();
    if (r < 0.4) {
      const suffix = suffixes[Math.floor(rand() * suffixes.length)];
      return `${first}${suffix}`;
    } else if (r < 0.7) {
      const num = Math.floor(rand() * 999) + 1;
      return `${first}${num}`;
    } else if (r < 0.85) {
      const suffix = suffixes[Math.floor(rand() * suffixes.length)];
      const num = Math.floor(rand() * 99) + 1;
      return `${first}${suffix}${num}`;
    } else {
      const second = firstNames[Math.floor(rand() * firstNames.length)];
      return `${first}_${second}`;
    }
  }

  const profiles: SpotifyProfile[] = [];

  for (let i = 0; i < count; i++) {
    const primaryGenre = pickPrimaryGenre();
    const pool = genrePools[primaryGenre];
    const numGenres = 1 + Math.floor(rand() * 7); // 1-8
    const genres: string[] = [];
    const used = new Set<number>();
    for (let g = 0; g < numGenres && g < pool.subGenres.length; g++) {
      let idx: number;
      do { idx = Math.floor(rand() * pool.subGenres.length); } while (used.has(idx));
      used.add(idx);
      genres.push(pool.subGenres[idx]);
    }

    const hours = genListeningHours();
    const avgDuration = 2.5 + rand() * 5; // 2.5-7.5 min
    const totalTracks = Math.floor(hours * 60 / avgDuration * (0.3 + rand() * 0.7));
    const totalPlaylists = 1 + Math.floor(rand() * rand() * 500); // skewed low
    const streak = Math.floor(rand() * rand() * 365);
    const playlistDuration = Math.floor(totalPlaylists * (200 + rand() * 800));
    const accountAge = Math.floor(1 + rand() * 15); // years

    // Pick 3 artists from pool
    const artistIndices = new Set<number>();
    while (artistIndices.size < Math.min(3, pool.artists.length)) {
      artistIndices.add(Math.floor(rand() * pool.artists.length));
    }
    const topArtists = [...artistIndices].map(idx => ({
      name: pool.artists[idx].name,
      imageUrl: '',
      genres: pool.artists[idx].genres,
    }));

    profiles.push({
      id: `sp${i + 1}`,
      displayName: genDisplayName(i),
      imageUrl: '',
      estimatedListeningHours: hours,
      totalTracksPlayed: totalTracks,
      avgTrackDuration: Math.round(avgDuration * 10) / 10,
      listeningStreak: streak,
      playlistDuration,
      totalPlaylists,
      topGenres: genres,
      topArtists,
      topTracks: [],
      accountAge,
    });
  }

  return profiles;
}

const sampleProfiles: SpotifyProfile[] = generateSampleProfiles(1200);

export function getSampleBuildings(): BuildingParams[] {
  return sampleProfiles.map((profile, i) => generateBuildingParams(profile, i));
}

export { sampleProfiles };
