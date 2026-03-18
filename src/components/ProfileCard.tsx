'use client';

import { useEffect, useState } from 'react';
import { SpotifyProfile } from '@/types';

interface ProfileCardProps {
  profile: SpotifyProfile;
  onClose: () => void;
}

export default function ProfileCard({ profile, onClose }: ProfileCardProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 200);
  };

  const formatFollowers = (n: number) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return n.toString();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={handleClose}>
      <div className={`absolute inset-0 bg-black/60 transition-opacity duration-200 ${visible ? 'opacity-100' : 'opacity-0'}`} />
      <div
        className={`relative w-full max-w-md rounded-lg border border-[#1DB954]/30 bg-[#121212] p-6 shadow-2xl transition-all duration-200 ${
          visible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-white/10 hover:text-white"
        >
          ✕
        </button>

        <div className="mb-4 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#1DB954]/20">
            <span className="font-pixel text-2xl text-[#1DB954]">
              {profile.displayName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h2 className="font-pixel text-xl text-white">{profile.displayName}</h2>
            <p className="text-sm text-gray-400">
              {formatFollowers(profile.followers)} followers · {profile.totalPlaylists} playlists
            </p>
          </div>
        </div>

        <div className="mb-4">
          <h3 className="font-pixel mb-2 text-xs text-[#1DB954]">TOP GENRES</h3>
          <div className="flex flex-wrap gap-2">
            {profile.topGenres.slice(0, 5).map((genre) => (
              <span key={genre} className="rounded-full border border-[#1DB954]/30 bg-[#1DB954]/10 px-3 py-1 text-xs text-[#1DB954]">
                {genre}
              </span>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <h3 className="font-pixel mb-2 text-xs text-[#1DB954]">TOP ARTISTS</h3>
          <div className="space-y-1.5">
            {profile.topArtists.slice(0, 3).map((artist, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-gray-300">
                <span className="text-[#1DB954]">{i + 1}.</span>
                <span>{artist.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-pixel mb-2 text-xs text-[#1DB954]">TOP TRACKS</h3>
          <div className="space-y-1.5">
            {profile.topTracks.slice(0, 3).map((track, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <span className="text-[#1DB954]">{i + 1}.</span>
                <span className="text-gray-300">{track.name}</span>
                <span className="text-gray-500">— {track.artist}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
