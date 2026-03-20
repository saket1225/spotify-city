'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useSession, signIn } from 'next-auth/react';
import { getSampleBuildings } from '@/lib/sampleData';
import { generateBuildingParams } from '@/lib/buildingGenerator';
import { BuildingParams, SpotifyProfile } from '@/types';
import ProfileCard from '@/components/ProfileCard';
import ShareCard from '@/components/ShareCard';

const City = dynamic(() => import('@/components/City'), { ssr: false });

/* ── Storytelling loading phases ── */
const LOADING_PHASES = [
  'Scanning your library...',
  'Mapping your genres...',
  'Building your skyline...',
  'Welcome to your city',
];

/* ── Loading screen: skyline rises from the ground ── */
function SkylineLoader({ stats }: { stats: string | null }) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((p) => Math.min(p + 0.02, 1));
    }, 30);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 1000),
      setTimeout(() => setPhase(2), 2000),
      setTimeout(() => setPhase(3), 3200),
      setTimeout(() => setFadeOut(true), 4000),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const buildings = useMemo(() => {
    const b: { x: number; w: number; maxH: number }[] = [];
    for (let i = 0; i < 28; i++) {
      const seed = Math.sin(i * 127.1 + 311.7) * 43758.5453;
      const r = seed - Math.floor(seed);
      b.push({ x: i * 14 + 2, w: 8 + r * 5, maxH: 20 + r * 80 });
    }
    return b;
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#08090a]"
      style={{
        opacity: fadeOut ? 0 : 1,
        transition: 'opacity 0.8s ease-out',
      }}
    >
      <div className="flex flex-col items-center gap-8">
        <div className="relative w-[280px] sm:w-[380px] h-[100px] sm:h-[120px] overflow-hidden">
          <svg width="100%" height="100%" viewBox="0 0 390 120" preserveAspectRatio="xMidYMid meet">
            {buildings.map((b, i) => {
              const delay = i / buildings.length;
              const localProgress = Math.max(0, Math.min(1, (progress - delay * 0.5) / 0.5));
              const eased = 1 - Math.pow(1 - localProgress, 3);
              const h = b.maxH * eased;
              return (
                <rect
                  key={i}
                  x={b.x}
                  y={120 - h}
                  width={b.w}
                  height={h}
                  fill={localProgress > 0.8 ? '#1DB954' : '#1a1a2e'}
                  opacity={0.4 + localProgress * 0.6}
                  rx={1}
                />
              );
            })}
            <line x1="0" y1="119" x2="390" y2="119" stroke="#1DB954" strokeWidth="1" opacity="0.4" />
          </svg>
        </div>
        <p
          className="font-pixel text-lg tracking-wide"
          style={{
            color: phase === 3 ? '#1DB954' : '#9ca3af',
            transition: 'color 0.5s ease',
          }}
        >
          {LOADING_PHASES[phase]}
        </p>
        {stats && phase < 3 && (
          <p className="text-sm text-gray-500 animate-pulse">{stats}</p>
        )}
      </div>
    </div>
  );
}

/* ── Feature cards data ── */
const FEATURES = [
  { emoji: '\u{1F3D9}\uFE0F', title: 'Unique Buildings', desc: 'Each artist becomes a distinct building styled by their genre' },
  { emoji: '\u{1F305}', title: 'Dynamic Scenes', desc: 'Experience your city in night, dawn, day, and sunset' },
  { emoji: '\u{1F6B6}', title: 'Explore Mode', desc: 'Walk through your city with free camera controls' },
];

/* ── Landing hero: title + sign in + demo city behind ── */
function HeroOverlay({ onExploreDemo }: { onExploreDemo: () => void }) {
  return (
    <div className="fixed inset-0 z-40 overflow-y-auto">
      {/* Dark vignette overlay - more transparent to show city */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, rgba(8,9,10,0.3) 0%, rgba(8,9,10,0.6) 50%, rgba(8,9,10,0.7) 100%)' }}
      />

      {/* Hero section */}
      <div className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <div className="flex flex-col items-center gap-5">
          <h1
            className="font-pixel text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-bold tracking-[0.2em] text-[#1DB954]"
            style={{
              textShadow: '0 0 60px rgba(29,185,84,0.5), 0 0 120px rgba(29,185,84,0.25), 0 0 4px rgba(29,185,84,0.8)',
            }}
          >
            SPOTIFY CITY
          </h1>

          <p className="text-gray-400 text-sm sm:text-lg tracking-wide max-w-md font-light">
            Your music. Your city.
          </p>

          <p className="text-gray-600 text-xs sm:text-sm tracking-wide max-w-sm font-light">
            Your listening history, visualized as a 3D city skyline
          </p>

          <button
            onClick={() => signIn('spotify')}
            className="mt-4 flex items-center justify-center gap-3 w-full max-w-xs px-8 py-3 rounded-full text-sm sm:text-base font-semibold tracking-wide transition-all duration-200 hover:scale-105 hover:shadow-[0_0_40px_rgba(29,185,84,0.4)] active:scale-95"
            style={{
              background: '#1DB954',
              color: '#000',
              boxShadow: '0 0 20px rgba(29,185,84,0.3)',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
            </svg>
            Sign in with Spotify
          </button>

          <button
            onClick={onExploreDemo}
            className="mt-1 flex items-center justify-center gap-2 w-full max-w-xs px-8 py-3 rounded-full text-sm font-medium tracking-wide transition-all duration-200 hover:scale-105 hover:border-[#1DB954]/60 hover:text-gray-200 active:scale-95"
            style={{
              background: 'transparent',
              color: 'rgba(255,255,255,0.5)',
              border: '1px solid rgba(255,255,255,0.15)',
            }}
          >
            Explore Demo City
          </button>

        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(29,185,84,0.5)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'drop-shadow(0 0 8px rgba(29,185,84,0.3))' }}>
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>

        {/* Attribution */}
        <p className="absolute bottom-4 right-5 text-gray-600 text-[10px] tracking-wider">
          built by <span className="text-gray-500">@codanium_</span>
        </p>
      </div>

      {/* Feature cards below the fold */}
      <div className="relative px-4 sm:px-6 pb-16 sm:pb-20 -mt-8">
        <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl p-5 sm:p-8 text-center transition-all duration-300 hover:scale-[1.03] hover:border-[#1DB954]/20"
              style={{
                background: 'rgba(255,255,255,0.06)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <div className="text-3xl mb-4">{f.emoji}</div>
              <h3 className="text-white/90 text-base font-semibold tracking-wide mb-2">{f.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const { data: session, status } = useSession();
  const [selectedBuilding, setSelectedBuilding] = useState<BuildingParams | null>(null);
  const [shareCardBuilding, setShareCardBuilding] = useState<BuildingParams | null>(null);
  const [loading, setLoading] = useState(true);
  const [heroVisible, setHeroVisible] = useState(true);
  const [userProfile, setUserProfile] = useState<SpotifyProfile | null>(null);
  const [focusPosition, setFocusPosition] = useState<[number, number, number] | null>(null);
  const [loadingStats, setLoadingStats] = useState<string | null>(null);
  const [cityLoading, setCityLoading] = useState(false);

  // Fetch real Spotify data when signed in
  useEffect(() => {
    if (status !== 'authenticated' || !session?.accessToken) return;
    let cancelled = false;
    setLoadingStats('Analyzing your music...');
    fetch('/api/spotify')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data && !data.error) {
          setLoadingStats(`Analyzing ${data.estimatedListeningHours.toLocaleString()} hours of music...`);
          setTimeout(() => {
            setUserProfile(data);
          }, 800);
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [status, session?.accessToken]);

  const sampleBuildings = useMemo(() => getSampleBuildings(), []);

  const allBuildings = useMemo(() => {
    if (!userProfile) return sampleBuildings;
    const userBuilding = {
      ...generateBuildingParams(userProfile, 0),
      isCurrentUser: true,
    };
    const reindexed = sampleBuildings.map((b, i) => ({
      ...generateBuildingParams(b.profile, i + 1),
    }));
    return [userBuilding, ...reindexed];
  }, [userProfile, sampleBuildings]);

  const handleBuildingClick = (building: BuildingParams) => {
    setSelectedBuilding(building);
  };

  const handleShareFromProfile = () => {
    if (selectedBuilding) {
      setShareCardBuilding(selectedBuilding);
      setSelectedBuilding(null);
    }
  };

  // Hide loading after delay for Three.js init
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 4800);
    return () => clearTimeout(timer);
  }, []);

  // Auto-dismiss hero when already authenticated
  useEffect(() => {
    if (status === 'authenticated') setHeroVisible(false);
  }, [status]);

  // Escape to close panels
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedBuilding) { setSelectedBuilding(null); return; }
        if (shareCardBuilding) { setShareCardBuilding(null); return; }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedBuilding, shareCardBuilding]);

  // User's name and hours for the bottom stat
  const userName = userProfile?.displayName || (status === 'authenticated' ? session?.user?.name : null);
  const userHours = userProfile?.estimatedListeningHours;

  return (
    <div className="film-grain relative flex h-screen w-screen flex-col overflow-hidden bg-[#08090a]">
      {/* Loading Screen */}
      {loading && <SkylineLoader stats={loadingStats} />}

      {/* Hero Overlay */}
      {!loading && heroVisible && (
        <HeroOverlay onExploreDemo={() => { setHeroVisible(false); setCityLoading(true); setTimeout(() => setCityLoading(false), 3000); }} />
      )}

      {/* City loading indicator */}
      {cityLoading && (
        <div className="fixed inset-0 z-20 flex items-center justify-center pointer-events-none animate-pulse">
          <p className="text-sm text-gray-500 tracking-widest font-light">Loading city...</p>
        </div>
      )}

      {/* Minimal header: title left, avatar right */}
      {!heroVisible && !loading && (
        <header className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-5 py-4">
          <span
            className="font-pixel text-sm tracking-[0.15em] text-[#1DB954]"
            style={{ textShadow: '0 0 20px rgba(29,185,84,0.3)' }}
          >
            SPOTIFY CITY
          </span>
          {session?.user?.image ? (
            <img
              src={session.user.image}
              alt=""
              className="h-8 w-8 rounded-full ring-1 ring-white/10"
            />
          ) : session?.user?.name ? (
            <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-gray-400">
              {session.user.name.charAt(0).toUpperCase()}
            </div>
          ) : null}
        </header>
      )}

      {/* 3D City - full viewport */}
      <main className="fixed inset-0">
        <City
          buildings={allBuildings}
          onBuildingClick={handleBuildingClick}
          focusPosition={focusPosition}
          hideControls={heroVisible || loading}
        />
      </main>

      {/* Bottom stat: user name + hours */}
      {!heroVisible && !loading && userName && userHours && (
        <div className="fixed bottom-5 left-5 z-10">
          <p className="text-xs text-gray-500 tracking-wide">
            <span className="text-gray-400 font-medium">{userName}</span>
            {"'s City — "}
            <span className="text-[#1DB954]">{userHours.toLocaleString()}h</span> listened
          </p>
        </div>
      )}

      {/* Floating Share button */}
      {!heroVisible && !loading && (
        <button
          onClick={() => {
            const myBuilding = allBuildings.find((b) => b.isCurrentUser) || allBuildings[0];
            if (myBuilding) setShareCardBuilding(myBuilding);
          }}
          className="fixed bottom-5 right-5 z-10 flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-black transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(29,185,84,0.4)] active:scale-95"
          style={{ background: '#1DB954', boxShadow: '0 0 15px rgba(29,185,84,0.25)' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
            <polyline points="16 6 12 2 8 6" />
            <line x1="12" y1="2" x2="12" y2="15" />
          </svg>
          Share
        </button>
      )}

      {/* Profile Card Overlay (slide-in from right on building click) */}
      {selectedBuilding && (
        <ProfileCard
          profile={selectedBuilding.profile}
          building={selectedBuilding}
          allBuildings={allBuildings}
          onClose={() => setSelectedBuilding(null)}
          onShare={handleShareFromProfile}
        />
      )}

      {/* Share Card Modal */}
      {shareCardBuilding && (
        <ShareCard
          profile={shareCardBuilding.profile}
          onClose={() => setShareCardBuilding(null)}
        />
      )}
    </div>
  );
}
