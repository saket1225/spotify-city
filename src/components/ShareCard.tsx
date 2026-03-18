'use client';

import { useRef, useState } from 'react';
import { SpotifyProfile } from '@/types';

interface ShareCardProps {
  profile: SpotifyProfile;
  onClose: () => void;
  rank?: number;
}

const GENRE_COLORS: Record<string, string> = {
  pop: '#FF69B4', rock: '#DC143C', 'hip hop': '#FFD700', rap: '#FFD700',
  electronic: '#00FFFF', edm: '#00FFFF', 'r&b': '#9370DB', soul: '#9370DB',
  jazz: '#CD853F', classical: '#F5F5DC', indie: '#98FB98', metal: '#2F4F4F',
  country: '#DEB887', latin: '#FF6347', reggae: '#00FF00', 'k-pop': '#FF69B4',
  punk: '#FF4444', blues: '#4169E1', folk: '#A0522D', afrobeats: '#FF8C00',
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

// Building icon SVG as a simple geometric shape
function BuildingIcon({ color, style }: { color: string; style: string }) {
  const heights = style === 'skyscraper' ? [40, 70, 55] :
    style === 'fortress' ? [50, 50, 50] :
    style === 'neon-tower' ? [35, 65, 45] :
    [45, 60, 50];

  return (
    <svg width="120" height="100" viewBox="0 0 120 100">
      <rect x="15" y={100 - heights[0]} width="25" height={heights[0]} fill={color} opacity={0.6} rx="2" />
      <rect x="47" y={100 - heights[1]} width="26" height={heights[1]} fill={color} rx="2" />
      <rect x="80" y={100 - heights[2]} width="25" height={heights[2]} fill={color} opacity={0.7} rx="2" />
      {/* Windows */}
      {[0, 1, 2].map(col => {
        const x = col === 0 ? 20 : col === 1 ? 53 : 86;
        const h = heights[col];
        return Array.from({ length: Math.floor(h / 12) }, (_, row) => (
          <rect
            key={`${col}-${row}`}
            x={x + 2}
            y={100 - h + 6 + row * 12}
            width="5"
            height="4"
            fill="#1DB954"
            opacity={0.4 + Math.random() * 0.6}
            rx="0.5"
          />
        ));
      })}
      {/* Antenna on tallest */}
      <line x1="60" y1={100 - heights[1]} x2="60" y2={100 - heights[1] - 12} stroke={color} strokeWidth="2" />
      <circle cx="60" cy={100 - heights[1] - 14} r="2" fill="#1DB954" />
    </svg>
  );
}

function CardContent({
  profile, rank, format, color,
}: {
  profile: SpotifyProfile; rank?: number; format: 'portrait' | 'landscape'; color: string;
}) {
  const isPortrait = format === 'portrait';

  return (
    <div
      style={{
        width: isPortrait ? 540 : 800,
        height: isPortrait ? 960 : 420,
        background: 'linear-gradient(145deg, #0a0a0a 0%, #111118 50%, #0a0a0a 100%)',
        padding: isPortrait ? 40 : 32,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Glow orb */}
      <div style={{
        position: 'absolute',
        top: isPortrait ? '15%' : '20%',
        right: isPortrait ? '-10%' : '-5%',
        width: 300, height: 300,
        background: `radial-gradient(circle, ${color}20 0%, transparent 70%)`,
        borderRadius: '50%',
      }} />

      {/* Top: name + rank */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: `${color}20`, border: `2px solid ${color}40`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, fontWeight: 700, color,
          }}>
            {profile.displayName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#fff' }}>
              {profile.displayName}
            </div>
            {rank && (
              <div style={{ fontSize: 14, color: '#888', marginTop: 2 }}>
                Rank #{rank} in the city
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Middle: stats + building */}
      <div style={{
        position: 'relative', zIndex: 1,
        display: 'flex',
        flexDirection: isPortrait ? 'column' : 'row',
        alignItems: isPortrait ? 'flex-start' : 'center',
        gap: isPortrait ? 24 : 40,
        flex: 1,
        justifyContent: 'center',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Hours - big number */}
          <div>
            <div style={{
              fontSize: isPortrait ? 72 : 56, fontWeight: 800, color: '#1DB954',
              lineHeight: 1, letterSpacing: '-2px',
              textShadow: '0 0 40px rgba(29,185,84,0.3)',
            }}>
              {formatHours(profile.estimatedListeningHours)}
            </div>
            <div style={{ fontSize: 14, color: '#666', textTransform: 'uppercase', letterSpacing: 3, marginTop: 4 }}>
              listening hours
            </div>
          </div>

          {/* Genre */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const }}>
            {profile.topGenres.slice(0, 3).map(genre => (
              <span key={genre} style={{
                padding: '4px 12px', borderRadius: 20,
                background: `${getGenreColor(genre)}15`,
                color: getGenreColor(genre),
                border: `1px solid ${getGenreColor(genre)}30`,
                fontSize: 12, fontWeight: 500,
              }}>
                {genre}
              </span>
            ))}
          </div>

          {/* Top 3 artists */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {profile.topArtists.slice(0, 3).map((artist, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  fontSize: 11, fontWeight: 700, color: '#1DB954',
                  width: 16, textAlign: 'center' as const,
                }}>
                  {i + 1}
                </span>
                <span style={{ fontSize: 14, color: '#ccc' }}>{artist.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Building icon */}
        <div style={{ opacity: 0.8, flexShrink: 0 }}>
          <BuildingIcon color={color} style={profile.topGenres[0] || 'modern'} />
        </div>
      </div>

      {/* Bottom: watermark */}
      <div style={{
        position: 'relative', zIndex: 1,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{ fontSize: 12, color: '#444' }}>
          spotifycity.app | built by @codanium_
        </div>
        <div style={{
          fontSize: 14, fontWeight: 600, color: '#1DB954',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <span style={{ fontSize: 18 }}>🏙️</span> Spotify City
        </div>
      </div>
    </div>
  );
}

export default function ShareCard({ profile, onClose, rank }: ShareCardProps) {
  const portraitRef = useRef<HTMLDivElement>(null);
  const landscapeRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [format, setFormat] = useState<'portrait' | 'landscape'>('portrait');

  const primaryColor = getGenreColor(profile.topGenres[0] || '');

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const { default: html2canvas } = await import('html2canvas-pro');
      const ref = format === 'portrait' ? portraitRef : landscapeRef;
      if (!ref.current) return;
      const canvas = await html2canvas(ref.current, {
        backgroundColor: '#0a0a0a',
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fade-in" />
      <div
        className="relative z-10 flex flex-col items-center gap-4 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Format toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setFormat('portrait')}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              format === 'portrait'
                ? 'bg-[#1DB954] text-black'
                : 'glass text-gray-400 hover:text-white'
            }`}
          >
            📱 Stories
          </button>
          <button
            onClick={() => setFormat('landscape')}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              format === 'landscape'
                ? 'bg-[#1DB954] text-black'
                : 'glass text-gray-400 hover:text-white'
            }`}
          >
            🐦 Twitter
          </button>
        </div>

        {/* Card preview */}
        <div className="rounded-2xl overflow-hidden glow-green-strong" style={{ maxWidth: '90vw', maxHeight: '60vh', overflow: 'auto' }}>
          <div style={{ transform: 'scale(0.7)', transformOrigin: 'top center' }}>
            <div ref={portraitRef} style={{ display: format === 'portrait' ? 'block' : 'none' }}>
              <CardContent profile={profile} rank={rank} format="portrait" color={primaryColor} />
            </div>
            <div ref={landscapeRef} style={{ display: format === 'landscape' ? 'block' : 'none' }}>
              <CardContent profile={profile} rank={rank} format="landscape" color={primaryColor} />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="rounded-xl bg-[#1DB954] px-6 py-3 text-sm font-bold text-black transition-all hover:bg-[#1ed760] disabled:opacity-50"
          >
            {downloading ? 'Downloading...' : '⬇ Download Card'}
          </button>
          <button
            onClick={onClose}
            className="rounded-xl glass px-6 py-3 text-sm font-medium text-gray-400 hover:text-white transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
