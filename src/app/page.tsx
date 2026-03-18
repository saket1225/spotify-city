"use client";

import dynamic from "next/dynamic";
import LoginButton from "@/components/LoginButton";
import SearchBar from "@/components/SearchBar";

const City = dynamic(() => import("@/components/City"), { ssr: false });

export default function Home() {
  return (
    <main className="relative flex flex-col h-screen overflow-hidden bg-black">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-40 flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-[#1DB954]" />
          <h1 className="text-xl font-bold font-[family-name:var(--font-silkscreen)] text-white tracking-wider">
            SPOTIFY CITY
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <SearchBar />
          <LoginButton />
        </div>
      </header>

      {/* Hero overlay */}
      <div className="absolute inset-0 z-30 flex flex-col items-center justify-center pointer-events-none">
        <div className="text-center mb-8 pointer-events-auto">
          <h2 className="text-6xl font-bold font-[family-name:var(--font-silkscreen)] text-white mb-3 tracking-widest drop-shadow-[0_0_30px_rgba(29,185,84,0.3)]">
            SPOTIFY
            <br />
            <span className="text-[#1DB954]">CITY</span>
          </h2>
          <p className="text-zinc-500 text-sm font-[family-name:var(--font-silkscreen)] max-w-md mx-auto">
            Your music taste, built into a city. Sign in with Spotify to see
            your building.
          </p>
        </div>
      </div>

      {/* 3D City Canvas */}
      <div className="flex-1">
        <City />
      </div>

      {/* Bottom bar */}
      <div className="absolute bottom-0 left-0 right-0 z-40 flex items-center justify-between px-6 py-3 bg-gradient-to-t from-black/80 to-transparent">
        <p className="text-zinc-600 text-xs font-[family-name:var(--font-silkscreen)]">
          15 buildings in the city
        </p>
        <p className="text-zinc-600 text-xs font-[family-name:var(--font-silkscreen)]">
          click a building to explore
        </p>
      </div>
    </main>
  );
}
