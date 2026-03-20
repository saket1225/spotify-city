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

  useEffect(() => {
    setContentKey(profile.id);
  }, [profile.id]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 350);
  };

  const sortedHeights = allBuildings
    .map((b) => b.height)
    .sort((a, b) => b - a);
  const rank = sortedHeights.indexOf(building.height) + 1;
  const totalBuildings = allBuildings.length;

  const hours = profile.estimatedListeningHours.toLocaleString();

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-stretch justify-end" onClick={handleClose}>
      {/* Backdrop */}
      <div
        className="absolute inset-0 transition-opacity duration-350"
        style={{
          background: 'rgba(0,0,0,0.35)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          opacity: visible ? 1 : 0,
        }}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className="relative w-full sm:w-[380px] max-h-[75vh] sm:max-h-full overflow-y-auto rounded-t-3xl sm:rounded-t-none sm:rounded-l-3xl"
        style={{
          background: 'rgba(8, 8, 14, 0.92)',
          backdropFilter: 'blur(32px)',
          WebkitBackdropFilter: 'blur(32px)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRight: 'none',
          boxShadow: `-12px 0 48px rgba(0,0,0,0.6), inset 0 0 60px ${accent}04`,
          transform: visible
            ? 'translateX(0) translateY(0)'
            : typeof window !== 'undefined' && window.innerWidth < 768
              ? 'translateX(0) translateY(100%)'
              : 'translateX(100%) translateY(0)',
          opacity: visible ? 1 : 0,
          transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile drag handle */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-white/15" />
        </div>

        {/* Accent glow line */}
        <div
          className="h-[2px] w-full"
          style={{
            background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
            boxShadow: `0 2px 16px ${accent}50`,
          }}
        />

        <div className="p-6 pt-5" key={contentKey}>
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute right-4 top-5 flex h-8 w-8 items-center justify-center rounded-full text-white/30 transition-all hover:bg-white/8 hover:text-white/70"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="1" y1="1" x2="13" y2="13" />
              <line x1="13" y1="1" x2="1" y2="13" />
            </svg>
          </button>

          {/* Building style label */}
          <p
            className="text-[11px] uppercase tracking-[0.15em] font-medium mb-1.5"
            style={{ color: `${accent}99` }}
          >
            {STYLE_LABELS[building.style] || 'Modern Tower'}
          </p>

          {/* Artist name */}
          <h2 className="text-[28px] font-bold text-white tracking-tight leading-tight pr-10 mb-6">
            {profile.displayName}
          </h2>

          {/* Hero stat - Listening Hours */}
          <div className="mb-6">
            <div
              className="text-[56px] font-bold leading-none tracking-tight text-white"
              style={{ textShadow: `0 0 40px ${accent}20` }}
            >
              {hours}<span className="text-[24px] font-medium text-white/40 ml-1">h</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[13px] text-white/40">listening hours</span>
              <span className="text-[13px] font-semibold" style={{ color: accent }}>
                #{rank} <span className="text-white/30 font-normal">in your city</span>
              </span>
            </div>
          </div>

          {/* Rank bar */}
          <div className="mb-6">
            <div className="h-1 w-full rounded-full bg-white/[0.04] overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${Math.max(5, ((totalBuildings - rank + 1) / totalBuildings) * 100)}%`,
                  background: `linear-gradient(90deg, ${accent}, ${accent}80)`,
                  boxShadow: `0 0 8px ${accent}40`,
                }}
              />
            </div>
            <div className="flex justify-between mt-1.5">
              <span className="text-[10px] text-white/20">#{totalBuildings}</span>
              <span className="text-[10px] text-white/20">#1</span>
            </div>
          </div>

          {/* Genre pills */}
          <div className="flex flex-wrap gap-1.5 mb-8">
            {profile.topGenres.slice(0, 5).map((genre) => {
              const c = getGenreColor(genre);
              return (
                <span
                  key={genre}
                  className="rounded-full px-2.5 py-[3px] text-[10px] font-medium tracking-wide"
                  style={{
                    backgroundColor: `${c}0a`,
                    color: `${c}bb`,
                    border: `1px solid ${c}18`,
                  }}
                >
                  {genre}
                </span>
              );
            })}
          </div>

          {/* Share button */}
          {onShare && (
            <button
              onClick={onShare}
              className="w-full rounded-2xl px-4 py-3.5 text-[13px] font-semibold tracking-wide transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: `${accent}18`,
                color: accent,
                border: `1px solid ${accent}25`,
              }}
            >
              Share
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
