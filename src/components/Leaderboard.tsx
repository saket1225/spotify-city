'use client';

import { useState, useMemo } from 'react';
import { BuildingParams } from '@/types';

interface LeaderboardProps {
  buildings: BuildingParams[];
  isOpen: boolean;
  onClose: () => void;
  currentUserId?: string;
  onBuildingClick?: (building: BuildingParams) => void;
}

type RankingCategory = 'hours' | 'diversity' | 'streak';

const GENRE_COLORS: Record<string, string> = {
  pop: '#FF69B4', rock: '#DC143C', 'hip hop': '#FFD700', electronic: '#00FFFF',
  'r&b': '#9370DB', jazz: '#CD853F', classical: '#F5F5DC', indie: '#98FB98',
  metal: '#2F4F4F', country: '#DEB887', latin: '#FF6347', reggae: '#00FF00',
  'k-pop': '#FF69B4', punk: '#FF4444', blues: '#4169E1', afrobeats: '#FF8C00',
  funk: '#FF00FF', synthwave: '#8B00FF', soul: '#9370DB', folk: '#A0522D',
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

const RANK_ICONS = ['👑', '🥈', '🥉'];

const TABS: { key: RankingCategory; label: string; icon: string }[] = [
  { key: 'hours', label: 'Listening Hours', icon: '🎧' },
  { key: 'diversity', label: 'Genre Diversity', icon: '🌈' },
  { key: 'streak', label: 'Longest Streak', icon: '🔥' },
];

export default function Leaderboard({ buildings, isOpen, onClose, currentUserId, onBuildingClick }: LeaderboardProps) {
  const [category, setCategory] = useState<RankingCategory>('hours');

  const ranked = useMemo(() => {
    const sorted = [...buildings].sort((a, b) => {
      switch (category) {
        case 'hours': return b.profile.estimatedListeningHours - a.profile.estimatedListeningHours;
        case 'diversity': return b.profile.topGenres.length - a.profile.topGenres.length;
        case 'streak': return b.profile.listeningStreak - a.profile.listeningStreak;
      }
    });
    return sorted.slice(0, 10);
  }, [buildings, category]);

  const getStat = (b: BuildingParams): string => {
    switch (category) {
      case 'hours': return `${formatHours(b.profile.estimatedListeningHours)} hrs`;
      case 'diversity': return `${b.profile.topGenres.length} genres`;
      case 'streak': return `${b.profile.listeningStreak}d streak`;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="absolute right-0 top-0 h-full w-full sm:max-w-md slide-in-right"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-full glass-strong flex flex-col" style={{
          borderLeft: '1px solid rgba(29,185,84,0.15)',
        }}>
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-white/5">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                🏆 Leaderboard
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">Top citizens of Spotify City</p>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-white/10 hover:text-white transition-all"
            >
              ✕
            </button>
          </div>

          {/* Tab switcher */}
          <div className="flex gap-1 p-3 mx-3 mt-3 rounded-xl glass">
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setCategory(tab.key)}
                className={`flex-1 rounded-lg px-2 py-2 text-xs font-medium transition-all ${
                  category === tab.key
                    ? 'bg-[#1DB954] text-black'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="block text-sm">{tab.icon}</span>
                <span className="block mt-0.5">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Rankings */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {ranked.map((building, i) => {
              const isCurrentUser = building.profile.id === currentUserId;
              const genreColor = getGenreColor(building.profile.topGenres[0] || '');

              return (
                <button
                  key={building.profile.id}
                  onClick={() => onBuildingClick?.(building)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all hover:bg-white/5 ${
                    isCurrentUser ? 'ring-1 ring-[#1DB954]/50 bg-[#1DB954]/5' : ''
                  }`}
                  style={{
                    animationDelay: `${i * 50}ms`,
                    animation: 'slideUp 0.4s ease-out backwards',
                  }}
                >
                  {/* Rank */}
                  <div className="w-8 text-center flex-shrink-0">
                    {i < 3 ? (
                      <span className="text-lg">{RANK_ICONS[i]}</span>
                    ) : (
                      <span className="text-sm font-bold text-gray-500">{i + 1}</span>
                    )}
                  </div>

                  {/* Avatar */}
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold"
                    style={{
                      backgroundColor: `${genreColor}20`,
                      color: genreColor,
                      border: `2px solid ${genreColor}40`,
                    }}
                  >
                    {building.profile.displayName.charAt(0)}
                  </div>

                  {/* Name */}
                  <div className="flex-1 text-left min-w-0">
                    <div className="text-sm font-semibold text-white truncate">
                      {building.profile.displayName}
                      {isCurrentUser && <span className="text-[#1DB954] ml-1 text-xs">(You)</span>}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {building.profile.topGenres.slice(0, 2).join(', ')}
                    </div>
                  </div>

                  {/* Stat */}
                  <div className="text-right flex-shrink-0">
                    <div className={`text-sm font-bold ${i < 3 ? 'text-[#1DB954] text-glow-green' : 'text-gray-300'}`}>
                      {getStat(building)}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
