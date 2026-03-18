'use client';

export default function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-20 pointer-events-none">
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-3 pointer-events-auto">
          <span className="text-xs font-semibold text-[#1DB954]/60">
            Spotify City
          </span>
        </div>
        <a
          href="https://x.com/codanium_"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-gray-600 hover:text-gray-400 transition-colors pointer-events-auto"
        >
          built by @codanium_
        </a>
      </div>
    </footer>
  );
}
