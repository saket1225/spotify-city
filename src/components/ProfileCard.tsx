'use client';

import { useEffect, useState, useRef } from 'react';
import { SpotifyProfile, BuildingParams, BuildingStyle } from '@/types';

interface ProfileCardProps {
  profile: SpotifyProfile;
  building: BuildingParams;
  allBuildings: BuildingParams[];
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

const STYLE_LABELS: Record<BuildingStyle, string> = {
  skyscraper: 'Glass Skyscraper',
  fortress: 'Gothic Fortress',
  'neon-tower': 'Neon Tower',
  penthouse: 'Luxury Penthouse',
  brownstone: 'Indie Brownstone',
  cathedral: 'Grand Cathedral',
  modern: 'Modern Tower',
};

export default function ProfileCard({ profile, building, allBuildings, onClose, onShare }: ProfileCardProps) {
  const [visible, setVisible] = useState(false);
  const [contentKey, setContentKey] = useState(profile.id);
  const panelRef = useRef<HTMLDivElement>(null);
  const accent = building.primaryColor;

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  // Smooth content swap without close/reopen
  useEffect(() => {
    setContentKey(profile.id);
  }, [profile.id]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 350);
  };

  // Skyline rank: sort buildings by height descending, find this building's rank
  const sortedHeights = allBuildings
    .map((b) => b.height)
    .sort((a, b) => b - a);
  const rank = sortedHeights.indexOf(building.height) + 1;
  const totalBuildings = allBuildings.length;

  // Top 5 buildings for mini bar chart
  const top5 = sortedHeights.slice(0, 5);
  const maxH = top5[0] || 1;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-stretch justify-end" onClick={handleClose}>
      {/* Backdrop */}
      <div
        className="absolute inset-0 transition-opacity duration-350"
        style={{
          background: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          opacity: visible ? 1 : 0,
        }}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className="relative w-full sm:w-[400px] max-h-[90vh] sm:max-h-full overflow-y-auto sm:rounded-l-2xl rounded-t-2xl sm:rounded-t-none"
        style={{
          background: 'rgba(10, 10, 18, 0.88)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderLeft: `1px solid ${accent}25`,
          borderTop: `1px solid ${accent}25`,
          boxShadow: `inset 0 0 80px ${accent}06, -8px 0 40px rgba(0,0,0,0.5), 0 0 60px ${accent}08`,
          transform: visible
            ? 'translateX(0) translateY(0)'
            : 'translateX(100%) translateY(0)',
          opacity: visible ? 1 : 0,
          transition: 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Accent glow line at top */}
        <div
          className="h-[2px] w-full"
          style={{
            background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
            boxShadow: `0 0 12px ${accent}60`,
          }}
        />

        <div className="p-6" key={contentKey}>
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute right-4 top-5 flex h-8 w-8 items-center justify-center rounded-full text-gray-500 transition-all hover:bg-white/10 hover:text-white"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="1" y1="1" x2="13" y2="13" />
              <line x1="13" y1="1" x2="1" y2="13" />
            </svg>
          </button>

          {/* Artist name */}
          <h2 className="text-[26px] font-bold text-white tracking-tight leading-tight pr-10">
            {profile.displayName}
          </h2>

          {/* Building style label */}
          <p className="text-[13px] mt-1 tracking-wide" style={{ color: `${accent}cc` }}>
            {STYLE_LABELS[building.style] || 'Modern Tower'}
          </p>

          {/* Genre pills */}
          <div className="flex flex-wrap gap-1.5 mt-4 mb-6">
            {profile.topGenres.slice(0, 5).map((genre) => {
              const c = getGenreColor(genre);
              return (
                <span
                  key={genre}
                  className="rounded-full px-2.5 py-[3px] text-[10px] font-medium tracking-wide"
                  style={{
                    backgroundColor: `${c}12`,
                    color: `${c}dd`,
                    border: `1px solid ${c}25`,
                  }}
                >
                  {genre}
                </span>
              );
            })}
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <StatBox
              value={profile.estimatedListeningHours.toLocaleString()}
              label="Hours Listened"
              accent={accent}
            />
            <StatBox
              value={profile.topTracks.length.toString()}
              label="Top Tracks"
              accent={accent}
            />
            <StatBox
              value={profile.totalPlaylists.toString()}
              label="Playlists"
              accent={accent}
            />
            <StatBox
              value={`${profile.listeningStreak}d`}
              label="Streak"
              accent={accent}
            />
          </div>

          {/* Skyline Rank */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[11px] font-semibold uppercase tracking-widest text-gray-500">
                Skyline Rank
              </h3>
              <span className="text-[11px] text-gray-500">
                #{rank} of {totalBuildings}
              </span>
            </div>

            {/* Mini bar chart */}
            <div className="flex items-end gap-[3px] h-[48px]">
              {allBuildings
                .slice()
                .sort((a, b) => b.height - a.height)
                .slice(0, 20)
                .map((b, i) => {
                  const isThis = b.profile.id === profile.id;
                  const barH = (b.height / maxH) * 100;
                  return (
                    <div
                      key={i}
                      className="flex-1 rounded-t-[2px] transition-all duration-300"
                      style={{
                        height: `${barH}%`,
                        background: isThis ? accent : 'rgba(255,255,255,0.08)',
                        boxShadow: isThis ? `0 0 8px ${accent}40` : 'none',
                        minWidth: 0,
                      }}
                    />
                  );
                })}
            </div>
          </div>

          {/* Color palette */}
          <div className="mb-6">
            <h3 className="text-[11px] font-semibold uppercase tracking-widest text-gray-500 mb-3">
              Building Palette
            </h3>
            <div className="flex gap-2">
              {[building.primaryColor, building.secondaryColor, building.accentColor].map(
                (color, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div
                      className="h-6 w-6 rounded-md"
                      style={{
                        background: color,
                        boxShadow: `0 0 8px ${color}30`,
                        border: '1px solid rgba(255,255,255,0.08)',
                      }}
                    />
                    <span className="text-[10px] text-gray-500 font-mono">
                      {color.toUpperCase()}
                    </span>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Top Tracks */}
          {profile.topTracks.length > 0 && (
            <div className="mb-6">
              <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-gray-500">
                Top Tracks
              </h3>
              <div className="space-y-2">
                {profile.topTracks.slice(0, 3).map((track, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <span
                      className="flex h-6 w-6 items-center justify-center rounded text-[10px] font-bold shrink-0"
                      style={{ background: `${accent}12`, color: accent }}
                    >
                      {i + 1}
                    </span>
                    <div className="min-w-0 truncate">
                      <span className="text-gray-200">{track.name}</span>
                      <span className="text-gray-500"> — {track.artist}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Share button */}
          {onShare && (
            <button
              onClick={onShare}
              className="w-full rounded-xl px-4 py-3 text-sm font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: accent,
                color: '#000',
                boxShadow: `0 0 20px ${accent}25`,
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

function StatBox({ value, label, accent }: { value: string; label: string; accent: string }) {
  return (
    <div
      className="rounded-xl p-3"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div
        className="text-xl font-bold text-white"
        style={{ textShadow: `0 0 20px ${accent}20` }}
      >
        {value}
      </div>
      <div className="text-[10px] uppercase tracking-widest text-gray-500 mt-0.5">
        {label}
      </div>
    </div>
  );
}
