'use client';

import { useRef, useState } from 'react';
import { SpotifyProfile } from '@/types';

interface ShareCardProps {
  profile: SpotifyProfile;
  onClose: () => void;
}

const GENRE_GRADIENTS: Record<string, [string, string, string]> = {
  pop: ['#FF69B4', '#FF1493', '#C71585'],
  rock: ['#DC143C', '#8B0000', '#4A0000'],
  'hip hop': ['#FFD700', '#FF8C00', '#B8860B'],
  rap: ['#FFD700', '#FF6B00', '#CC5500'],
  electronic: ['#00FFFF', '#0080FF', '#0040A0'],
  edm: ['#00FFFF', '#6600FF', '#3300AA'],
  'r&b': ['#9370DB', '#6A0DAD', '#4B0082'],
  soul: ['#9370DB', '#8B008B', '#4B0082'],
  jazz: ['#CD853F', '#8B6914', '#5C4033'],
  classical: ['#F5F5DC', '#C4A35A', '#8B7355'],
  indie: ['#98FB98', '#2E8B57', '#006400'],
  metal: ['#708090', '#2F4F4F', '#1A1A2E'],
  country: ['#DEB887', '#D2691E', '#8B4513'],
  latin: ['#FF6347', '#FF4500', '#CC3700'],
  reggae: ['#00FF00', '#228B22', '#006400'],
  'k-pop': ['#FF69B4', '#DA70D6', '#BA55D3'],
  punk: ['#FF4444', '#CC0000', '#8B0000'],
  blues: ['#4169E1', '#1E3A8A', '#0F1E4A'],
  folk: ['#A0522D', '#8B4513', '#5C3317'],
  afrobeats: ['#FF8C00', '#FF4500', '#CC2200'],
  funk: ['#FF00FF', '#CC00CC', '#800080'],
  synthwave: ['#8B00FF', '#FF006E', '#6600AA'],
};

function getGenreGradient(genre: string): [string, string, string] {
  const lower = genre.toLowerCase();
  for (const [key, colors] of Object.entries(GENRE_GRADIENTS)) {
    if (lower.includes(key)) return colors;
  }
  return ['#1DB954', '#15803d', '#064e3b'];
}

function formatHours(h: number): string {
  if (h >= 1000) return `${(h / 1000).toFixed(1)}K`;
  return h.toString();
}

function QRPlaceholder({ size = 56 }: { size?: number }) {
  const s = size;
  const cell = s / 7;
  const pattern = [
    [1,1,1,0,1,1,1],
    [1,0,1,0,1,0,1],
    [1,1,1,0,1,1,1],
    [0,0,0,1,0,0,0],
    [1,1,1,0,1,1,1],
    [1,0,1,0,1,0,1],
    [1,1,1,0,1,1,1],
  ];
  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
      {pattern.map((row, y) =>
        row.map((filled, x) =>
          filled ? (
            <rect key={`${x}-${y}`} x={x * cell} y={y * cell} width={cell} height={cell} fill="white" opacity={0.9} />
          ) : null
        )
      )}
    </svg>
  );
}

/* ── 9:16 Portrait card (Instagram Stories) ── */
function PortraitCard({ profile }: { profile: SpotifyProfile }) {
  const [g1, g2, g3] = getGenreGradient(profile.topGenres[0] || '');
  const topArtistImage = profile.topArtists[0]?.imageUrl;
  const topAlbumArt = profile.topTracks[0]?.albumArt;
  const bgImage = topArtistImage || topAlbumArt;

  return (
    <div style={{
      width: 540, height: 960, position: 'relative', overflow: 'hidden',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      {bgImage && (
        <div style={{
          position: 'absolute', inset: -40,
          backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center',
          filter: 'blur(40px) saturate(1.4)', opacity: 0.35,
        }} />
      )}
      <div style={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(160deg, ${g1}E6 0%, ${g2}CC 35%, ${g3}F2 65%, #08090aF5 100%)`,
      }} />
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.04,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
      }} />

      <div style={{
        position: 'relative', zIndex: 1, height: '100%', padding: '40px 36px',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 4, textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', marginBottom: 4 }}>
            Spotify City
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: 1 }}>
            Your music, visualized
          </div>
        </div>

        <div>
          <div style={{ fontSize: 36, fontWeight: 800, color: '#fff', lineHeight: 1.1, marginBottom: 24, textShadow: '0 2px 20px rgba(0,0,0,0.3)' }}>
            {profile.displayName}
          </div>
          <div style={{ fontSize: 96, fontWeight: 900, color: '#fff', lineHeight: 0.85, letterSpacing: '-4px', textShadow: '0 4px 30px rgba(0,0,0,0.3)' }}>
            {formatHours(profile.estimatedListeningHours)}
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 4, marginTop: 8 }}>
            listening hours
          </div>

          <div style={{ marginTop: 32 }}>
            <div style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(10px)', borderRadius: 16, padding: '16px 20px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 6 }}>
                Top Artist
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>
                {profile.topArtists[0]?.name || 'Unknown'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 16 }}>
            {profile.topGenres.slice(0, 3).map(genre => (
              <span key={genre} style={{
                padding: '6px 14px', borderRadius: 20, background: 'rgba(255,255,255,0.12)',
                color: '#fff', fontSize: 12, fontWeight: 600, border: '1px solid rgba(255,255,255,0.1)',
              }}>
                {genre}
              </span>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.8)', letterSpacing: 1 }}>
              spotifycity.app
            </div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>
              Built by @codanium_
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 10, padding: 6, border: '1px solid rgba(255,255,255,0.08)' }}>
              <QRPlaceholder size={56} />
            </div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)', textAlign: 'center', letterSpacing: 0.5 }}>
              Scan to build yours
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── 1:1 Square card (Twitter/X) ── */
function SquareCard({ profile }: { profile: SpotifyProfile }) {
  const [g1, g2, g3] = getGenreGradient(profile.topGenres[0] || '');

  return (
    <div style={{
      width: 600, height: 600, position: 'relative', overflow: 'hidden',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(135deg, ${g1}E6 0%, ${g2}CC 40%, ${g3}F2 70%, #08090aF0 100%)`,
      }} />
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.04,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
      }} />

      <div style={{
        position: 'relative', zIndex: 1, height: '100%', padding: '32px 36px',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 4, textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)' }}>
            Spotify City
          </div>
        </div>

        <div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#fff', marginBottom: 16 }}>
            {profile.displayName}&apos;s City
          </div>
          <div style={{ fontSize: 72, fontWeight: 900, color: '#fff', lineHeight: 0.85, letterSpacing: '-3px' }}>
            {formatHours(profile.estimatedListeningHours)}
          </div>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 3, marginTop: 8 }}>
            listening hours
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>
              {profile.topGenres.slice(0, 3).join(' · ')}
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.7)', letterSpacing: 1 }}>
              spotifycity.app
            </div>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 8, padding: 5, border: '1px solid rgba(255,255,255,0.08)' }}>
            <QRPlaceholder size={44} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ShareCard({ profile, onClose }: ShareCardProps) {
  const portraitRef = useRef<HTMLDivElement>(null);
  const squareRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [format, setFormat] = useState<'portrait' | 'square'>('portrait');

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const { default: html2canvas } = await import('html2canvas-pro');
      const ref = format === 'portrait' ? portraitRef : squareRef;
      if (!ref.current) return;
      const canvas = await html2canvas(ref.current, {
        backgroundColor: '#08090a',
        scale: 2,
        useCORS: true,
      });
      const link = document.createElement('a');
      link.download = `spotify-city-${profile.displayName.toLowerCase().replace(/\s+/g, '-')}-${format}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (e) {
      console.error('Download failed:', e);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fade-in" />
      <div
        className="relative z-10 flex flex-col items-center gap-3 sm:gap-4 animate-slide-up max-w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Format toggle: Stories (9:16) / Twitter (1:1) */}
        <div className="flex gap-2">
          <button
            onClick={() => setFormat('portrait')}
            className={`rounded-lg px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium transition-all ${
              format === 'portrait' ? 'bg-[#1DB954] text-black' : 'glass text-gray-400 hover:text-white'
            }`}
          >
            Stories
          </button>
          <button
            onClick={() => setFormat('square')}
            className={`rounded-lg px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium transition-all ${
              format === 'square' ? 'bg-[#1DB954] text-black' : 'glass text-gray-400 hover:text-white'
            }`}
          >
            Twitter
          </button>
        </div>

        {/* Card preview */}
        <div className="rounded-2xl overflow-hidden glow-green-strong" style={{ maxWidth: '92vw', maxHeight: '62vh', overflow: 'auto' }}>
          <div style={{
            transform: `scale(${format === 'portrait' ? 0.55 : 0.55})`,
            transformOrigin: 'top center',
          }}>
            <div ref={portraitRef} style={{ display: format === 'portrait' ? 'block' : 'none' }}>
              <PortraitCard profile={profile} />
            </div>
            <div ref={squareRef} style={{ display: format === 'square' ? 'block' : 'none' }}>
              <SquareCard profile={profile} />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 sm:gap-3">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="rounded-xl bg-[#1DB954] px-4 py-2.5 sm:px-6 sm:py-3 text-xs sm:text-sm font-bold text-black transition-all hover:bg-[#1ed760] disabled:opacity-50"
          >
            {downloading ? 'Saving...' : 'Download'}
          </button>
          <button
            onClick={onClose}
            className="rounded-xl glass px-4 py-2.5 sm:px-6 sm:py-3 text-xs sm:text-sm font-medium text-gray-400 hover:text-white transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
