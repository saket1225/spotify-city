'use client';

import { useEffect, useState } from 'react';
import { SpotifyProfile } from '@/types';

interface ProfileCardProps {
  profile: SpotifyProfile;
  buildingColor?: string;
  onClose: () => void;
  onShare?: () => void;
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

export default function ProfileCard({ profile, buildingColor, onClose, onShare }: ProfileCardProps) {
  const [visible, setVisible] = useState(false);
  const accent = buildingColor || getGenreColor(profile.topGenres[0] || '');

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-end p-0 sm:p-4" onClick={handleClose}>
      {/* Backdrop */}
      <div className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-400 ${visible ? 'opacity-100' : 'opacity-0'}`} />

      {/* Card */}
      <div
        className={`relative w-full sm:w-[380px] max-h-[85vh] overflow-y-auto sm:rounded-2xl transition-all duration-400 ease-out ${
          visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
        }`}
        style={{
          background: 'rgba(12, 12, 20, 0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: `1px solid ${accent}20`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Accent line */}
        <div className="h-[2px] w-full" style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }} />

        <div className="p-6">
          {/* Close */}
          <button
            onClick={handleClose}
            className="absolute right-4 top-5 flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-all hover:bg-white/10 hover:text-white"
          >
            ✕
          </button>

          {/* Artist name big */}
          <h2 className="text-2xl font-bold text-white mb-1">{profile.displayName}</h2>

          {/* Genre tag */}
          {profile.topGenres[0] && (
            <span
              className="inline-block rounded-full px-3 py-1 text-xs font-medium mb-5"
              style={{
                backgroundColor: `${getGenreColor(profile.topGenres[0])}15`,
                color: getGenreColor(profile.topGenres[0]),
                border: `1px solid ${getGenreColor(profile.topGenres[0])}30`,
              }}
            >
              {profile.topGenres[0]}
            </span>
          )}

          {/* Listening hours */}
          <div className="mb-6">
            <div className="text-4xl font-bold text-white" style={{ textShadow: `0 0 30px ${accent}30` }}>
              {profile.estimatedListeningHours.toLocaleString()}
            </div>
            <div className="text-[11px] uppercase tracking-widest text-gray-500 mt-1">listening hours</div>
          </div>

          {/* Top 3 tracks */}
          <div className="mb-6">
            <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-gray-500">Top Tracks</h3>
            <div className="space-y-2.5">
              {profile.topTracks.slice(0, 3).map((track, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <span
                    className="flex h-6 w-6 items-center justify-center rounded text-[10px] font-bold shrink-0"
                    style={{ background: `${accent}15`, color: accent }}
                  >
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <span className="text-gray-200">{track.name}</span>
                    <span className="text-gray-500"> — {track.artist}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Share button */}
          {onShare && (
            <button
              onClick={onShare}
              className="w-full rounded-xl px-4 py-3 text-sm font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: '#1DB954',
                color: '#000',
              }}
            >
              Share This Building
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
