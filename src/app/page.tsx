'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { generateDemoBuildings } from '@/lib/buildingGenerator';
import { BuildingParams } from '@/types';
import ProfileCard from '@/components/ProfileCard';
import LoginButton from '@/components/LoginButton';
import SearchBar from '@/components/SearchBar';

const City = dynamic(() => import('@/components/City'), { ssr: false });

export default function Home() {
  const [selectedBuilding, setSelectedBuilding] = useState<BuildingParams | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const allBuildings = useMemo(() => generateDemoBuildings(), []);

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
    <div className="relative flex h-screen w-screen flex-col overflow-hidden bg-[#0a0a0a]">
      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4">
        <div>
          <h1 className="font-pixel text-2xl text-[#1DB954]">Spotify City</h1>
          <p className="text-xs text-gray-500">Your music. Your city. Your building.</p>
        </div>
        <div className="flex items-center gap-4">
          <SearchBar onSearch={setSearchQuery} />
          <LoginButton />
        </div>
      </header>

      {/* 3D City */}
      <main className="flex-1">
        <City buildings={buildings} onBuildingClick={setSelectedBuilding} />
      </main>

      {/* Building count */}
      <div className="absolute bottom-4 left-4 z-10">
        <span className="font-pixel text-xs text-gray-600">
          {buildings.length} buildings
        </span>
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
