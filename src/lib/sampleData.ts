import { SpotifyProfile } from '@/types';
import { generateBuildingParams } from './buildingGenerator';
import type { BuildingParams } from '@/types';

const sampleProfiles: SpotifyProfile[] = [
  {
    id: 'sp1', displayName: 'Luna Waves', imageUrl: '', followers: 125000, totalPlaylists: 34,
    topGenres: ['electronic', 'house', 'techno'],
    topArtists: [
      { name: 'Disclosure', imageUrl: '', genres: ['electronic', 'house'] },
      { name: 'RÜFÜS DU SOL', imageUrl: '', genres: ['electronic', 'indie dance'] },
      { name: 'Bonobo', imageUrl: '', genres: ['electronic', 'downtempo'] },
    ],
    topTracks: [
      { name: 'Latch', artist: 'Disclosure', albumArt: '' },
      { name: 'Innerbloom', artist: 'RÜFÜS DU SOL', albumArt: '' },
      { name: 'Kerala', artist: 'Bonobo', albumArt: '' },
    ],
    recentlyPlayedCount: 28,
  },
  {
    id: 'sp2', displayName: 'RockStar42', imageUrl: '', followers: 850, totalPlaylists: 12,
    topGenres: ['rock', 'alternative', 'grunge'],
    topArtists: [
      { name: 'Foo Fighters', imageUrl: '', genres: ['rock', 'alternative rock'] },
      { name: 'Queens of the Stone Age', imageUrl: '', genres: ['rock', 'stoner rock'] },
      { name: 'Arctic Monkeys', imageUrl: '', genres: ['indie rock', 'alternative'] },
    ],
    topTracks: [
      { name: 'Everlong', artist: 'Foo Fighters', albumArt: '' },
      { name: 'No One Knows', artist: 'Queens of the Stone Age', albumArt: '' },
      { name: 'Do I Wanna Know?', artist: 'Arctic Monkeys', albumArt: '' },
    ],
    recentlyPlayedCount: 15,
  },
  {
    id: 'sp3', displayName: 'JazzCat', imageUrl: '', followers: 3200, totalPlaylists: 45,
    topGenres: ['jazz', 'soul', 'blues'],
    topArtists: [
      { name: 'Miles Davis', imageUrl: '', genres: ['jazz', 'bebop'] },
      { name: 'John Coltrane', imageUrl: '', genres: ['jazz', 'hard bop'] },
      { name: 'Kamasi Washington', imageUrl: '', genres: ['jazz', 'spiritual jazz'] },
    ],
    topTracks: [
      { name: 'So What', artist: 'Miles Davis', albumArt: '' },
      { name: 'A Love Supreme', artist: 'John Coltrane', albumArt: '' },
      { name: 'Truth', artist: 'Kamasi Washington', albumArt: '' },
    ],
    recentlyPlayedCount: 8,
  },
  {
    id: 'sp4', displayName: 'PopPrincess', imageUrl: '', followers: 5000000, totalPlaylists: 28,
    topGenres: ['pop', 'dance pop', 'synth pop'],
    topArtists: [
      { name: 'Dua Lipa', imageUrl: '', genres: ['pop', 'dance pop'] },
      { name: 'Charli XCX', imageUrl: '', genres: ['pop', 'electropop'] },
      { name: 'Olivia Rodrigo', imageUrl: '', genres: ['pop', 'pop rock'] },
    ],
    topTracks: [
      { name: 'Levitating', artist: 'Dua Lipa', albumArt: '' },
      { name: '360', artist: 'Charli XCX', albumArt: '' },
      { name: 'good 4 u', artist: 'Olivia Rodrigo', albumArt: '' },
    ],
    recentlyPlayedCount: 35,
  },
  {
    id: 'sp5', displayName: 'HipHopHead', imageUrl: '', followers: 420, totalPlaylists: 8,
    topGenres: ['hip hop', 'rap', 'trap'],
    topArtists: [
      { name: 'Kendrick Lamar', imageUrl: '', genres: ['hip hop', 'rap'] },
      { name: 'J. Cole', imageUrl: '', genres: ['hip hop', 'rap'] },
      { name: 'Tyler, The Creator', imageUrl: '', genres: ['hip hop', 'rap'] },
    ],
    topTracks: [
      { name: 'HUMBLE.', artist: 'Kendrick Lamar', albumArt: '' },
      { name: 'No Role Modelz', artist: 'J. Cole', albumArt: '' },
      { name: 'See You Again', artist: 'Tyler, The Creator', albumArt: '' },
    ],
    recentlyPlayedCount: 22,
  },
  {
    id: 'sp6', displayName: 'ClassicalNerd', imageUrl: '', followers: 15000, totalPlaylists: 60,
    topGenres: ['classical', 'orchestral', 'piano'],
    topArtists: [
      { name: 'Ludovico Einaudi', imageUrl: '', genres: ['classical', 'piano'] },
      { name: 'Yo-Yo Ma', imageUrl: '', genres: ['classical', 'cello'] },
      { name: 'Hilary Hahn', imageUrl: '', genres: ['classical', 'violin'] },
    ],
    topTracks: [
      { name: 'Nuvole Bianche', artist: 'Ludovico Einaudi', albumArt: '' },
      { name: 'Cello Suite No. 1', artist: 'Yo-Yo Ma', albumArt: '' },
      { name: 'Partita No. 2', artist: 'Hilary Hahn', albumArt: '' },
    ],
    recentlyPlayedCount: 5,
  },
  {
    id: 'sp7', displayName: 'IndieSoul', imageUrl: '', followers: 200, totalPlaylists: 15,
    topGenres: ['indie', 'folk', 'singer-songwriter'],
    topArtists: [
      { name: 'Bon Iver', imageUrl: '', genres: ['indie folk', 'folk'] },
      { name: 'Phoebe Bridgers', imageUrl: '', genres: ['indie', 'folk'] },
      { name: 'Fleet Foxes', imageUrl: '', genres: ['indie folk', 'folk'] },
    ],
    topTracks: [
      { name: 'Skinny Love', artist: 'Bon Iver', albumArt: '' },
      { name: 'Motion Sickness', artist: 'Phoebe Bridgers', albumArt: '' },
      { name: 'Mykonos', artist: 'Fleet Foxes', albumArt: '' },
    ],
    recentlyPlayedCount: 12,
  },
  {
    id: 'sp8', displayName: 'MetalHead666', imageUrl: '', followers: 6500, totalPlaylists: 20,
    topGenres: ['metal', 'heavy metal', 'thrash metal'],
    topArtists: [
      { name: 'Metallica', imageUrl: '', genres: ['metal', 'thrash metal'] },
      { name: 'Gojira', imageUrl: '', genres: ['metal', 'progressive metal'] },
      { name: 'Tool', imageUrl: '', genres: ['metal', 'progressive metal'] },
    ],
    topTracks: [
      { name: 'Master of Puppets', artist: 'Metallica', albumArt: '' },
      { name: 'Silvera', artist: 'Gojira', albumArt: '' },
      { name: 'Schism', artist: 'Tool', albumArt: '' },
    ],
    recentlyPlayedCount: 18,
  },
  {
    id: 'sp9', displayName: 'LatinVibes', imageUrl: '', followers: 89000, totalPlaylists: 22,
    topGenres: ['latin', 'reggaeton', 'latin pop'],
    topArtists: [
      { name: 'Bad Bunny', imageUrl: '', genres: ['reggaeton', 'latin'] },
      { name: 'Rosalía', imageUrl: '', genres: ['latin pop', 'flamenco'] },
      { name: 'Karol G', imageUrl: '', genres: ['reggaeton', 'latin'] },
    ],
    topTracks: [
      { name: 'Dakiti', artist: 'Bad Bunny', albumArt: '' },
      { name: 'MALAMENTE', artist: 'Rosalía', albumArt: '' },
      { name: 'BICHOTA', artist: 'Karol G', albumArt: '' },
    ],
    recentlyPlayedCount: 30,
  },
  {
    id: 'sp10', displayName: 'KpopStan', imageUrl: '', followers: 250000, totalPlaylists: 40,
    topGenres: ['k-pop', 'korean pop', 'j-pop'],
    topArtists: [
      { name: 'BTS', imageUrl: '', genres: ['k-pop', 'korean pop'] },
      { name: 'BLACKPINK', imageUrl: '', genres: ['k-pop', 'korean pop'] },
      { name: 'NewJeans', imageUrl: '', genres: ['k-pop', 'korean pop'] },
    ],
    topTracks: [
      { name: 'Dynamite', artist: 'BTS', albumArt: '' },
      { name: 'Pink Venom', artist: 'BLACKPINK', albumArt: '' },
      { name: 'Ditto', artist: 'NewJeans', albumArt: '' },
    ],
    recentlyPlayedCount: 42,
  },
  {
    id: 'sp11', displayName: 'CountryRoads', imageUrl: '', followers: 1800, totalPlaylists: 10,
    topGenres: ['country', 'americana', 'bluegrass'],
    topArtists: [
      { name: 'Chris Stapleton', imageUrl: '', genres: ['country', 'americana'] },
      { name: 'Zach Bryan', imageUrl: '', genres: ['country', 'folk'] },
      { name: 'Tyler Childers', imageUrl: '', genres: ['country', 'bluegrass'] },
    ],
    topTracks: [
      { name: 'Tennessee Whiskey', artist: 'Chris Stapleton', albumArt: '' },
      { name: 'Something in the Orange', artist: 'Zach Bryan', albumArt: '' },
      { name: 'Feathered Indians', artist: 'Tyler Childers', albumArt: '' },
    ],
    recentlyPlayedCount: 9,
  },
  {
    id: 'sp12', displayName: 'NeonDreamer', imageUrl: '', followers: 32000, totalPlaylists: 55,
    topGenres: ['edm', 'future bass', 'dubstep'],
    topArtists: [
      { name: 'Flume', imageUrl: '', genres: ['edm', 'future bass'] },
      { name: 'ODESZA', imageUrl: '', genres: ['edm', 'electronic'] },
      { name: 'Porter Robinson', imageUrl: '', genres: ['edm', 'electropop'] },
    ],
    topTracks: [
      { name: 'Never Be Like You', artist: 'Flume', albumArt: '' },
      { name: 'A Moment Apart', artist: 'ODESZA', albumArt: '' },
      { name: 'Shelter', artist: 'Porter Robinson', albumArt: '' },
    ],
    recentlyPlayedCount: 25,
  },
  {
    id: 'sp13', displayName: 'ReggaeKing', imageUrl: '', followers: 7700, totalPlaylists: 18,
    topGenres: ['reggae', 'dancehall', 'ska'],
    topArtists: [
      { name: 'Bob Marley', imageUrl: '', genres: ['reggae'] },
      { name: 'Chronixx', imageUrl: '', genres: ['reggae', 'dancehall'] },
      { name: 'Protoje', imageUrl: '', genres: ['reggae'] },
    ],
    topTracks: [
      { name: 'Three Little Birds', artist: 'Bob Marley', albumArt: '' },
      { name: 'Here Comes Trouble', artist: 'Chronixx', albumArt: '' },
      { name: 'Blood Money', artist: 'Protoje', albumArt: '' },
    ],
    recentlyPlayedCount: 14,
  },
  {
    id: 'sp14', displayName: 'PunkRocker', imageUrl: '', followers: 500, totalPlaylists: 6,
    topGenres: ['punk', 'punk rock', 'pop punk'],
    topArtists: [
      { name: 'Green Day', imageUrl: '', genres: ['punk rock', 'pop punk'] },
      { name: 'IDLES', imageUrl: '', genres: ['punk', 'post-punk'] },
      { name: 'Turnstile', imageUrl: '', genres: ['punk', 'hardcore'] },
    ],
    topTracks: [
      { name: 'Basket Case', artist: 'Green Day', albumArt: '' },
      { name: 'DANNY NEDELKO', artist: 'IDLES', albumArt: '' },
      { name: 'MYSTERY', artist: 'Turnstile', albumArt: '' },
    ],
    recentlyPlayedCount: 20,
  },
  {
    id: 'sp15', displayName: 'RnBSmooth', imageUrl: '', followers: 18000, totalPlaylists: 30,
    topGenres: ['r&b', 'neo soul', 'contemporary r&b'],
    topArtists: [
      { name: 'SZA', imageUrl: '', genres: ['r&b', 'neo soul'] },
      { name: 'Frank Ocean', imageUrl: '', genres: ['r&b', 'alternative r&b'] },
      { name: 'Daniel Caesar', imageUrl: '', genres: ['r&b', 'soul'] },
    ],
    topTracks: [
      { name: 'Kill Bill', artist: 'SZA', albumArt: '' },
      { name: 'Nights', artist: 'Frank Ocean', albumArt: '' },
      { name: 'Best Part', artist: 'Daniel Caesar', albumArt: '' },
    ],
    recentlyPlayedCount: 17,
  },
  {
    id: 'sp16', displayName: 'LoFiStudy', imageUrl: '', followers: 50, totalPlaylists: 3,
    topGenres: ['electronic', 'ambient', 'chillhop'],
    topArtists: [
      { name: 'Nujabes', imageUrl: '', genres: ['electronic', 'jazz hip hop'] },
      { name: 'Tycho', imageUrl: '', genres: ['electronic', 'ambient'] },
      { name: 'Tomppabeats', imageUrl: '', genres: ['electronic', 'lo-fi'] },
    ],
    topTracks: [
      { name: 'Feather', artist: 'Nujabes', albumArt: '' },
      { name: 'Awake', artist: 'Tycho', albumArt: '' },
      { name: 'Monday Loop', artist: 'Tomppabeats', albumArt: '' },
    ],
    recentlyPlayedCount: 40,
  },
  {
    id: 'sp17', displayName: 'FunkMaster', imageUrl: '', followers: 45000, totalPlaylists: 200,
    topGenres: ['soul', 'funk', 'disco'],
    topArtists: [
      { name: 'Vulfpeck', imageUrl: '', genres: ['funk', 'indie'] },
      { name: 'Thundercat', imageUrl: '', genres: ['funk', 'jazz'] },
      { name: 'Anderson .Paak', imageUrl: '', genres: ['soul', 'r&b'] },
    ],
    topTracks: [
      { name: 'Dean Town', artist: 'Vulfpeck', albumArt: '' },
      { name: 'Them Changes', artist: 'Thundercat', albumArt: '' },
      { name: 'Come Down', artist: 'Anderson .Paak', albumArt: '' },
    ],
    recentlyPlayedCount: 24,
  },
  {
    id: 'sp18', displayName: 'SynthWaver', imageUrl: '', followers: 12000, totalPlaylists: 25,
    topGenres: ['electronic', 'synthwave', 'retrowave'],
    topArtists: [
      { name: 'The Midnight', imageUrl: '', genres: ['synthwave', 'electronic'] },
      { name: 'Kavinsky', imageUrl: '', genres: ['synthwave', 'electronic'] },
      { name: 'Com Truise', imageUrl: '', genres: ['synthwave', 'electronic'] },
    ],
    topTracks: [
      { name: 'Los Angeles', artist: 'The Midnight', albumArt: '' },
      { name: 'Nightcall', artist: 'Kavinsky', albumArt: '' },
      { name: 'Memory', artist: 'Com Truise', albumArt: '' },
    ],
    recentlyPlayedCount: 19,
  },
  {
    id: 'sp19', displayName: 'BluesRunner', imageUrl: '', followers: 2400, totalPlaylists: 14,
    topGenres: ['blues', 'blues rock', 'delta blues'],
    topArtists: [
      { name: 'Gary Clark Jr.', imageUrl: '', genres: ['blues', 'blues rock'] },
      { name: 'Joe Bonamassa', imageUrl: '', genres: ['blues rock', 'blues'] },
      { name: 'Fantastic Negrito', imageUrl: '', genres: ['blues', 'soul'] },
    ],
    topTracks: [
      { name: 'Bright Lights', artist: 'Gary Clark Jr.', albumArt: '' },
      { name: 'Mountain Time', artist: 'Joe Bonamassa', albumArt: '' },
      { name: 'The Duffler', artist: 'Fantastic Negrito', albumArt: '' },
    ],
    recentlyPlayedCount: 11,
  },
  {
    id: 'sp20', displayName: 'AfroBeat77', imageUrl: '', followers: 780000, totalPlaylists: 35,
    topGenres: ['pop', 'afrobeats', 'dancehall'],
    topArtists: [
      { name: 'Burna Boy', imageUrl: '', genres: ['afrobeats', 'pop'] },
      { name: 'Wizkid', imageUrl: '', genres: ['afrobeats', 'pop'] },
      { name: 'Tems', imageUrl: '', genres: ['afrobeats', 'r&b'] },
    ],
    topTracks: [
      { name: 'Last Last', artist: 'Burna Boy', albumArt: '' },
      { name: 'Essence', artist: 'Wizkid', albumArt: '' },
      { name: 'Free Mind', artist: 'Tems', albumArt: '' },
    ],
    recentlyPlayedCount: 33,
  },
];

export function getSampleBuildings(): BuildingParams[] {
  return sampleProfiles.map((profile, i) => generateBuildingParams(profile, i));
}

export { sampleProfiles };
