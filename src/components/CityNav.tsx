'use client';

import { useState } from 'react';

interface CityNavProps {
  onResetCamera: () => void;
  onFindMyBuilding: () => void;
  onOpenLeaderboard: () => void;
  onOpenShareCard: () => void;
  onOpenInvite: () => void;
  onOpenCompare: () => void;
}

const NAV_ITEMS = [
  { id: 'home', icon: '🏠', label: 'Overview', action: 'onResetCamera' },
  { id: 'find', icon: '🔍', label: 'My Building', action: 'onFindMyBuilding' },
  { id: 'leaderboard', icon: '🏆', label: 'Leaderboard', action: 'onOpenLeaderboard' },
  { id: 'share', icon: '📸', label: 'Share Card', action: 'onOpenShareCard' },
  { id: 'invite', icon: '👥', label: 'Invite', action: 'onOpenInvite' },
  { id: 'compare', icon: '⚔️', label: 'Compare', action: 'onOpenCompare' },
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
    <div className="fixed bottom-6 right-6 z-30 flex flex-col gap-3">
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
            <div className="absolute right-14 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-lg glass-strong px-3 py-1.5 text-xs text-gray-300 pointer-events-none animate-fade-in">
              {item.label}
            </div>
          )}

          {/* Button */}
          <button
            onClick={actionMap[item.action]}
            onMouseEnter={() => setHovered(item.id)}
            onMouseLeave={() => setHovered(null)}
            className="fab-button w-12 h-12 rounded-full glass glow-green flex items-center justify-center text-lg transition-all hover:scale-110 hover:glow-green-strong active:scale-95"
          >
            {item.icon}
          </button>
        </div>
      ))}
    </div>
  );
}
