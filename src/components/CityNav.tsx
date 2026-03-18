'use client';

import { useState } from 'react';
import { Globe, Search, Trophy, Share2, Users, Swords } from 'lucide-react';

interface CityNavProps {
  onResetCamera: () => void;
  onFindMyBuilding: () => void;
  onOpenLeaderboard: () => void;
  onOpenShareCard: () => void;
  onOpenInvite: () => void;
  onOpenCompare: () => void;
}

const NAV_ITEMS = [
  { id: 'home', icon: Globe, label: 'Overview', action: 'onResetCamera' },
  { id: 'find', icon: Search, label: 'My Building', action: 'onFindMyBuilding' },
  { id: 'leaderboard', icon: Trophy, label: 'Leaderboard', action: 'onOpenLeaderboard' },
  { id: 'share', icon: Share2, label: 'Share Card', action: 'onOpenShareCard' },
  { id: 'invite', icon: Users, label: 'Invite', action: 'onOpenInvite' },
  { id: 'compare', icon: Swords, label: 'Compare', action: 'onOpenCompare' },
] as const;

export default function CityNav(props: CityNavProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  const actionMap: Record<string, () => void> = {
    onResetCamera: props.onResetCamera,
    onFindMyBuilding: props.onFindMyBuilding,
    onOpenLeaderboard: props.onOpenLeaderboard,
    onOpenShareCard: props.onOpenShareCard,
    onOpenInvite: props.onOpenInvite,
    onOpenCompare: props.onOpenCompare,
  };

  return (
    <div className="fixed bottom-4 right-3 sm:bottom-8 sm:right-8 z-30 flex flex-col gap-2 sm:gap-4">
      {NAV_ITEMS.map((item, i) => (
        <div
          key={item.id}
          className="relative"
          style={{
            animation: `slideUp 0.4s ease-out backwards`,
            animationDelay: `${(NAV_ITEMS.length - i) * 60}ms`,
          }}
        >
          {/* Tooltip */}
          {hovered === item.id && (
            <div className="absolute right-12 sm:right-16 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-lg glass-strong px-2 py-1 sm:px-3 sm:py-1.5 text-[10px] sm:text-xs text-gray-300 pointer-events-none animate-fade-in">
              {item.label}
            </div>
          )}

          {/* Button */}
          <button
            onClick={actionMap[item.action]}
            onMouseEnter={() => setHovered(item.id)}
            onMouseLeave={() => setHovered(null)}
            className="fab-button w-10 h-10 sm:w-14 sm:h-14 rounded-full glass glow-green flex items-center justify-center transition-all hover:scale-110 hover:glow-green-strong active:scale-95"
          >
            <item.icon className="w-4 h-4 sm:w-5 sm:h-5" color="#1DB954" />
          </button>
        </div>
      ))}
    </div>
  );
}
