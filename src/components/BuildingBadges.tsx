'use client';

import { useMemo, useState } from 'react';
import { SpotifyProfile, BuildingParams } from '@/types';

interface BuildingBadgesProps {
  profile: SpotifyProfile;
  allBuildings?: BuildingParams[];
  compact?: boolean;
}

interface Badge {
  id: string;
  icon: string;
  name: string;
  description: string;
  unlocked: boolean;
}

function getBadges(profile: SpotifyProfile, allBuildings?: BuildingParams[]): Badge[] {
  // Calculate if in tallest 10%
  let isSkyscraper = false;
  if (allBuildings && allBuildings.length > 0) {
    const sorted = [...allBuildings].sort(
      (a, b) => b.profile.estimatedListeningHours - a.profile.estimatedListeningHours
    );
    const top10Index = Math.max(1, Math.floor(sorted.length * 0.1));
    isSkyscraper = sorted.slice(0, top10Index).some(b => b.profile.id === profile.id);
  }

  return [
    {
      id: 'marathon',
      icon: '🎧',
      name: 'Marathon Listener',
      description: '1,000+ listening hours',
      unlocked: profile.estimatedListeningHours >= 1000,
    },
    {
      id: 'explorer',
      icon: '🌈',
      name: 'Genre Explorer',
      description: '10+ genres discovered',
      unlocked: profile.topGenres.length >= 10,
    },
    {
      id: 'fire',
      icon: '🔥',
      name: 'On Fire',
      description: '30+ day listening streak',
      unlocked: profile.listeningStreak >= 30,
    },
    {
      id: 'skyscraper',
      icon: '🏗️',
      name: 'Skyscraper',
      description: 'Tallest 10% of buildings',
      unlocked: isSkyscraper,
    },
    {
      id: 'playlist',
      icon: '🎵',
      name: 'Playlist King',
      description: '50+ playlists created',
      unlocked: profile.totalPlaylists >= 50,
    },
    {
      id: 'early',
      icon: '⚡',
      name: 'Early Adopter',
      description: 'First 100 users',
      unlocked: true, // All sample users are early adopters
    },
  ];
}

export default function BuildingBadges({ profile, allBuildings, compact = false }: BuildingBadgesProps) {
  const badges = useMemo(() => getBadges(profile, allBuildings), [profile, allBuildings]);
  const [hoveredBadge, setHoveredBadge] = useState<string | null>(null);

  const unlockedBadges = badges.filter(b => b.unlocked);
  const lockedBadges = badges.filter(b => !b.unlocked);

  if (compact) {
    return (
      <div className="flex gap-1 flex-wrap">
        {unlockedBadges.map(badge => (
          <span
            key={badge.id}
            title={`${badge.name}: ${badge.description}`}
            className="badge-glow"
            style={{ fontSize: 16, cursor: 'default' }}
          >
            {badge.icon}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div>
      <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-gray-500">
        Badges ({unlockedBadges.length}/{badges.length})
      </h3>

      {/* Unlocked */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        {unlockedBadges.map(badge => (
          <div
            key={badge.id}
            className="relative rounded-xl glass-green p-3 text-center cursor-default badge-glow transition-all hover:scale-105"
            onMouseEnter={() => setHoveredBadge(badge.id)}
            onMouseLeave={() => setHoveredBadge(null)}
          >
            <div className="text-2xl mb-1">{badge.icon}</div>
            <div className="text-[10px] font-semibold text-white leading-tight">{badge.name}</div>
            {hoveredBadge === badge.id && (
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg glass-strong px-3 py-1.5 text-[10px] text-gray-300 z-10">
                {badge.description}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Locked */}
      {lockedBadges.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {lockedBadges.map(badge => (
            <div
              key={badge.id}
              className="relative rounded-xl glass p-3 text-center opacity-40 cursor-default"
              onMouseEnter={() => setHoveredBadge(badge.id)}
              onMouseLeave={() => setHoveredBadge(null)}
            >
              <div className="text-2xl mb-1 grayscale">{badge.icon}</div>
              <div className="text-[10px] font-semibold text-gray-500 leading-tight">{badge.name}</div>
              {hoveredBadge === badge.id && (
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg glass-strong px-3 py-1.5 text-[10px] text-gray-400 z-10">
                  🔒 {badge.description}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Export for use in other components
export { getBadges };
export type { Badge };
