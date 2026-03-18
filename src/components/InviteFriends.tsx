'use client';

import { useState } from 'react';

interface InviteFriendsProps {
  isOpen: boolean;
  onClose: () => void;
  userDisplayName?: string;
}

export default function InviteFriends({ isOpen, onClose, userDisplayName }: InviteFriendsProps) {
  const [copied, setCopied] = useState(false);
  const inviteLink = typeof window !== 'undefined' ? window.location.origin : 'https://spotifycity.app';
  // Simulate invite count
  const friendsJoined = Math.floor(Math.random() * 5) + 2;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const input = document.createElement('input');
      input.value = inviteLink;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShareTwitter = () => {
    const name = userDisplayName || 'my building';
    const text = `I just built ${name === 'my building' ? name : `${name}'s building`} in @SpotifyCity! 🏙️ Come see my city and build yours → ${inviteLink} | built by @codanium_`;
    window.open(
      `https://x.com/intent/tweet?text=${encodeURIComponent(text)}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fade-in" />
      <div
        className="relative z-10 w-full max-w-sm rounded-2xl glass-strong glow-green p-5 sm:p-6 animate-slide-up mx-2 sm:mx-0"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-white/10 hover:text-white transition-all"
        >
          ✕
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">👥</div>
          <h2 className="text-xl font-bold text-white">Invite Friends</h2>
          <p className="text-xs text-gray-500 mt-1">Grow Spotify City together</p>
        </div>

        {/* Invite link */}
        <div className="mb-4">
          <div className="flex gap-2">
            <div className="flex-1 glass rounded-xl px-4 py-3 text-sm text-gray-300 truncate">
              {inviteLink}
            </div>
            <button
              onClick={handleCopy}
              className={`rounded-xl px-4 py-3 text-sm font-bold transition-all ${
                copied
                  ? 'bg-[#1DB954] text-black'
                  : 'glass text-[#1DB954] hover:bg-[#1DB954]/10'
              }`}
            >
              {copied ? '✓ Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Share on Twitter */}
        <button
          onClick={handleShareTwitter}
          className="w-full rounded-xl bg-[#1DA1F2] px-4 py-3 text-sm font-bold text-white transition-all hover:bg-[#1a8cd8] mb-4 flex items-center justify-center gap-2"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          Share on X (Twitter)
        </button>

        {/* Friends joined counter */}
        <div className="rounded-xl glass p-4 text-center">
          <div className="text-2xl font-bold text-[#1DB954] text-glow-green">{friendsJoined}</div>
          <div className="text-xs text-gray-500 mt-1">friends joined via your invite</div>
        </div>

        {/* Watermark */}
        <div className="text-center text-[10px] text-gray-600 mt-4">
          spotifycity.app | built by @codanium_
        </div>
      </div>
    </div>
  );
}
