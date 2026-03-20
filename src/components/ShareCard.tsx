'use client';

import { useRef, useState } from 'react';
import { SpotifyProfile } from '@/types';

interface ShareCardProps {
  profile: SpotifyProfile;
  onClose: () => void;
}

const GENRE_COLORS: Record<string, string> = {
  pop: '#FF69B4', rock: '#DC143C', 'hip hop': '#FFD700', rap: '#FF8C00',
  electronic: '#00FFFF', edm: '#6600FF', 'r&b': '#9370DB', soul: '#8B008B',
  jazz: '#CD853F', classical: '#C4A35A', indie: '#2E8B57', metal: '#708090',
  country: '#DEB887', latin: '#FF6347', reggae: '#228B22', 'k-pop': '#DA70D6',
  punk: '#FF4444', blues: '#4169E1', folk: '#A0522D', afrobeats: '#FF4500',
  funk: '#FF00FF', synthwave: '#8B00FF',
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

/* Pixel-art style "SPOTIFY CITY" text using SVG */
function PixelLogo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="2" y="2" width="16" height="16" rx="3" fill="#1DB954" />
        <rect x="5" y="6" width="2" height="2" fill="#000" />
        <rect x="8" y="6" width="2" height="2" fill="#000" />
        <rect x="11" y="6" width="2" height="2" fill="#000" />
        <rect x="5" y="9" width="2" height="2" fill="#000" />
        <rect x="8" y="9" width="8" height="2" fill="#000" />
        <rect x="5" y="12" width="10" height="2" fill="#000" />
      </svg>
      <span style={{
        fontFamily: '"Courier New", monospace',
        fontSize: 14,
        fontWeight: 900,
        letterSpacing: 6,
        color: '#1DB954',
        textTransform: 'uppercase' as const,
      }}>
        SPOTIFY CITY
      </span>
    </div>
  );
}

/* City skyline SVG generated from user's genre colors */
function CitySkyline({ profile }: { profile: SpotifyProfile }) {
  const colors = profile.topGenres.slice(0, 5).map(g => getGenreColor(g));
  const c1 = colors[0] || '#1DB954';
  const c2 = colors[1] || '#15803d';
  const c3 = colors[2] || '#064e3b';

  return (
    <svg width="460" height="120" viewBox="0 0 460 120" fill="none" style={{ display: 'block' }}>
      <defs>
        <linearGradient id="sky1" x1="0" y1="0" x2="460" y2="120" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={c1} stopOpacity="0.6" />
          <stop offset="50%" stopColor={c2} stopOpacity="0.4" />
          <stop offset="100%" stopColor={c3} stopOpacity="0.6" />
        </linearGradient>
        <linearGradient id="sky2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="white" stopOpacity="0.15" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Back row - taller, darker */}
      <rect x="20" y="30" width="28" height="90" rx="2" fill={c1} opacity="0.25" />
      <rect x="55" y="15" width="22" height="105" rx="2" fill={c2} opacity="0.2" />
      <rect x="85" y="40" width="32" height="80" rx="2" fill={c3} opacity="0.25" />
      <rect x="125" y="10" width="20" height="110" rx="2" fill={c1} opacity="0.3" />
      <rect x="155" y="35" width="26" height="85" rx="2" fill={c2} opacity="0.2" />
      <rect x="190" y="20" width="30" height="100" rx="2" fill={c3} opacity="0.25" />
      <rect x="230" y="5" width="18" height="115" rx="2" fill={c1} opacity="0.3" />
      <rect x="255" y="25" width="24" height="95" rx="2" fill={c2} opacity="0.2" />
      <rect x="290" y="40" width="28" height="80" rx="2" fill={c3} opacity="0.25" />
      <rect x="325" y="15" width="22" height="105" rx="2" fill={c1} opacity="0.25" />
      <rect x="355" y="30" width="30" height="90" rx="2" fill={c2} opacity="0.2" />
      <rect x="395" y="20" width="24" height="100" rx="2" fill={c3} opacity="0.25" />
      <rect x="425" y="35" width="20" height="85" rx="2" fill={c1} opacity="0.2" />
      {/* Front row - shorter, brighter */}
      <rect x="10" y="60" width="35" height="60" rx="2" fill="url(#sky1)" opacity="0.5" />
      <rect x="50" y="50" width="25" height="70" rx="2" fill="url(#sky1)" opacity="0.6" />
      <rect x="80" y="65" width="40" height="55" rx="2" fill="url(#sky1)" opacity="0.45" />
      <rect x="130" y="45" width="22" height="75" rx="2" fill="url(#sky1)" opacity="0.55" />
      <rect x="160" y="55" width="35" height="65" rx="2" fill="url(#sky1)" opacity="0.5" />
      <rect x="200" y="50" width="28" height="70" rx="2" fill="url(#sky1)" opacity="0.6" />
      <rect x="240" y="60" width="20" height="60" rx="2" fill="url(#sky1)" opacity="0.45" />
      <rect x="270" y="45" width="32" height="75" rx="2" fill="url(#sky1)" opacity="0.55" />
      <rect x="310" y="55" width="25" height="65" rx="2" fill="url(#sky1)" opacity="0.5" />
      <rect x="345" y="50" width="30" height="70" rx="2" fill="url(#sky1)" opacity="0.6" />
      <rect x="380" y="60" width="22" height="60" rx="2" fill="url(#sky1)" opacity="0.45" />
      <rect x="410" y="50" width="35" height="70" rx="2" fill="url(#sky1)" opacity="0.5" />
      {/* Window dots */}
      {[30, 65, 100, 145, 180, 215, 250, 285, 325, 360, 395, 430].map((x, i) => (
        <g key={i}>
          <circle cx={x} cy={70} r="1.5" fill="white" opacity="0.6" />
          <circle cx={x} cy={80} r="1.5" fill="white" opacity="0.4" />
          <circle cx={x} cy={90} r="1.5" fill="white" opacity="0.5" />
          <circle cx={x + 8} cy={75} r="1.5" fill="white" opacity="0.3" />
          <circle cx={x + 8} cy={85} r="1.5" fill="white" opacity="0.5" />
        </g>
      ))}
      {/* Ground line */}
      <rect x="0" y="118" width="460" height="2" fill="white" opacity="0.1" />
    </svg>
  );
}

function QRCode({ size = 64 }: { size?: number }) {
  const cell = size / 9;
  const pattern = [
    [1,1,1,0,1,0,1,1,1],
    [1,0,1,0,0,0,1,0,1],
    [1,1,1,0,1,0,1,1,1],
    [0,0,0,0,1,0,0,0,0],
    [1,0,1,1,0,1,1,0,1],
    [0,0,0,0,1,0,0,0,0],
    [1,1,1,0,0,0,1,1,1],
    [1,0,1,0,1,0,1,0,1],
    [1,1,1,0,1,0,1,1,1],
  ];
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {pattern.map((row, y) =>
        row.map((filled, x) =>
          filled ? (
            <rect key={`${x}-${y}`} x={x * cell} y={y * cell} width={cell} height={cell} fill="white" opacity={0.85} rx={0.5} />
          ) : null
        )
      )}
    </svg>
  );
}

function ShareCardContent({ profile }: { profile: SpotifyProfile }) {
  const genreColors = profile.topGenres.slice(0, 5).map(g => getGenreColor(g));
  const accentColor = genreColors[0] || '#1DB954';

  return (
    <div style={{
      width: 540,
      height: 960,
      position: 'relative',
      overflow: 'hidden',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      background: '#08090a',
    }}>
      {/* Gradient overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: `
          radial-gradient(ellipse 80% 50% at 50% 0%, ${accentColor}18 0%, transparent 70%),
          radial-gradient(ellipse 60% 40% at 80% 100%, ${genreColors[1] || '#1DB954'}12 0%, transparent 60%),
          linear-gradient(180deg, #0d0f11 0%, #08090a 100%)
        `,
      }} />
      {/* Noise texture */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.03,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
      }} />

      <div style={{
        position: 'relative',
        zIndex: 1,
        height: '100%',
        padding: '40px 40px 32px',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Header - pixel logo */}
        <PixelLogo />

        {/* User name */}
        <div style={{
          marginTop: 40,
          fontSize: 38,
          fontWeight: 800,
          color: '#ffffff',
          lineHeight: 1.15,
          letterSpacing: '-0.5px',
        }}>
          {profile.displayName}
        </div>
        <div style={{
          marginTop: 6,
          fontSize: 13,
          color: 'rgba(255,255,255,0.4)',
          letterSpacing: 1,
        }}>
          Your music city, visualized
        </div>

        {/* Stats grid */}
        <div style={{
          marginTop: 36,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 12,
        }}>
          {[
            { label: 'HOURS LISTENED', value: formatHours(profile.estimatedListeningHours) },
            { label: 'TRACKS PLAYED', value: profile.totalTracksPlayed.toLocaleString() },
            { label: 'GENRES', value: profile.topGenres.length.toString() },
            { label: 'PLAYLISTS', value: profile.totalPlaylists.toString() },
          ].map(({ label, value }) => (
            <div key={label} style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 14,
              padding: '16px 18px',
              backdropFilter: 'blur(12px)',
            }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: 2.5, textTransform: 'uppercase' as const }}>
                {label}
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#fff', marginTop: 4, letterSpacing: '-1px' }}>
                {value}
              </div>
            </div>
          ))}
        </div>

        {/* Top 3 Artists */}
        <div style={{ marginTop: 28 }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: 2.5, textTransform: 'uppercase' as const, marginBottom: 12 }}>
            TOP ARTISTS
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {profile.topArtists.slice(0, 3).map((artist, i) => (
              <div key={artist.name} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 12,
                padding: '12px 16px',
              }}>
                <div style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: i === 0 ? '#1DB954' : 'rgba(255,255,255,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 13,
                  fontWeight: 800,
                  color: i === 0 ? '#000' : 'rgba(255,255,255,0.5)',
                  flexShrink: 0,
                }}>
                  {i + 1}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap' as const, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {artist.name}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Genre pills */}
        <div style={{ marginTop: 24 }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: 2.5, textTransform: 'uppercase' as const, marginBottom: 10 }}>
            GENRES
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const }}>
            {profile.topGenres.slice(0, 6).map((genre, i) => (
              <span key={genre} style={{
                padding: '5px 14px',
                borderRadius: 20,
                background: `${genreColors[i] || accentColor}18`,
                border: `1px solid ${genreColors[i] || accentColor}30`,
                color: genreColors[i] || accentColor,
                fontSize: 11,
                fontWeight: 600,
              }}>
                {genre}
              </span>
            ))}
          </div>
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* City skyline */}
        <div style={{ marginLeft: -40, marginRight: -40, marginBottom: 20 }}>
          <CitySkyline profile={profile} />
        </div>

        {/* Footer with QR */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.6)', letterSpacing: 0.5 }}>
              spotify-city-lemon.vercel.app
            </div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', marginTop: 3 }}>
              Build your own music city
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{
              background: 'rgba(255,255,255,0.06)',
              borderRadius: 10,
              padding: 8,
              border: '1px solid rgba(255,255,255,0.08)',
            }}>
              <QRCode size={56} />
            </div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', letterSpacing: 0.5 }}>
              Scan to build yours
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ShareCard({ profile, onClose }: ShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  const captureCard = async () => {
    const { default: html2canvas } = await import('html2canvas-pro');
    if (!cardRef.current) return null;
    return html2canvas(cardRef.current, {
      backgroundColor: '#08090a',
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
        {/* Card preview - scaled to fit viewport */}
        <div className="rounded-2xl overflow-hidden" style={{
          maxWidth: '92vw',
          maxHeight: '68vh',
          overflow: 'hidden',
          boxShadow: '0 0 60px rgba(29,185,84,0.15), 0 0 120px rgba(29,185,84,0.05)',
        }}>
          <div style={{
            transform: 'scale(0.5)',
            transformOrigin: 'top center',
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
          {typeof window !== 'undefined' && 'share' in navigator && (
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
