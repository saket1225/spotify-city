'use client';

import { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useSession, signIn } from 'next-auth/react';
import { getSampleBuildings } from '@/lib/sampleData';
import { generateBuildingParams } from '@/lib/buildingGenerator';
import { BuildingParams, SpotifyProfile } from '@/types';
import ProfileCard from '@/components/ProfileCard';
import ShareCard from '@/components/ShareCard';
import CityStats from '@/components/CityStats';
import confetti from 'canvas-confetti';
import { playPanelClose, playScreenshotCapture } from '@/lib/uiSounds';

const City = dynamic(() => import('@/components/City'), { ssr: false });

/* ── Confetti burst (once per session) ── */
let confettiFired = false;
function fireConfetti() {
  if (confettiFired) return;
  confettiFired = true;
  const colors = ['#1DB954', '#FFD700', '#FFFFFF'];
  const end = Date.now() + 2500;
  const frame = () => {
    confetti({
      particleCount: 8,
      angle: 90 + (Math.random() - 0.5) * 60,
      spread: 80,
      origin: { x: 0.5, y: 1 },
      colors,
      gravity: 0.8,
      scalar: 1.1,
      ticks: 120,
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  };
  // Initial big burst
  confetti({ particleCount: 200, spread: 100, origin: { x: 0.5, y: 1 }, colors, gravity: 0.7, scalar: 1.2, ticks: 150 });
  requestAnimationFrame(frame);
}

/* ── Bottom stats bar ── */
function StatsBar({ buildings }: { buildings: BuildingParams[] }) {
  const stats = useMemo(() => {
    const totalHours = buildings.reduce((sum, b) => sum + (b.profile.estimatedListeningHours || 0), 0);
    let tallest = buildings[0];
    for (const b of buildings) {
      if ((b.profile.estimatedListeningHours || 0) > (tallest?.profile.estimatedListeningHours || 0)) tallest = b;
    }
    return {
      listeners: buildings.length.toLocaleString(),
      hours: totalHours.toLocaleString(),
      tallestName: tallest?.profile.displayName || tallest?.profile.topArtists?.[0]?.name || 'Unknown',
      tallestHours: (tallest?.profile.estimatedListeningHours || 0).toLocaleString(),
    };
  }, [buildings]);

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-10">
      <p className="text-xs text-gray-500 tracking-wide">
        {stats.listeners} listeners · {stats.hours} total hours · tallest: {stats.tallestName} ({stats.tallestHours}h)
      </p>
    </div>
  );
}

/* ── Metrics legend ── */
function MetricsLegend() {
  return (
    <div className="fixed bottom-5 left-5 z-10 hidden sm:flex flex-col gap-0.5 opacity-50">
      <p className="text-[10px] text-gray-500 tracking-wide">↕ Height = Listening Hours</p>
      <p className="text-[10px] text-gray-500 tracking-wide">↔ Width = Genre Diversity</p>
    </div>
  );
}

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
          className="text-sm sm:text-base tracking-widest uppercase font-medium"
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

/* ── Landing hero: title + sign in + demo city behind ── */
function HeroOverlay({ onExploreDemo }: { onExploreDemo: () => void }) {
  const [cityCount, setCityCount] = useState(12847);

  useEffect(() => {
    const interval = setInterval(() => {
      setCityCount((c) => c + Math.floor(Math.random() * 3) + 1);
    }, 2000 + Math.random() * 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-40 overflow-y-auto">
      {/* Dark vignette overlay - darker edges, transparent center */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 50% at center, rgba(8,9,10,0.15) 0%, rgba(8,9,10,0.5) 40%, rgba(8,9,10,0.8) 70%, rgba(8,9,10,0.92) 100%)' }}
      />

      {/* Hero section */}
      <div className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <div className="flex flex-col items-center gap-5">
          <h1
            className="font-pixel text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-[0.25em] text-[#1DB954]"
            style={{
              textShadow: '0 0 60px rgba(29,185,84,0.5), 0 0 120px rgba(29,185,84,0.25), 0 0 4px rgba(29,185,84,0.8)',
              animation: 'fadeScaleIn 0.8s ease-out',
            }}
          >
            SPOTIFY CITY
          </h1>

          <p className="text-gray-400 text-base sm:text-xl tracking-wide max-w-md font-light leading-relaxed">
            Your music taste, visualized as a city.
          </p>

          <p className="text-sm text-gray-500 opacity-50" style={{ fontFamily: 'var(--font-inter), system-ui, sans-serif' }}>
            {cityCount.toLocaleString()} cities built
          </p>

          <button
            onClick={() => signIn('spotify')}
            className="mt-4 flex items-center justify-center gap-3 w-full max-w-xs px-8 py-3 rounded-full text-sm sm:text-base font-semibold tracking-wide transition-all duration-200 hover:scale-[1.03] hover:shadow-lg hover:shadow-[#1DB954]/30 active:scale-95"
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
  const [screenshotMode, setScreenshotMode] = useState(false);
  const [captureFlash, setCaptureFlash] = useState(false);
  const [onboardingTip, setOnboardingTip] = useState(-1); // -1 = not started, 0/1/2 = tip index, 3 = done
  const [statsOpen, setStatsOpen] = useState(false);
  const [cityRevealTime, setCityRevealTime] = useState<number | null>(null);
  const constructionDoneRef = useRef(false);

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

  // Hide loading after delay for Three.js init, fire confetti on reveal
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
      fireConfetti();
    }, 4800);
    return () => clearTimeout(timer);
  }, []);

  // Auto-dismiss hero when already authenticated
  useEffect(() => {
    if (status === 'authenticated') {
      setHeroVisible(false);
      if (!constructionDoneRef.current) { setCityRevealTime(performance.now()); constructionDoneRef.current = true; }
    }
  }, [status]);

  // Onboarding tips for first-time users
  useEffect(() => {
    if (heroVisible || loading || onboardingTip >= 0) return;
    if (typeof window !== 'undefined' && localStorage.getItem('spotify-city-tutorial-seen')) return;
    setOnboardingTip(0);
    const t1 = setTimeout(() => setOnboardingTip(1), 3500);
    const t2 = setTimeout(() => setOnboardingTip(2), 7000);
    const t3 = setTimeout(() => {
      setOnboardingTip(3);
      localStorage.setItem('spotify-city-tutorial-seen', '1');
    }, 10500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [heroVisible, loading, onboardingTip]);

  const skipOnboarding = useCallback(() => {
    setOnboardingTip(3);
    localStorage.setItem('spotify-city-tutorial-seen', '1');
  }, []);

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    setIsMobile(/Mobi|Android/i.test(navigator.userAgent));
  }, []);
  const onboardingTips = [
    'Click any building to see the artist',
    isMobile ? 'Touch and drag to explore' : 'Use WASD or drag to explore',
    'Press ? for all shortcuts',
  ];

  // Escape to close panels or exit screenshot mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (screenshotMode) { setScreenshotMode(false); return; }
        if (statsOpen) { playPanelClose(); setStatsOpen(false); return; }
        if (selectedBuilding) { playPanelClose(); setSelectedBuilding(null); return; }
        if (shareCardBuilding) { playPanelClose(); setShareCardBuilding(null); return; }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedBuilding, shareCardBuilding, screenshotMode]);

  // Capture screenshot from WebGL canvas
  const handleCapture = useCallback(() => {
    const canvas = document.querySelector('canvas') as HTMLCanvasElement | null;
    if (!canvas) return;
    playScreenshotCapture();
    setCaptureFlash(true);
    setTimeout(() => setCaptureFlash(false), 200);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'spotify-city.png';
      a.click();
      URL.revokeObjectURL(url);
    }, 'image/png');
  }, []);

  // User's name and hours for the bottom stat
  const userName = userProfile?.displayName || (status === 'authenticated' ? session?.user?.name : null);

  return (
    <div className="film-grain relative flex h-screen w-screen flex-col overflow-hidden bg-[#08090a]">
      {/* Loading Screen */}
      {loading && <SkylineLoader stats={loadingStats} />}

      {/* Hero Overlay */}
      {!loading && heroVisible && (
        <HeroOverlay onExploreDemo={() => { setHeroVisible(false); if (!constructionDoneRef.current) { setCityRevealTime(performance.now()); constructionDoneRef.current = true; } setCityLoading(true); setTimeout(() => setCityLoading(false), 3000); }} />
      )}

      {/* City loading indicator */}
      {cityLoading && (
        <div className="fixed inset-0 z-20 flex items-center justify-center pointer-events-none animate-pulse">
          <p className="text-sm text-gray-500 tracking-widest font-light">Loading city...</p>
        </div>
      )}

      {/* Minimal header: title left, avatar right */}
      {!heroVisible && !loading && !screenshotMode && (
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
          hideControls={heroVisible || loading || screenshotMode}
          revealTime={cityRevealTime}
        />
      </main>

      {/* Bottom center stats bar + metrics legend */}
      {!heroVisible && !loading && !screenshotMode && (
        <>
          <StatsBar buildings={allBuildings} />
          <MetricsLegend />
        </>
      )}

      {/* Floating Share button */}
      {!heroVisible && !loading && !screenshotMode && (
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
          onClose={() => { playPanelClose(); setSelectedBuilding(null); }}
          onShare={handleShareFromProfile}
        />
      )}

      {/* Share Card Modal */}
      {shareCardBuilding && (
        <ShareCard
          profile={shareCardBuilding.profile}
          onClose={() => { playPanelClose(); setShareCardBuilding(null); }}
        />
      )}


      {/* Screenshot mode toolbar */}
      {screenshotMode && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-full px-5 py-2.5"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <button
            onClick={handleCapture}
            className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-black transition-all hover:scale-105 active:scale-95"
            style={{ background: '#1DB954' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
              <polyline points="16 6 12 2 8 6"/>
              <line x1="12" y1="2" x2="12" y2="15"/>
            </svg>
            Capture
          </button>
          <button
            onClick={() => setScreenshotMode(false)}
            className="rounded-full px-4 py-2 text-sm font-medium transition-all hover:scale-105 active:scale-95"
            style={{ color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.15)' }}
          >
            Exit
          </button>
        </div>
      )}

      {/* Capture flash */}
      {captureFlash && (
        <div className="fixed inset-0 z-[100] pointer-events-none bg-white/30" style={{ animation: 'fadeOut 200ms ease-out forwards' }} />
      )}

      {/* Screenshot mode button (in controls area) */}
      {!heroVisible && !loading && !screenshotMode && (
        <button
          onClick={() => setScreenshotMode(true)}
          title="Screenshot Mode"
          className="fixed top-[60px] right-[60px] sm:right-[56px] z-20 w-8 h-8 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center transition-all duration-200 cursor-pointer"
          style={{
            border: '1px solid rgba(255,255,255,0.06)',
            background: 'rgba(8,9,10,0.6)',
            backdropFilter: 'blur(8px)',
            color: 'rgba(255,255,255,0.4)',
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
            <circle cx="12" cy="13" r="4"/>
          </svg>
        </button>
      )}

      {/* City Stats button */}
      {!heroVisible && !loading && !screenshotMode && (
        <button
          onClick={() => setStatsOpen(true)}
          title="City Stats"
          className="fixed top-[60px] right-[100px] sm:right-[92px] z-20 w-8 h-8 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center transition-all duration-200 cursor-pointer"
          style={{
            border: '1px solid rgba(255,255,255,0.06)',
            background: 'rgba(8,9,10,0.6)',
            backdropFilter: 'blur(8px)',
            color: 'rgba(255,255,255,0.4)',
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="12" width="4" height="9" rx="1" />
            <rect x="10" y="7" width="4" height="14" rx="1" />
            <rect x="17" y="3" width="4" height="18" rx="1" />
          </svg>
        </button>
      )}

      {/* City Stats Panel */}
      {statsOpen && (
        <CityStats
          buildings={allBuildings}
          cityName={userName ? `${userName}'s City` : 'Demo City'}
          onClose={() => { playPanelClose(); setStatsOpen(false); }}
        />
      )}

      {/* Onboarding tips */}
      {onboardingTip >= 0 && onboardingTip < 3 && (
        <div
          key={onboardingTip}
          className="fixed bottom-20 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 rounded-full px-6 py-3 text-sm text-white/90"
          style={{
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(12px)',
            animation: 'tipFadeInOut 3.5s ease forwards',
          }}
        >
          <span>{onboardingTips[onboardingTip]}</span>
          <button onClick={skipOnboarding} className="text-white/40 hover:text-white/70 text-xs ml-1 transition-colors">Skip</button>
        </div>
      )}

      <style jsx>{`
        @keyframes tipFadeInOut {
          0% { opacity: 0; transform: translateX(-50%) translateY(8px); }
          12% { opacity: 1; transform: translateX(-50%) translateY(0); }
          80% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
