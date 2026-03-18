'use client';

import { useEffect, useState } from 'react';
import { SpotifyProfile } from '@/types';

interface ProfileCardProps {
  profile: SpotifyProfile;
  onClose: () => void;
}

const GENRE_COLORS: Record<string, string> = {
  pop: '#FF69B4',
  rock: '#DC143C',
  'hip hop': '#FFD700',
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
  afrobeats: '#FF8C00',
  funk: '#FF00FF',
  synthwave: '#8B00FF',
};

function getGenreColor(genre: string): string {
  const lower = genre.toLowerCase();
  for (const [key, color] of Object.entries(GENRE_COLORS)) {
    if (lower.includes(key)) return color;
  }
  return '#1DB954';
}

function formatHours(h: number): string {
  if (h >= 1000) return `${(h / 1000).toFixed(1)}K`;
  return h.toString();
}

export default function ProfileCard({ profile, onClose }: ProfileCardProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={handleClose}>
      <div className={`absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`} />
      <div
        className={`relative w-full max-w-md rounded-2xl glass-strong glow-green p-6 transition-all duration-300 ${
          visible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-95'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-all hover:bg-white/10 hover:text-white hover:rotate-90"
        >
          ✕
        </button>

        {/* Profile header */}
        <div className="mb-5 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl glass-green">
            <span className="text-2xl font-bold text-[#1DB954]">
              {profile.displayName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{profile.displayName}</h2>
            <p className="text-sm text-gray-400">
              {profile.totalPlaylists} playlists
            </p>
          </div>
        </div>

        {/* Stats grid */}
        <div className="mb-5 grid grid-cols-3 gap-3">
          <div className="rounded-xl glass p-3 text-center">
            <div className="text-lg font-bold text-white text-glow-green">
              {formatHours(profile.estimatedListeningHours)}
            </div>
            <div className="text-[10px] uppercase tracking-wider text-gray-500">hours</div>
          </div>
          <div className="rounded-xl glass p-3 text-center">
            <div className="text-lg font-bold text-white">
              {profile.totalTracksPlayed.toLocaleString()}
            </div>
            <div className="text-[10px] uppercase tracking-wider text-gray-500">tracks</div>
          </div>
          <div className="rounded-xl glass p-3 text-center">
            <div className="text-lg font-bold text-white">
              {profile.listeningStreak}d
            </div>
            <div className="text-[10px] uppercase tracking-wider text-gray-500">streak</div>
          </div>
        </div>

        {/* Genre tags */}
        <div className="mb-5">
          <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-gray-500">Genres</h3>
          <div className="flex flex-wrap gap-2">
            {profile.topGenres.slice(0, 5).map((genre) => {
              const color = getGenreColor(genre);
              return (
                <span
                  key={genre}
                  className="rounded-full px-3 py-1 text-xs font-medium"
                  style={{
                    backgroundColor: `${color}15`,
                    color: color,
                    border: `1px solid ${color}30`,
                  }}
                >
                  {genre}
                </span>
              );
            })}
          </div>
        </div>

        {/* Top artists with colored circles */}
        <div className="mb-5">
          <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-gray-500">Top Artists</h3>
          <div className="space-y-2">
            {profile.topArtists.slice(0, 3).map((artist, i) => {
              const color = getGenreColor(artist.genres[0] || '');
              return (
                <div key={i} className="flex items-center gap-3">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold"
                    style={{ backgroundColor: `${color}25`, color }}
                  >
                    {artist.name.charAt(0)}
                  </div>
                  <span className="text-sm text-gray-200">{artist.name}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top tracks */}
        <div>
          <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-gray-500">Top Tracks</h3>
          <div className="space-y-2">
            {profile.topTracks.slice(0, 3).map((track, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <span className="flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold text-[#1DB954] glass-green">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <span className="text-gray-200">{track.name}</span>
                  <span className="text-gray-500"> — {track.artist}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
