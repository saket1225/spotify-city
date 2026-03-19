'use client';

import { useEffect, useState, useRef } from 'react';
import { SpotifyProfile, BuildingParams } from '@/types';
import BuildingBadges from './BuildingBadges';

interface ProfileCardProps {
  profile: SpotifyProfile;
  buildingColor?: string;
  rank?: number;
  onClose: () => void;
  onShare?: () => void;
  onVisitBuilding?: () => void;
  allBuildings?: BuildingParams[];
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

// Animated counter that counts up when visible
function AnimatedStat({ value, format, active }: { value: number; format?: (n: number) => string; active: boolean }) {
  const [display, setDisplay] = useState(0);
  const hasStarted = useRef(false);

  useEffect(() => {
    if (!active || hasStarted.current) return;
    hasStarted.current = true;
    let frame: number;
    const start = performance.now();
    const duration = 1200;
    const animate = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [value, active]);

  return <span>{format ? format(display) : display.toLocaleString()}</span>;
}

export default function ProfileCard({ profile, buildingColor, rank, onClose, onShare, onVisitBuilding, allBuildings }: ProfileCardProps) {
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
      <div className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-400 ${visible ? 'opacity-100' : 'opacity-0'}`} />

      {/* Card - slides in from right */}
      <div
        className={`relative w-full sm:w-[400px] max-h-[92vh] overflow-y-auto sm:rounded-2xl transition-all duration-400 ease-out ${
          visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
        }`}
        style={{
          background: 'rgba(12, 12, 18, 0.85)',
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
          border: `1px solid ${accent}20`,
          boxShadow: `0 0 40px ${accent}10, 0 0 80px rgba(0,0,0,0.5)`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Accent line at top */}
        <div className="h-[2px] w-full" style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }} />

        <div className="p-6">
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute right-4 top-5 flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-all hover:bg-white/10 hover:text-white hover:rotate-90"
          >
            ✕
          </button>

          {/* Profile header with rank */}
          <div className="mb-5 flex items-center gap-4">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-2xl"
              style={{
                background: `${accent}15`,
                border: `1px solid ${accent}30`,
              }}
            >
              <span className="text-2xl font-bold" style={{ color: accent }}>
                {profile.displayName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white">{profile.displayName}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-sm text-gray-400">
                  {profile.totalPlaylists} playlists
                </p>
                {rank && (
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{
                      background: `${accent}20`,
                      color: accent,
                      border: `1px solid ${accent}30`,
                    }}
                  >
                    #{rank} in city
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Stats grid with animated counters */}
          <div className="mb-5 grid grid-cols-3 gap-3">
            <div className="rounded-xl p-3 text-center" style={{ background: `${accent}08`, border: `1px solid ${accent}12` }}>
              <div className="text-lg font-bold text-white" style={{ textShadow: `0 0 20px ${accent}40` }}>
                <AnimatedStat value={profile.estimatedListeningHours} format={formatHours} active={visible} />
              </div>
              <div className="text-[10px] uppercase tracking-wider text-gray-500">hours</div>
            </div>
            <div className="rounded-xl p-3 text-center" style={{ background: `${accent}08`, border: `1px solid ${accent}12` }}>
              <div className="text-lg font-bold text-white">
                <AnimatedStat value={profile.totalTracksPlayed} active={visible} />
              </div>
              <div className="text-[10px] uppercase tracking-wider text-gray-500">tracks</div>
            </div>
            <div className="rounded-xl p-3 text-center" style={{ background: `${accent}08`, border: `1px solid ${accent}12` }}>
              <div className="text-lg font-bold text-white">
                <AnimatedStat value={profile.listeningStreak} active={visible} />
                <span>d</span>
              </div>
              <div className="text-[10px] uppercase tracking-wider text-gray-500">streak</div>
            </div>
          </div>

          {/* Badges */}
          <div className="mb-5">
            <BuildingBadges profile={profile} allBuildings={allBuildings} />
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

          {/* Top artists */}
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
          <div className="mb-5">
            <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-gray-500">Top Tracks</h3>
            <div className="space-y-2">
              {profile.topTracks.slice(0, 3).map((track, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <span
                    className="flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold"
                    style={{ background: `${accent}15`, color: accent, border: `1px solid ${accent}25` }}
                  >
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

          {/* Action buttons */}
          <div className="flex gap-3">
            {onVisitBuilding && (
              <button
                onClick={onVisitBuilding}
                className="flex-1 rounded-xl px-4 py-3 text-sm font-bold transition-all hover:brightness-110"
                style={{
                  background: `${accent}20`,
                  color: accent,
                  border: `1px solid ${accent}30`,
                }}
              >
                Visit Building
              </button>
            )}
            {onShare && (
              <button
                onClick={onShare}
                className="flex-1 rounded-xl px-4 py-3 text-sm font-bold text-black transition-all hover:brightness-110"
                style={{ background: accent }}
              >
                Share Card
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
