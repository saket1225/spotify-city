'use client';

import { useEffect } from 'react';

interface KeyboardShortcutsProps {
  open: boolean;
  onClose: () => void;
}

const groups = [
  {
    title: 'Movement',
    shortcuts: [
      { keys: ['W', 'A', 'S', 'D'], desc: 'Move around' },
      { keys: ['↑', '←', '↓', '→'], desc: 'Move around' },
      { keys: ['Space'], desc: 'Fly up' },
      { keys: ['Shift'], desc: 'Fly down' },
      { keys: ['Scroll'], desc: 'Change altitude' },
    ],
  },
  {
    title: 'Camera',
    shortcuts: [
      { keys: ['Drag'], desc: 'Look around' },
      { keys: ['Right-click drag'], desc: 'Look around' },
    ],
  },
  {
    title: 'Time of Day',
    shortcuts: [
      { keys: ['🌙', '🌅', '☀️', '🌇'], desc: 'Use panel buttons (top-right)' },
    ],
  },
  {
    title: 'Interface',
    shortcuts: [
      { keys: ['?'], desc: 'Toggle this panel' },
      { keys: ['Esc'], desc: 'Close panels' },
      { keys: ['Click'], desc: 'Select building' },
      { keys: ['Double-click'], desc: 'Fly to building' },
    ],
  },
];

export default function KeyboardShortcuts({ open, onClose }: KeyboardShortcutsProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === '?') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.5)',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'rgba(8,9,10,0.85)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 16,
          padding: '24px 28px',
          maxWidth: 420,
          width: '90vw',
          color: 'white',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>
            Keyboard Shortcuts
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255,255,255,0.4)',
              cursor: 'pointer',
              fontSize: 18,
              padding: '0 4px',
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>

        {groups.map((group) => (
          <div key={group.title} style={{ marginBottom: 16 }}>
            <div style={{
              fontSize: 10,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#1DB954',
              marginBottom: 8,
            }}>
              {group.title}
            </div>
            {group.shortcuts.map((s, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '4px 0',
                }}
              >
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{s.desc}</span>
                <span style={{ display: 'flex', gap: 4 }}>
                  {s.keys.map((k) => (
                    <kbd
                      key={k}
                      style={{
                        background: 'rgba(255,255,255,0.08)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: 5,
                        padding: '2px 7px',
                        fontSize: 11,
                        fontFamily: 'system-ui',
                        color: 'rgba(255,255,255,0.7)',
                        minWidth: 20,
                        textAlign: 'center',
                      }}
                    >
                      {k}
                    </kbd>
                  ))}
                </span>
              </div>
            ))}
          </div>
        ))}

        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.08)',
          paddingTop: 12,
          marginTop: 4,
          fontSize: 11,
          color: 'rgba(255,255,255,0.3)',
          textAlign: 'center',
        }}>
          Press <kbd style={{
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 4,
            padding: '1px 5px',
            fontSize: 10,
          }}>?</kbd> or <kbd style={{
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 4,
            padding: '1px 5px',
            fontSize: 10,
          }}>Esc</kbd> to close
        </div>
      </div>
    </div>
  );
}
