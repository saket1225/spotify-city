'use client';

export default function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-20 pointer-events-none">
      <div className="flex items-center justify-center px-6 py-3">
        <a
          href="https://x.com/codanium_"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] text-white/20 hover:text-white/50 transition-colors pointer-events-auto"
        >
          built by @codanium_
        </a>
      </div>
    </footer>
  );
}
