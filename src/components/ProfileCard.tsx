"use client";

import { BuildingParams } from "@/types";

interface ProfileCardProps {
  building: BuildingParams;
  onClose: () => void;
}

export default function ProfileCard({ building, onClose }: ProfileCardProps) {
  const { profile, style, color } = building;

  return (
    <div className="absolute top-4 right-4 w-80 bg-black/90 border border-zinc-800 rounded-lg p-5 backdrop-blur-sm z-50">
      <button
        onClick={onClose}
        className="absolute top-3 right-3 text-zinc-500 hover:text-white transition-colors text-lg"
      >
        x
      </button>

      <div className="flex items-center gap-3 mb-4">
        {profile.imageUrl ? (
          <img
            src={profile.imageUrl}
            alt={profile.displayName}
            className="w-12 h-12 rounded-sm"
            style={{ imageRendering: "pixelated" }}
          />
        ) : (
          <div
            className="w-12 h-12 rounded-sm flex items-center justify-center text-lg font-bold"
            style={{ backgroundColor: color }}
          >
            {profile.displayName[0]}
          </div>
        )}
        <div>
          <h3 className="text-white font-bold font-[family-name:var(--font-silkscreen)]">
            {profile.displayName}
          </h3>
          <p className="text-zinc-500 text-xs">
            {profile.followers.toLocaleString()} followers
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-zinc-900 rounded p-2">
          <p className="text-zinc-500 text-xs">Playlists</p>
          <p className="text-white font-bold">{profile.totalPlaylists}</p>
        </div>
        <div className="bg-zinc-900 rounded p-2">
          <p className="text-zinc-500 text-xs">Recently Played</p>
          <p className="text-white font-bold">{profile.recentlyPlayed}</p>
        </div>
        <div className="bg-zinc-900 rounded p-2">
          <p className="text-zinc-500 text-xs">Style</p>
          <p className="text-white font-bold capitalize">{style}</p>
        </div>
        <div className="bg-zinc-900 rounded p-2">
          <p className="text-zinc-500 text-xs">Building Height</p>
          <p className="text-white font-bold">{building.height.toFixed(1)}</p>
        </div>
      </div>

      {profile.topGenres.length > 0 && (
        <div className="mb-3">
          <p className="text-zinc-500 text-xs mb-1">Top Genres</p>
          <div className="flex flex-wrap gap-1">
            {profile.topGenres.map((genre) => (
              <span
                key={genre}
                className="text-xs px-2 py-0.5 rounded-sm"
                style={{ backgroundColor: color + "33", color }}
              >
                {genre}
              </span>
            ))}
          </div>
        </div>
      )}

      {profile.topArtists.length > 0 && (
        <div>
          <p className="text-zinc-500 text-xs mb-1">Top Artists</p>
          <div className="flex flex-wrap gap-1">
            {profile.topArtists.map((artist) => (
              <span
                key={artist.name}
                className="text-xs text-zinc-300 bg-zinc-800 px-2 py-0.5 rounded-sm"
              >
                {artist.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
