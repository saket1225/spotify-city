'use client';

import { useMemo, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { getSampleBuildings } from '@/lib/sampleData';
import { BuildingParams } from '@/types';
import ProfileCard from '@/components/ProfileCard';
import LoginButton from '@/components/LoginButton';
import SearchBar from '@/components/SearchBar';

const City = dynamic(() => import('@/components/City'), { ssr: false });

function AnimatedTitle() {
  const text = 'Spotify City';
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
    <h1 className="text-2xl font-bold tracking-tight">
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
    <p className="text-xs text-gray-500 h-4">
      {text.slice(0, chars)}
      {chars < text.length && <span className="inline-block w-[2px] h-3 bg-gray-500 ml-[1px] animate-pulse" />}
    </p>
  );
}

function AnimatedCount({ count }: { count: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
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
  }, [count]);

  return <span>{display}</span>;
}

export default function Home() {
  const [selectedBuilding, setSelectedBuilding] = useState<BuildingParams | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const allBuildings = useMemo(() => getSampleBuildings(), []);

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

  return (
    <div className="relative flex h-screen w-screen flex-col overflow-hidden bg-[#050510]">
      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4">
        <div className="glass rounded-2xl px-5 py-3">
          <AnimatedTitle />
          <TypewriterSubtitle />
        </div>
        <div className="flex items-center gap-3">
          <div className="glass rounded-xl">
            <SearchBar onSearch={setSearchQuery} />
          </div>
          <div className="glass rounded-xl">
            <LoginButton />
          </div>
        </div>
      </header>

      {/* 3D City */}
      <main className="flex-1">
        <City buildings={buildings} onBuildingClick={setSelectedBuilding} />
      </main>

      {/* Building count */}
      <div className="absolute bottom-5 left-5 z-10">
        <div className="glass rounded-xl px-4 py-2 glow-green">
          <span className="text-sm font-semibold text-[#1DB954]">
            <AnimatedCount count={buildings.length} />
          </span>
          <span className="text-xs text-gray-500 ml-2">buildings in the city</span>
        </div>
      </div>

      {/* Profile Card Overlay */}
      {selectedBuilding && (
        <ProfileCard
          profile={selectedBuilding.profile}
          onClose={() => setSelectedBuilding(null)}
        />
      )}
    </div>
  );
}
