'use client';

import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';

const GENRE_CHIPS = [
  { label: 'Pop', color: '#FF69B4' },
  { label: 'Rock', color: '#FF2244' },
  { label: 'Hip-Hop', color: '#FFD700' },
  { label: 'Electronic', color: '#00FFFF' },
  { label: 'Indie', color: '#39FF8F' },
  { label: 'Classical', color: '#AA66FF' },
  { label: 'Jazz', color: '#4488FF' },
  { label: 'Metal', color: '#FF3333' },
  { label: 'R&B', color: '#BF5FFF' },
  { label: 'Latin', color: '#FF5544' },
];

interface SearchBarProps {
  onSearch: (query: string) => void;
  onGenreFilter?: (genre: string | null) => void;
  showChips?: boolean;
}

export interface SearchBarHandle {
  focus: () => void;
}

const SearchBar = forwardRef<SearchBarHandle, SearchBarProps>(function SearchBar({ onSearch, onGenreFilter, showChips }, ref) {
  const [query, setQuery] = useState('');
  const [activeGenre, setActiveGenre] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
  }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  const handleGenreClick = (genre: string) => {
    const newGenre = activeGenre === genre ? null : genre;
    setActiveGenre(newGenre);
    onGenreFilter?.(newGenre);
    // Clear text search when selecting a genre
    if (newGenre) {
      setQuery('');
      onSearch('');
    }
  };

  // Clear genre when typing
  useEffect(() => {
    if (query.trim() && activeGenre) {
      setActiveGenre(null);
      onGenreFilter?.(null);
    }
  }, [query]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="w-full max-w-sm">
      <form onSubmit={handleSubmit} className="relative w-full">
        <svg
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); onSearch(e.target.value); }}
          placeholder="Search buildings...  ( / )"
          className="w-full rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-[#1DB954]"
        />
      </form>

      {/* Genre filter chips */}
      {showChips && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {GENRE_CHIPS.map(({ label, color }) => {
            const isActive = activeGenre === label;
            return (
              <button
                key={label}
                onClick={() => handleGenreClick(label)}
                className="rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-wide transition-all duration-200"
                style={{
                  backgroundColor: isActive ? `${color}30` : 'rgba(255,255,255,0.04)',
                  color: isActive ? color : 'rgba(255,255,255,0.35)',
                  border: `1px solid ${isActive ? `${color}50` : 'rgba(255,255,255,0.06)'}`,
                  boxShadow: isActive ? `0 0 12px ${color}25` : 'none',
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
});

export default SearchBar;
