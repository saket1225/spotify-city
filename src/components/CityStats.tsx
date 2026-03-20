'use client';

import { useEffect, useState, useRef } from 'react';
import { BuildingParams } from '@/types';

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

interface CityStatsProps {
  buildings: BuildingParams[];
  cityName: string;
  onClose: () => void;
}

export default function CityStats({ buildings, cityName, onClose }: CityStatsProps) {
  const [visible, setVisible] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 350);
  };

  // Genre breakdown
  const genreCounts: Record<string, number> = {};
  for (const b of buildings) {
    const genre = b.profile.topGenres?.[0] || 'other';
    genreCounts[genre] = (genreCounts[genre] || 0) + 1;
  }
  const sortedGenres = Object.entries(genreCounts).sort((a, b) => b[1] - a[1]);
  const topGenre = sortedGenres[0];
  const maxGenreCount = topGenre?.[1] || 1;

  // Tallest building
  const tallest = buildings.reduce((a, b) => (b.height > a.height ? b : a), buildings[0]);

  // Diversity score
  const ALL_GENRES = Object.keys(GENRE_COLORS);
  const uniqueGenres = new Set<string>();
  for (const b of buildings) {
    for (const g of b.profile.topGenres) {
      const lower = g.toLowerCase();
      for (const key of ALL_GENRES) {
        if (lower.includes(key)) { uniqueGenres.add(key); break; }
      }
    }
  }
  const diversityScore = Math.round((uniqueGenres.size / ALL_GENRES.length) * 100);

  // Total listening hours
  const totalHours = buildings.reduce((sum, b) => sum + (b.profile.estimatedListeningHours || 0), 0);

  const accent = '#1DB954';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-stretch justify-start" onClick={handleClose}>
      <div
        className="absolute inset-0 transition-opacity duration-350"
        style={{
          background: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          opacity: visible ? 1 : 0,
        }}
      />

      <div
        ref={panelRef}
        className="relative w-full sm:w-[380px] max-h-[80vh] sm:max-h-full overflow-y-auto rounded-t-2xl sm:rounded-t-none sm:rounded-r-2xl"
        style={{
          background: 'rgba(10, 10, 18, 0.88)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderRight: `1px solid ${accent}25`,
          borderTop: `1px solid ${accent}25`,
          boxShadow: `inset 0 0 80px ${accent}06, 8px 0 40px rgba(0,0,0,0.5), 0 0 60px ${accent}08`,
          transform: visible
            ? 'translateX(0) translateY(0)'
            : typeof window !== 'undefined' && window.innerWidth < 768
              ? 'translateX(0) translateY(100%)'
              : 'translateX(-100%) translateY(0)',
          opacity: visible ? 1 : 0,
          transition: 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile drag handle */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        {/* Accent glow line */}
        <div
          className="h-[2px] w-full"
          style={{
            background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
            boxShadow: `0 0 12px ${accent}60`,
          }}
        />

        <div className="p-6">
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

          {/* City name */}
          <h2 className="text-[26px] font-bold text-white tracking-tight leading-tight pr-10">
            {cityName}
          </h2>
          <p className="text-[13px] mt-1 tracking-wide" style={{ color: `${accent}cc` }}>
            City Statistics
          </p>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3 mt-5 mb-6">
            <StatBox value={buildings.length.toString()} label="Buildings" accent={accent} />
            <StatBox value={totalHours.toLocaleString() + 'h'} label="Total Listening" accent={accent} />
            <StatBox value={diversityScore + '%'} label="Diversity Score" accent={accent} />
            <StatBox value={uniqueGenres.size.toString()} label="Unique Genres" accent={accent} />
          </div>

          {/* Tallest building */}
          {tallest && (
            <div className="mb-6">
              <h3 className="text-[11px] font-semibold uppercase tracking-widest text-gray-500 mb-2">
                Tallest Building
              </h3>
              <div className="flex items-center gap-3">
                <div
                  className="h-10 w-2 rounded-full"
                  style={{ background: tallest.primaryColor, boxShadow: `0 0 8px ${tallest.primaryColor}40` }}
                />
                <div>
                  <p className="text-sm font-medium text-white">{tallest.profile.displayName}</p>
                  <p className="text-[11px] text-gray-500">{tallest.height.toFixed(1)}m tall</p>
                </div>
              </div>
            </div>
          )}

          {/* Most popular genre */}
          {topGenre && (
            <div className="mb-6">
              <h3 className="text-[11px] font-semibold uppercase tracking-widest text-gray-500 mb-2">
                Most Popular Genre
              </h3>
              <div className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ background: getGenreColor(topGenre[0]) }}
                />
                <span className="text-sm text-white font-medium capitalize">{topGenre[0]}</span>
                <span className="text-[11px] text-gray-500">{topGenre[1]} buildings</span>
              </div>
            </div>
          )}

          {/* Genre breakdown bars */}
          <div className="mb-4">
            <h3 className="text-[11px] font-semibold uppercase tracking-widest text-gray-500 mb-3">
              Genre Breakdown
            </h3>
            <div className="space-y-2">
              {sortedGenres.slice(0, 10).map(([genre, count]) => {
                const pct = Math.round((count / buildings.length) * 100);
                const color = getGenreColor(genre);
                return (
                  <div key={genre}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] text-gray-300 capitalize truncate max-w-[60%]">{genre}</span>
                      <span className="text-[10px] text-gray-500">{pct}% ({count})</span>
                    </div>
                    <div className="h-[6px] w-full rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${(count / maxGenreCount) * 100}%`,
                          background: color,
                          boxShadow: `0 0 8px ${color}30`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
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
