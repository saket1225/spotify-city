'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useSession, signIn } from 'next-auth/react';
import { getSampleBuildings } from '@/lib/sampleData';
import { generateBuildingParams } from '@/lib/buildingGenerator';
import { BuildingParams, SpotifyProfile } from '@/types';
import ProfileCard from '@/components/ProfileCard';
import LoginButton from '@/components/LoginButton';
import SearchBar from '@/components/SearchBar';
import ShareCard from '@/components/ShareCard';
import Leaderboard from '@/components/Leaderboard';
import CompareMode from '@/components/CompareMode';
import InviteFriends from '@/components/InviteFriends';
import CityNav from '@/components/CityNav';
import Footer from '@/components/Footer';

const City = dynamic(() => import('@/components/City'), { ssr: false });

function AnimatedTitle() {
  const text = 'SPOTIFY CITY';
  const [revealed, setRevealed] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setRevealed((p) => {
        if (p >= text.length) { clearInterval(timer); return p; }
        return p + 1;
      });
    }, 80);
    return () => clearInterval(timer);
  }, []);

  return (
    <h1 className="font-pixel text-xl sm:text-2xl font-bold tracking-widest whitespace-nowrap">
      {text.split('').map((char, i) => (
        <span
          key={i}
          className={`inline-block transition-all duration-300 ${
            i < revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}
          style={{
            color: i < revealed ? '#1DB954' : 'transparent',
            textShadow: i < revealed ? '0 0 30px rgba(29,185,84,0.4)' : 'none',
            transitionDelay: `${i * 40}ms`,
          }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </h1>
  );
}

function TypewriterSubtitle() {
  const text = 'Your music. Your city. Your building.';
  const [chars, setChars] = useState(0);

  useEffect(() => {
    const delay = setTimeout(() => {
      const timer = setInterval(() => {
        setChars((p) => {
          if (p >= text.length) { clearInterval(timer); return p; }
          return p + 1;
        });
      }, 40);
      return () => clearInterval(timer);
    }, 1200);
    return () => clearTimeout(delay);
  }, []);

  return (
    <p className="text-[10px] sm:text-xs text-gray-500 h-4 mt-1">
      {text.slice(0, chars)}
      {chars < text.length && <span className="inline-block w-[2px] h-3 bg-gray-500 ml-[1px] animate-pulse" />}
    </p>
  );
}

function AnimatedCount({ count, active }: { count: number; active: boolean }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!active) return;
    let frame: number;
    const start = performance.now();
    const duration = 1500;
    const animate = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * count));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [count, active]);

  return <span>{display}</span>;
}

function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050510]">
      <div className="flex flex-col items-center gap-6">
        <div className="loading-dot w-4 h-4 rounded-full bg-[#1DB954]" />
        <p className="font-pixel text-lg text-gray-400 tracking-wide">Building your city...</p>
      </div>
    </div>
  );
}

function HeroOverlay({ onSignIn }: { onSignIn: () => void }) {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  const handleSignIn = () => {
    setFading(true);
    setTimeout(() => setVisible(false), 600);
    signIn('spotify');
    onSignIn();
  };

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-40 flex flex-col items-center justify-center transition-opacity duration-500 ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{ background: 'radial-gradient(ellipse at center, rgba(5,5,16,0.7) 0%, rgba(5,5,16,0.92) 70%)' }}
    >
      <div className="flex flex-col items-center gap-6 px-6 text-center">
        {/* Title */}
        <h1
          className="font-pixel text-5xl sm:text-7xl md:text-8xl font-bold tracking-[0.2em] text-[#1DB954]"
          style={{
            textShadow: '0 0 60px rgba(29,185,84,0.5), 0 0 120px rgba(29,185,84,0.25), 0 0 4px rgba(29,185,84,0.8)',
          }}
        >
          SPOTIFY CITY
        </h1>

        {/* Tagline */}
        <p className="text-gray-400 text-sm sm:text-lg tracking-wide max-w-md">
          See your music taste as a city skyline
        </p>

        {/* Sign in button */}
        <button
          onClick={handleSignIn}
          className="mt-6 px-10 py-4 rounded-full text-base sm:text-lg font-semibold tracking-wide transition-all duration-200 hover:scale-105 hover:shadow-[0_0_40px_rgba(29,185,84,0.4)] active:scale-95"
          style={{
            background: '#1DB954',
            color: '#000',
            boxShadow: '0 0 20px rgba(29,185,84,0.3)',
          }}
        >
          Sign in with Spotify
        </button>

        {/* Explore without signing in */}
        <button
          onClick={() => { setFading(true); setTimeout(() => setVisible(false), 600); onSignIn(); }}
          className="mt-2 text-gray-500 text-xs tracking-wider hover:text-gray-300 transition-colors"
        >
          or explore the demo city
        </button>

        {/* Credit */}
        <p className="mt-10 text-gray-600 text-xs tracking-wider">
          Built by <span className="text-gray-500">@codanium_</span>
        </p>
      </div>
    </div>
  );
}

export default function Home() {
  const { data: session, status } = useSession();
  const [selectedBuilding, setSelectedBuilding] = useState<BuildingParams | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const [shareCardBuilding, setShareCardBuilding] = useState<BuildingParams | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [heroVisible, setHeroVisible] = useState(true);
  const [userProfile, setUserProfile] = useState<SpotifyProfile | null>(null);

  // Fetch real Spotify data when signed in
  useEffect(() => {
    if (status !== 'authenticated' || !session?.accessToken) return;
    let cancelled = false;
    fetch('/api/spotify')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data && !data.error) setUserProfile(data);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [status, session?.accessToken]);

  const sampleBuildings = useMemo(() => getSampleBuildings(), []);

  // Merge user building (index 0, marked as current user) with sample buildings
  const allBuildings = useMemo(() => {
    if (!userProfile) return sampleBuildings;
    const userBuilding = {
      ...generateBuildingParams(userProfile, 0),
      isCurrentUser: true,
    };
    // Re-index sample buildings starting at 1 so positions don't overlap
    const reindexed = sampleBuildings.map((b, i) => ({
      ...generateBuildingParams(b.profile, i + 1),
    }));
    return [userBuilding, ...reindexed];
  }, [userProfile, sampleBuildings]);

  const buildings = useMemo(() => {
    if (!searchQuery.trim()) return allBuildings;
    const q = searchQuery.toLowerCase();
    return allBuildings.filter(
      (b) =>
        b.profile.displayName.toLowerCase().includes(q) ||
        b.profile.topGenres.some((g) => g.toLowerCase().includes(q)) ||
        b.profile.topArtists.some((a) => a.name.toLowerCase().includes(q))
    );
  }, [allBuildings, searchQuery]);

  // Get rank for a building (by listening hours)
  const getRank = (building: BuildingParams): number => {
    const sorted = [...allBuildings].sort(
      (a, b) => b.profile.estimatedListeningHours - a.profile.estimatedListeningHours
    );
    return sorted.findIndex(b => b.profile.id === building.profile.id) + 1;
  };

  const handleBuildingClick = (building: BuildingParams) => {
    setSelectedBuilding(building);
  };

  const handleShareFromProfile = () => {
    if (selectedBuilding) {
      setShareCardBuilding(selectedBuilding);
      setSelectedBuilding(null);
    }
  };

  // Hide loading after a delay for Three.js init
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2200);
    return () => clearTimeout(timer);
  }, []);

  // Auto-dismiss hero when already authenticated
  useEffect(() => {
    if (status === 'authenticated') setHeroVisible(false);
  }, [status]);

  return (
    <div className="relative flex h-screen w-screen flex-col overflow-hidden bg-[#050510]">
      {/* Loading Screen */}
      {loading && <LoadingScreen />}

      {/* Hero Overlay - shown before sign in */}
      {!loading && heroVisible && (
        <HeroOverlay onSignIn={() => setHeroVisible(false)} />
      )}

      {/* Header - glass bar */}
      <header className="fixed top-0 left-0 right-0 z-40 glass-strong">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 max-w-full">
          {/* Left: Title + Subtitle */}
          <div className="flex-shrink-0 min-w-0">
            <AnimatedTitle />
            <TypewriterSubtitle />
          </div>

          {/* Center: Search */}
          <div className="hidden sm:block flex-1 max-w-sm mx-4">
            <SearchBar onSearch={setSearchQuery} />
          </div>

          {/* Right: Login */}
          <div className="flex-shrink-0">
            <LoginButton />
          </div>
        </div>

        {/* Mobile search - below header on small screens */}
        <div className="sm:hidden px-4 pb-3">
          <SearchBar onSearch={setSearchQuery} />
        </div>
      </header>

      {/* 3D City - full viewport */}
      <main className="fixed inset-0">
        <City buildings={buildings} onBuildingClick={handleBuildingClick} />
      </main>

      {/* Building count */}
      <div className="fixed bottom-3 left-3 sm:bottom-5 sm:left-5 z-10">
        <div className="glass rounded-lg sm:rounded-xl px-3 py-1.5 sm:px-4 sm:py-2 glow-green">
          <span className="text-xs sm:text-sm font-semibold text-[#1DB954]">
            <AnimatedCount count={buildings.length} active={!loading} />
          </span>
          <span className="text-[10px] sm:text-xs text-gray-500 ml-1 sm:ml-2">buildings in the city</span>
        </div>
      </div>

      {/* Floating Nav */}
      <CityNav
        onResetCamera={() => {}}
        onFindMyBuilding={() => {
          const myBuilding = allBuildings.find((b) => b.isCurrentUser);
          if (myBuilding) {
            setSelectedBuilding(myBuilding);
          } else if (allBuildings.length > 0) {
            setSelectedBuilding(allBuildings[0]);
          }
        }}
        onOpenLeaderboard={() => setLeaderboardOpen(true)}
        onOpenShareCard={() => {
          if (allBuildings.length > 0) {
            setShareCardBuilding(allBuildings[0]);
          }
        }}
        onOpenInvite={() => setInviteOpen(true)}
        onOpenCompare={() => setCompareOpen(true)}
      />

      {/* Footer */}
      <Footer />

      {/* Profile Card Overlay */}
      {selectedBuilding && (
        <ProfileCard
          profile={selectedBuilding.profile}
          onClose={() => setSelectedBuilding(null)}
          onShare={handleShareFromProfile}
          allBuildings={allBuildings}
        />
      )}

      {/* Share Card Modal */}
      {shareCardBuilding && (
        <ShareCard
          profile={shareCardBuilding.profile}
          rank={getRank(shareCardBuilding)}
          onClose={() => setShareCardBuilding(null)}
        />
      )}

      {/* Leaderboard */}
      <Leaderboard
        buildings={allBuildings}
        isOpen={leaderboardOpen}
        onClose={() => setLeaderboardOpen(false)}
        onBuildingClick={(b) => {
          setLeaderboardOpen(false);
          setSelectedBuilding(b);
        }}
      />

      {/* Compare Mode */}
      <CompareMode
        buildings={allBuildings}
        isOpen={compareOpen}
        onClose={() => setCompareOpen(false)}
      />

      {/* Invite Friends */}
      <InviteFriends
        isOpen={inviteOpen}
        onClose={() => setInviteOpen(false)}
      />
    </div>
  );
}
