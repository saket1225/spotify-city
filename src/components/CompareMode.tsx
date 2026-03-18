'use client';

import { useRef, useState } from 'react';
import { BuildingParams, SpotifyProfile } from '@/types';

interface CompareModeProps {
  buildings: BuildingParams[];
  isOpen: boolean;
  onClose: () => void;
}

const GENRE_COLORS: Record<string, string> = {
  pop: '#FF69B4', rock: '#DC143C', 'hip hop': '#FFD700', electronic: '#00FFFF',
  'r&b': '#9370DB', jazz: '#CD853F', classical: '#F5F5DC', indie: '#98FB98',
  metal: '#2F4F4F', latin: '#FF6347', reggae: '#00FF00', 'k-pop': '#FF69B4',
  punk: '#FF4444', blues: '#4169E1', afrobeats: '#FF8C00', funk: '#FF00FF',
  synthwave: '#8B00FF', soul: '#9370DB', country: '#DEB887', folk: '#A0522D',
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

interface CompareBarProps {
  label: string;
  leftValue: number;
  rightValue: number;
  leftLabel: string;
  rightLabel: string;
}

function CompareBar({ label, leftValue, rightValue, leftLabel, rightLabel }: CompareBarProps) {
  const max = Math.max(leftValue, rightValue, 1);
  const leftPct = (leftValue / max) * 100;
  const rightPct = (rightValue / max) * 100;
  const leftWins = leftValue > rightValue;
  const rightWins = rightValue > leftValue;

  return (
    <div className="mb-4">
      <div className="text-[10px] uppercase tracking-widest text-gray-500 mb-2 text-center">{label}</div>
      <div className="flex items-center gap-3">
        {/* Left stat */}
        <div className="w-14 sm:w-20 text-right">
          <span className={`text-xs sm:text-sm font-bold ${leftWins ? 'text-[#1DB954] text-glow-green' : 'text-gray-400'}`}>
            {leftLabel}
          </span>
        </div>
        {/* Bars */}
        <div className="flex-1 flex gap-1">
          <div className="flex-1 flex justify-end">
            <div
              className="h-5 sm:h-6 rounded-l-md transition-all duration-700"
              style={{
                width: `${leftPct}%`,
                background: leftWins
                  ? 'linear-gradient(90deg, transparent, #1DB954)'
                  : 'linear-gradient(90deg, transparent, #333)',
              }}
            />
          </div>
          <div className="flex-1">
            <div
              className="h-5 sm:h-6 rounded-r-md transition-all duration-700"
              style={{
                width: `${rightPct}%`,
                background: rightWins
                  ? 'linear-gradient(-90deg, transparent, #1DB954)'
                  : 'linear-gradient(-90deg, transparent, #333)',
              }}
            />
          </div>
        </div>
        {/* Right stat */}
        <div className="w-14 sm:w-20">
          <span className={`text-xs sm:text-sm font-bold ${rightWins ? 'text-[#1DB954] text-glow-green' : 'text-gray-400'}`}>
            {rightLabel}
          </span>
        </div>
      </div>
    </div>
  );
}

function PlayerSelect({
  buildings, selected, onSelect, side,
}: {
  buildings: BuildingParams[];
  selected: BuildingParams | null;
  onSelect: (b: BuildingParams) => void;
  side: 'left' | 'right';
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative flex-1">
      <button
        onClick={() => setOpen(!open)}
        className="w-full p-4 rounded-xl glass text-center transition-all hover:bg-white/5"
      >
        {selected ? (
          <div>
            <div
              className="w-16 h-16 rounded-full mx-auto mb-2 flex items-center justify-center text-2xl font-bold"
              style={{
                backgroundColor: `${getGenreColor(selected.profile.topGenres[0] || '')}20`,
                color: getGenreColor(selected.profile.topGenres[0] || ''),
                border: `2px solid ${getGenreColor(selected.profile.topGenres[0] || '')}40`,
              }}
            >
              {selected.profile.displayName.charAt(0)}
            </div>
            <div className="text-sm font-semibold text-white">{selected.profile.displayName}</div>
            <div className="text-xs text-gray-500">{selected.profile.topGenres[0]}</div>
          </div>
        ) : (
          <div className="py-4">
            <div className="text-3xl mb-2">🏢</div>
            <div className="text-sm text-gray-400">Select {side === 'left' ? 'Player 1' : 'Player 2'}</div>
          </div>
        )}
      </button>

      {open && (
        <div className="absolute top-full mt-2 left-0 right-0 z-10 glass-strong rounded-xl max-h-60 overflow-y-auto">
          {buildings.map(b => (
            <button
              key={b.profile.id}
              onClick={() => { onSelect(b); setOpen(false); }}
              className="w-full flex items-center gap-3 p-3 text-left hover:bg-white/5 transition-all"
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{
                  backgroundColor: `${getGenreColor(b.profile.topGenres[0] || '')}20`,
                  color: getGenreColor(b.profile.topGenres[0] || ''),
                }}
              >
                {b.profile.displayName.charAt(0)}
              </div>
              <span className="text-sm text-gray-200 truncate">{b.profile.displayName}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function getComparisons(left: SpotifyProfile, right: SpotifyProfile) {
  return [
    {
      label: 'Listening Hours',
      leftValue: left.estimatedListeningHours,
      rightValue: right.estimatedListeningHours,
      leftLabel: formatHours(left.estimatedListeningHours),
      rightLabel: formatHours(right.estimatedListeningHours),
    },
    {
      label: 'Tracks Played',
      leftValue: left.totalTracksPlayed,
      rightValue: right.totalTracksPlayed,
      leftLabel: left.totalTracksPlayed.toLocaleString(),
      rightLabel: right.totalTracksPlayed.toLocaleString(),
    },
    {
      label: 'Genre Diversity',
      leftValue: left.topGenres.length,
      rightValue: right.topGenres.length,
      leftLabel: `${left.topGenres.length}`,
      rightLabel: `${right.topGenres.length}`,
    },
    {
      label: 'Listening Streak',
      leftValue: left.listeningStreak,
      rightValue: right.listeningStreak,
      leftLabel: `${left.listeningStreak}d`,
      rightLabel: `${right.listeningStreak}d`,
    },
    {
      label: 'Playlists',
      leftValue: left.totalPlaylists,
      rightValue: right.totalPlaylists,
      leftLabel: `${left.totalPlaylists}`,
      rightLabel: `${right.totalPlaylists}`,
    },
  ];
}

export default function CompareMode({ buildings, isOpen, onClose }: CompareModeProps) {
  const [left, setLeft] = useState<BuildingParams | null>(null);
  const [right, setRight] = useState<BuildingParams | null>(null);
  const compareRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const comparisons = left && right ? getComparisons(left.profile, right.profile) : null;
  const leftWins = comparisons ? comparisons.filter(c => c.leftValue > c.rightValue).length : 0;
  const rightWins = comparisons ? comparisons.filter(c => c.rightValue > c.leftValue).length : 0;

  const handleShare = async () => {
    if (!compareRef.current) return;
    try {
      const { default: html2canvas } = await import('html2canvas-pro');
      const canvas = await html2canvas(compareRef.current, {
        backgroundColor: '#0a0a0a',
        scale: 2,
      });
      const link = document.createElement('a');
      link.download = `spotify-city-compare-${left?.profile.displayName}-vs-${right?.profile.displayName}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (e) {
      console.error('Share failed:', e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fade-in" />
      <div
        className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl glass-strong glow-green p-4 sm:p-6 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-white/10 hover:text-white transition-all z-10"
        >
          ✕
        </button>

        <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
          ⚔️ Head to Head
        </h2>
        <p className="text-xs text-gray-500 mb-5">Compare two buildings side by side</p>

        <div ref={compareRef} style={{ background: '#0a0a0a', padding: 24, borderRadius: 16 }}>
          {/* Player selection */}
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
            <PlayerSelect buildings={buildings} selected={left} onSelect={setLeft} side="left" />

            <div className="flex-shrink-0 relative">
              <div className="w-14 h-14 rounded-full glass-green flex items-center justify-center">
                <span className="text-xl font-black text-[#1DB954]">VS</span>
              </div>
            </div>

            <PlayerSelect buildings={buildings} selected={right} onSelect={setRight} side="right" />
          </div>

          {/* Comparison bars */}
          {comparisons && (
            <>
              <div className="space-y-1">
                {comparisons.map(comp => (
                  <CompareBar key={comp.label} {...comp} />
                ))}
              </div>

              {/* Winner summary */}
              <div className="mt-5 p-4 rounded-xl glass text-center">
                {leftWins > rightWins ? (
                  <div>
                    <span className="text-sm text-[#1DB954] font-bold text-glow-green">
                      🏆 {left!.profile.displayName} wins!
                    </span>
                    <span className="text-xs text-gray-500 ml-2">{leftWins}-{rightWins}</span>
                  </div>
                ) : rightWins > leftWins ? (
                  <div>
                    <span className="text-sm text-[#1DB954] font-bold text-glow-green">
                      🏆 {right!.profile.displayName} wins!
                    </span>
                    <span className="text-xs text-gray-500 ml-2">{rightWins}-{leftWins}</span>
                  </div>
                ) : (
                  <span className="text-sm text-gray-400 font-bold">🤝 It&apos;s a tie!</span>
                )}
              </div>

              {/* Watermark */}
              <div className="mt-3 text-center text-xs text-gray-600">
                spotifycity.app | built by @codanium_
              </div>
            </>
          )}

          {!comparisons && (
            <div className="text-center py-8 text-sm text-gray-500">
              Select two buildings to compare
            </div>
          )}
        </div>

        {/* Share button */}
        {comparisons && (
          <div className="flex justify-center mt-4">
            <button
              onClick={handleShare}
              className="rounded-xl bg-[#1DB954] px-6 py-3 text-sm font-bold text-black hover:bg-[#1ed760] transition-all"
            >
              📸 Download Comparison
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
