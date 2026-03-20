'use client';

import { useRef, useCallback, useEffect, useState } from 'react';

interface VirtualJoystickProps {
  onMove: (dx: number, dy: number) => void; // normalized -1 to 1
  size?: number;
}

export default function VirtualJoystick({ onMove, size = 120 }: VirtualJoystickProps) {
  const outerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const touchIdRef = useRef<number | null>(null);
  const centerRef = useRef({ x: 0, y: 0 });
  const maxRadius = size / 2 - 20;
  const animRef = useRef<number>(0);
  const posRef = useRef({ x: 0, y: 0 });

  const handleStart = useCallback((e: React.TouchEvent) => {
    if (touchIdRef.current !== null) return;
    const touch = e.changedTouches[0];
    touchIdRef.current = touch.identifier;
    const rect = outerRef.current!.getBoundingClientRect();
    centerRef.current = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    setActive(true);
    setPos({ x: 0, y: 0 });
    posRef.current = { x: 0, y: 0 };
  }, []);

  const handleMove = useCallback((e: React.TouchEvent) => {
    if (touchIdRef.current === null) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier !== touchIdRef.current) continue;
      let dx = touch.clientX - centerRef.current.x;
      let dy = touch.clientY - centerRef.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > maxRadius) {
        dx = (dx / dist) * maxRadius;
        dy = (dy / dist) * maxRadius;
      }
      setPos({ x: dx, y: dy });
      posRef.current = { x: dx / maxRadius, y: dy / maxRadius };
    }
  }, [maxRadius]);

  const handleEnd = useCallback((e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === touchIdRef.current) {
        touchIdRef.current = null;
        setActive(false);
        setPos({ x: 0, y: 0 });
        posRef.current = { x: 0, y: 0 };
        onMove(0, 0);
      }
    }
  }, [onMove]);

  // Continuously emit move events while active
  useEffect(() => {
    const loop = () => {
      const p = posRef.current;
      if (p.x !== 0 || p.y !== 0) {
        onMove(p.x, p.y);
      }
      animRef.current = requestAnimationFrame(loop);
    };
    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [onMove]);

  return (
    <div
      ref={outerRef}
      onTouchStart={handleStart}
      onTouchMove={handleMove}
      onTouchEnd={handleEnd}
      onTouchCancel={handleEnd}
      style={{
        position: 'absolute',
        bottom: 80,
        left: 24,
        width: size,
        height: size,
        borderRadius: '50%',
        background: active ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)',
        border: `1px solid rgba(255,255,255,${active ? 0.2 : 0.1})`,
        zIndex: 25,
        touchAction: 'none',
        transition: 'background 0.2s, border 0.2s',
      }}
    >
      {/* Inner knob */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: 40,
          height: 40,
          borderRadius: '50%',
          background: active ? 'rgba(29,185,84,0.4)' : 'rgba(255,255,255,0.12)',
          border: `1px solid ${active ? 'rgba(29,185,84,0.6)' : 'rgba(255,255,255,0.15)'}`,
          transform: `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px))`,
          transition: active ? 'none' : 'transform 0.2s ease-out, background 0.2s, border 0.2s',
        }}
      />
    </div>
  );
}
