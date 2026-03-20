'use client';

import { useRef, useState, useEffect } from 'react';
import { SpotifyProfile } from '@/types';

interface ShareCardProps {
  profile: SpotifyProfile;
  onClose: () => void;
}

function formatHours(h: number): string {
  return h.toLocaleString() + 'h';
}

/* Minimal city skyline silhouette */
function CitySkyline() {
  return (
    <svg width="460" height="80" viewBox="0 0 460 80" fill="none" style={{ display: 'block' }}>
      {/* Buildings as simple rectangles */}
      <rect x="10" y="35" width="20" height="45" fill="#1DB954" opacity="0.15" />
      <rect x="35" y="20" width="15" height="60" fill="#1DB954" opacity="0.2" />
      <rect x="55" y="40" width="25" height="40" fill="#1DB954" opacity="0.12" />
      <rect x="85" y="10" width="12" height="70" fill="#1DB954" opacity="0.25" />
      <rect x="102" y="30" width="22" height="50" fill="#1DB954" opacity="0.15" />
      <rect x="130" y="18" width="18" height="62" fill="#1DB954" opacity="0.2" />
      <rect x="153" y="38" width="28" height="42" fill="#1DB954" opacity="0.12" />
      <rect x="186" y="8" width="14" height="72" fill="#1DB954" opacity="0.28" />
      <rect x="205" y="25" width="20" height="55" fill="#1DB954" opacity="0.15" />
      <rect x="230" y="42" width="24" height="38" fill="#1DB954" opacity="0.12" />
      <rect x="260" y="15" width="16" height="65" fill="#1DB954" opacity="0.22" />
      <rect x="281" y="32" width="22" height="48" fill="#1DB954" opacity="0.15" />
      <rect x="308" y="5" width="12" height="75" fill="#1DB954" opacity="0.3" />
      <rect x="325" y="28" width="26" height="52" fill="#1DB954" opacity="0.15" />
      <rect x="356" y="38" width="18" height="42" fill="#1DB954" opacity="0.12" />
      <rect x="380" y="20" width="20" height="60" fill="#1DB954" opacity="0.2" />
      <rect x="405" y="35" width="15" height="45" fill="#1DB954" opacity="0.15" />
      <rect x="425" y="22" width="22" height="58" fill="#1DB954" opacity="0.18" />
    </svg>
  );
}

function ShareCardContent({ profile }: { profile: SpotifyProfile }) {
  return (
    <div style={{
      width: 540,
      height: 960,
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      background: '#0a0b0c',
    }}>
      <div style={{
        position: 'relative',
        height: '100%',
        padding: '48px 44px 36px',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{
          fontFamily: '"Silkscreen", monospace',
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: 6,
          color: '#1DB954',
          textTransform: 'uppercase' as const,
        }}>
          SPOTIFY CITY
        </div>

        {/* User name */}
        <div style={{
          marginTop: 60,
          fontSize: 36,
          fontWeight: 800,
          color: '#ffffff',
          lineHeight: 1.2,
          letterSpacing: '-0.5px',
        }}>
          {profile.displayName}
        </div>

        {/* Big stat */}
        <div style={{
          marginTop: 48,
        }}>
          <div style={{
            fontSize: 96,
            fontWeight: 900,
            color: '#ffffff',
            letterSpacing: '-4px',
            lineHeight: 1,
          }}>
            {formatHours(profile.estimatedListeningHours)}
          </div>
          <div style={{
            marginTop: 12,
            fontSize: 15,
            color: 'rgba(255,255,255,0.4)',
            letterSpacing: 0.5,
          }}>
            across {profile.topGenres.length} genres · {profile.topArtists.length} artists
          </div>
        </div>

        {/* Genre pills */}
        <div style={{
          marginTop: 40,
          display: 'flex',
          gap: 8,
          flexWrap: 'wrap' as const,
        }}>
          {profile.topGenres.slice(0, 5).map((genre) => (
            <span key={genre} style={{
              padding: '6px 16px',
              borderRadius: 20,
              background: 'rgba(29,185,84,0.1)',
              border: '1px solid rgba(29,185,84,0.2)',
              color: '#1DB954',
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: 0.3,
            }}>
              {genre}
            </span>
          ))}
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* City skyline */}
        <div style={{ marginLeft: -44, marginRight: -44, marginBottom: 24 }}>
          <CitySkyline />
        </div>

        {/* Footer */}
        <div style={{
          fontSize: 11,
          color: 'rgba(255,255,255,0.2)',
          letterSpacing: 0.5,
          textAlign: 'center' as const,
        }}>
          spotify-city-lemon.vercel.app
        </div>
      </div>
    </div>
  );
}

export default function ShareCard({ profile, onClose }: ShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 640);
    setCanShare('share' in navigator);
  }, []);

  const captureCard = async () => {
    const { default: html2canvas } = await import('html2canvas-pro');
    if (!cardRef.current) return null;
    return html2canvas(cardRef.current, {
      backgroundColor: '#0a0b0c',
      scale: 2,
      useCORS: true,
    });
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const canvas = await captureCard();
      if (!canvas) return;
      const link = document.createElement('a');
      link.download = `spotify-city-${profile.displayName.toLowerCase().replace(/\s+/g, '-')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (e) {
      console.error('Download failed:', e);
    } finally {
      setDownloading(false);
    }
  };

  const handleCopy = async () => {
    try {
      const canvas = await captureCard();
      if (!canvas) return;
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob }),
        ]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }, 'image/png');
    } catch (e) {
      console.error('Copy failed:', e);
    }
  };

  const handleShare = async () => {
    try {
      const canvas = await captureCard();
      if (!canvas) return;
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, 'image/png')
      );
      if (!blob) return;
      const file = new File([blob], 'spotify-city.png', { type: 'image/png' });
      if (navigator.share) {
        await navigator.share({
          title: `${profile.displayName}'s Spotify City`,
          text: `Check out my Spotify City! ${profile.estimatedListeningHours} hours of music visualized as a city.`,
          files: [file],
        });
      }
    } catch (e) {
      if ((e as Error).name !== 'AbortError') {
        console.error('Share failed:', e);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/85 backdrop-blur-md animate-fade-in" />
      <div
        className="relative z-10 flex flex-col items-center gap-3 sm:gap-4 animate-slide-up max-w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Card preview */}
        <div className="rounded-2xl overflow-hidden" style={{
          maxWidth: '92vw',
          width: 540 * (isMobile ? 0.38 : 0.5),
          height: 960 * (isMobile ? 0.38 : 0.5),
          overflow: 'hidden',
          boxShadow: '0 0 60px rgba(29,185,84,0.1)',
        }}>
          <div style={{
            transform: isMobile ? 'scale(0.38)' : 'scale(0.5)',
            transformOrigin: 'top left',
            width: 540,
            height: 960,
          }}>
            <div ref={cardRef}>
              <ShareCardContent profile={profile} />
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 sm:gap-3">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="rounded-xl bg-[#1DB954] px-4 py-2.5 sm:px-5 sm:py-3 text-xs sm:text-sm font-bold text-black transition-all hover:bg-[#1ed760] hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            {downloading ? 'Saving...' : '↓ Download'}
          </button>
          <button
            onClick={handleCopy}
            className="rounded-xl bg-white/10 border border-white/10 px-4 py-2.5 sm:px-5 sm:py-3 text-xs sm:text-sm font-semibold text-white transition-all hover:bg-white/15 hover:scale-105 active:scale-95"
          >
            {copied ? '✓ Copied!' : '⎘ Copy'}
          </button>
          {canShare && (
            <button
              onClick={handleShare}
              className="rounded-xl bg-white/10 border border-white/10 px-4 py-2.5 sm:px-5 sm:py-3 text-xs sm:text-sm font-semibold text-white transition-all hover:bg-white/15 hover:scale-105 active:scale-95"
            >
              ↗ Share
            </button>
          )}
          <button
            onClick={onClose}
            className="rounded-xl bg-white/5 border border-white/8 px-4 py-2.5 sm:px-5 sm:py-3 text-xs sm:text-sm font-medium text-gray-400 hover:text-white hover:bg-white/10 transition-all"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
