import { SpotifyProfile } from '@/types';
import { generateBuildingParams } from './buildingGenerator';
import type { BuildingParams } from '@/types';

const sampleProfiles: SpotifyProfile[] = [
  {
    id: 'sp1', displayName: 'Luna Waves', imageUrl: '',
    estimatedListeningHours: 8200, totalTracksPlayed: 4500, avgTrackDuration: 4.2,
    listeningStreak: 14, playlistDuration: 12000, totalPlaylists: 34,
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
  },
  {
    id: 'sp2', displayName: 'RockStar42', imageUrl: '',
    estimatedListeningHours: 320, totalTracksPlayed: 800, avgTrackDuration: 4.8,
    listeningStreak: 5, playlistDuration: 1800, totalPlaylists: 12,
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
  },
  {
    id: 'sp3', displayName: 'JazzCat', imageUrl: '',
    estimatedListeningHours: 5600, totalTracksPlayed: 3200, avgTrackDuration: 6.5,
    listeningStreak: 10, playlistDuration: 18000, totalPlaylists: 45,
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
  },
  {
    id: 'sp4', displayName: 'PopPrincess', imageUrl: '',
    estimatedListeningHours: 15000, totalTracksPlayed: 9500, avgTrackDuration: 3.2,
    listeningStreak: 14, playlistDuration: 8500, totalPlaylists: 28,
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
  },
  {
    id: 'sp5', displayName: 'HipHopHead', imageUrl: '',
    estimatedListeningHours: 2800, totalTracksPlayed: 2100, avgTrackDuration: 3.8,
    listeningStreak: 12, playlistDuration: 3200, totalPlaylists: 8,
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
  },
  {
    id: 'sp6', displayName: 'ClassicalNerd', imageUrl: '',
    estimatedListeningHours: 9200, totalTracksPlayed: 2800, avgTrackDuration: 12.5,
    listeningStreak: 7, playlistDuration: 24000, totalPlaylists: 60,
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
  },
  {
    id: 'sp7', displayName: 'IndieSoul', imageUrl: '',
    estimatedListeningHours: 120, totalTracksPlayed: 350, avgTrackDuration: 4.1,
    listeningStreak: 3, playlistDuration: 2200, totalPlaylists: 15,
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
  },
  {
    id: 'sp8', displayName: 'MetalHead666', imageUrl: '',
    estimatedListeningHours: 4100, totalTracksPlayed: 2600, avgTrackDuration: 5.8,
    listeningStreak: 9, playlistDuration: 6000, totalPlaylists: 20,
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
  },
  {
    id: 'sp9', displayName: 'LatinVibes', imageUrl: '',
    estimatedListeningHours: 6800, totalTracksPlayed: 4200, avgTrackDuration: 3.5,
    listeningStreak: 13, playlistDuration: 7500, totalPlaylists: 22,
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
  },
  {
    id: 'sp10', displayName: 'KpopStan', imageUrl: '',
    estimatedListeningHours: 11500, totalTracksPlayed: 7800, avgTrackDuration: 3.4,
    listeningStreak: 14, playlistDuration: 9200, totalPlaylists: 40,
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
  },
  {
    id: 'sp11', displayName: 'CountryRoads', imageUrl: '',
    estimatedListeningHours: 450, totalTracksPlayed: 600, avgTrackDuration: 3.9,
    listeningStreak: 4, playlistDuration: 2400, totalPlaylists: 10,
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
  },
  {
    id: 'sp12', displayName: 'NeonDreamer', imageUrl: '',
    estimatedListeningHours: 7400, totalTracksPlayed: 5100, avgTrackDuration: 4.6,
    listeningStreak: 11, playlistDuration: 15000, totalPlaylists: 55,
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
  },
  {
    id: 'sp13', displayName: 'ReggaeKing', imageUrl: '',
    estimatedListeningHours: 1800, totalTracksPlayed: 1200, avgTrackDuration: 4.0,
    listeningStreak: 6, playlistDuration: 4800, totalPlaylists: 18,
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
  },
  {
    id: 'sp14', displayName: 'PunkRocker', imageUrl: '',
    estimatedListeningHours: 180, totalTracksPlayed: 500, avgTrackDuration: 2.8,
    listeningStreak: 8, playlistDuration: 1200, totalPlaylists: 6,
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
  },
  {
    id: 'sp15', displayName: 'RnBSmooth', imageUrl: '',
    estimatedListeningHours: 3400, totalTracksPlayed: 2400, avgTrackDuration: 3.6,
    listeningStreak: 10, playlistDuration: 5400, totalPlaylists: 30,
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
  },
  {
    id: 'sp16', displayName: 'LoFiStudy', imageUrl: '',
    estimatedListeningHours: 50, totalTracksPlayed: 180, avgTrackDuration: 2.5,
    listeningStreak: 2, playlistDuration: 600, totalPlaylists: 3,
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
  },
  {
    id: 'sp17', displayName: 'FunkMaster', imageUrl: '',
    estimatedListeningHours: 4800, totalTracksPlayed: 3100, avgTrackDuration: 4.4,
    listeningStreak: 11, playlistDuration: 32000, totalPlaylists: 200,
    topGenres: ['soul', 'funk', 'disco', 'r&b', 'jazz'],
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
  },
  {
    id: 'sp18', displayName: 'SynthWaver', imageUrl: '',
    estimatedListeningHours: 2200, totalTracksPlayed: 1600, avgTrackDuration: 5.1,
    listeningStreak: 8, playlistDuration: 5800, totalPlaylists: 25,
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
  },
  {
    id: 'sp19', displayName: 'BluesRunner', imageUrl: '',
    estimatedListeningHours: 680, totalTracksPlayed: 900, avgTrackDuration: 5.2,
    listeningStreak: 5, playlistDuration: 3200, totalPlaylists: 14,
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
  },
  {
    id: 'sp20', displayName: 'AfroBeat77', imageUrl: '',
    estimatedListeningHours: 10200, totalTracksPlayed: 6800, avgTrackDuration: 3.8,
    listeningStreak: 14, playlistDuration: 9800, totalPlaylists: 35,
    topGenres: ['pop', 'afrobeats', 'dancehall', 'r&b'],
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
  },
];

export function getSampleBuildings(): BuildingParams[] {
  return sampleProfiles.map((profile, i) => generateBuildingParams(profile, i));
}

export { sampleProfiles };
