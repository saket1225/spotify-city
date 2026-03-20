'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import type { TimeOfDay } from './City';

// --- Procedural sound generators ---

interface SoundLayer {
  nodes: AudioNode[];
  gain: GainNode;
}

function createWhiteNoise(ctx: AudioContext, duration = 2): AudioBuffer {
  const buf = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return buf;
}

function createNightscape(ctx: AudioContext, master: GainNode): SoundLayer {
  const gain = ctx.createGain();
  gain.gain.value = 0;
  gain.connect(master);
  const nodes: AudioNode[] = [];

  // Deep city hum ~65Hz
  const hum = ctx.createOscillator();
  hum.type = 'sine';
  hum.frequency.value = 65;
  const humGain = ctx.createGain();
  humGain.gain.value = 0.4;
  hum.connect(humGain).connect(gain);
  hum.start();
  nodes.push(hum, humGain);

  // Second harmonic ~130Hz quiet
  const hum2 = ctx.createOscillator();
  hum2.type = 'sine';
  hum2.frequency.value = 130;
  const hum2Gain = ctx.createGain();
  hum2Gain.gain.value = 0.08;
  hum2.connect(hum2Gain).connect(gain);
  hum2.start();
  nodes.push(hum2, hum2Gain);

  // Crickets: high freq filtered noise, pulsing
  const noiseBuf = createWhiteNoise(ctx);
  const crickets = ctx.createBufferSource();
  crickets.buffer = noiseBuf;
  crickets.loop = true;
  const cricketBP = ctx.createBiquadFilter();
  cricketBP.type = 'bandpass';
  cricketBP.frequency.value = 4800;
  cricketBP.Q.value = 12;
  const cricketGain = ctx.createGain();
  cricketGain.gain.value = 0.06;
  // Pulse the crickets with an LFO
  const cricketLFO = ctx.createOscillator();
  cricketLFO.type = 'square';
  cricketLFO.frequency.value = 7;
  const cricketLFOGain = ctx.createGain();
  cricketLFOGain.gain.value = 0.04;
  cricketLFO.connect(cricketLFOGain).connect(cricketGain.gain);
  cricketLFO.start();
  crickets.connect(cricketBP).connect(cricketGain).connect(gain);
  crickets.start();
  nodes.push(crickets, cricketBP, cricketGain, cricketLFO, cricketLFOGain);

  // Occasional distant horn effect via slow-swept oscillator
  const horn = ctx.createOscillator();
  horn.type = 'sawtooth';
  horn.frequency.value = 320;
  const hornFilter = ctx.createBiquadFilter();
  hornFilter.type = 'lowpass';
  hornFilter.frequency.value = 600;
  const hornGain = ctx.createGain();
  hornGain.gain.value = 0;
  // Trigger horn periodically
  const hornPulse = () => {
    if (hornGain.gain) {
      const t = ctx.currentTime;
      hornGain.gain.setValueAtTime(0, t);
      hornGain.gain.linearRampToValueAtTime(0.015, t + 0.05);
      hornGain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
    }
  };
  const hornInterval = setInterval(hornPulse, 8000 + Math.random() * 12000);
  horn.connect(hornFilter).connect(hornGain).connect(gain);
  horn.start();
  nodes.push(horn, hornFilter, hornGain);
  (gain as any)._intervals = [hornInterval];

  return { nodes, gain };
}

function createDawnscape(ctx: AudioContext, master: GainNode): SoundLayer {
  const gain = ctx.createGain();
  gain.gain.value = 0;
  gain.connect(master);
  const nodes: AudioNode[] = [];

  // Gentle wind: filtered white noise
  const noiseBuf = createWhiteNoise(ctx);
  const wind = ctx.createBufferSource();
  wind.buffer = noiseBuf;
  wind.loop = true;
  const windLP = ctx.createBiquadFilter();
  windLP.type = 'lowpass';
  windLP.frequency.value = 800;
  const windGain = ctx.createGain();
  windGain.gain.value = 0.12;
  // Slow modulation on wind
  const windLFO = ctx.createOscillator();
  windLFO.frequency.value = 0.15;
  const windLFOGain = ctx.createGain();
  windLFOGain.gain.value = 0.05;
  windLFO.connect(windLFOGain).connect(windGain.gain);
  windLFO.start();
  wind.connect(windLP).connect(windGain).connect(gain);
  wind.start();
  nodes.push(wind, windLP, windGain, windLFO, windLFOGain);

  // Birds: multiple oscillators with randomized chirp patterns
  const birdIntervals: ReturnType<typeof setInterval>[] = [];
  for (let i = 0; i < 3; i++) {
    const bird = ctx.createOscillator();
    bird.type = 'sine';
    bird.frequency.value = 1800 + i * 400;
    const birdGain = ctx.createGain();
    birdGain.gain.value = 0;
    bird.connect(birdGain).connect(gain);
    bird.start();
    nodes.push(bird, birdGain);

    const chirp = () => {
      const t = ctx.currentTime;
      const baseFreq = 1800 + i * 400 + Math.random() * 600;
      bird.frequency.setValueAtTime(baseFreq, t);
      bird.frequency.linearRampToValueAtTime(baseFreq + 300 + Math.random() * 400, t + 0.06);
      bird.frequency.linearRampToValueAtTime(baseFreq - 100, t + 0.12);
      birdGain.gain.setValueAtTime(0, t);
      birdGain.gain.linearRampToValueAtTime(0.025, t + 0.02);
      birdGain.gain.linearRampToValueAtTime(0.03, t + 0.06);
      birdGain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    };
    birdIntervals.push(setInterval(chirp, 2000 + Math.random() * 4000 + i * 1500));
  }
  (gain as any)._intervals = birdIntervals;

  return { nodes, gain };
}

function createDayscape(ctx: AudioContext, master: GainNode): SoundLayer {
  const gain = ctx.createGain();
  gain.gain.value = 0;
  gain.connect(master);
  const nodes: AudioNode[] = [];

  // City bustle: layered bandpass-filtered noise
  const noiseBuf = createWhiteNoise(ctx);
  const bands = [400, 1200, 2800];
  bands.forEach(freq => {
    const src = ctx.createBufferSource();
    src.buffer = noiseBuf;
    src.loop = true;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = freq;
    bp.Q.value = 1.5;
    const g = ctx.createGain();
    g.gain.value = freq < 1000 ? 0.15 : 0.06;
    src.connect(bp).connect(g).connect(gain);
    src.start();
    nodes.push(src, bp, g);
  });

  // Bright shimmer oscillator
  const shimmer = ctx.createOscillator();
  shimmer.type = 'triangle';
  shimmer.frequency.value = 2200;
  const shimmerGain = ctx.createGain();
  shimmerGain.gain.value = 0.008;
  const shimmerLFO = ctx.createOscillator();
  shimmerLFO.frequency.value = 0.3;
  const shimmerLFOGain = ctx.createGain();
  shimmerLFOGain.gain.value = 0.006;
  shimmerLFO.connect(shimmerLFOGain).connect(shimmerGain.gain);
  shimmerLFO.start();
  shimmer.connect(shimmerGain).connect(gain);
  shimmer.start();
  nodes.push(shimmer, shimmerGain, shimmerLFO, shimmerLFOGain);

  return { nodes, gain };
}

function createSunsetscape(ctx: AudioContext, master: GainNode): SoundLayer {
  const gain = ctx.createGain();
  gain.gain.value = 0;
  gain.connect(master);
  const nodes: AudioNode[] = [];

  // Warm low drone
  const drone = ctx.createOscillator();
  drone.type = 'sine';
  drone.frequency.value = 85;
  const droneGain = ctx.createGain();
  droneGain.gain.value = 0.2;
  drone.connect(droneGain).connect(gain);
  drone.start();
  nodes.push(drone, droneGain);

  // Warm filtered noise
  const noiseBuf = createWhiteNoise(ctx);
  const warm = ctx.createBufferSource();
  warm.buffer = noiseBuf;
  warm.loop = true;
  const warmLP = ctx.createBiquadFilter();
  warmLP.type = 'lowpass';
  warmLP.frequency.value = 500;
  const warmGain = ctx.createGain();
  warmGain.gain.value = 0.1;
  warm.connect(warmLP).connect(warmGain).connect(gain);
  warm.start();
  nodes.push(warm, warmLP, warmGain);

  // Mellow pad: detuned triangle waves
  [-3, 0, 4].forEach(detune => {
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.value = 220;
    osc.detune.value = detune * 100;
    const g = ctx.createGain();
    g.gain.value = 0.012;
    osc.connect(g).connect(gain);
    osc.start();
    nodes.push(osc, g);
  });

  return { nodes, gain };
}

// --- Main hook ---

const FADE_TIME = 2.5; // seconds

interface AmbientState {
  ctx: AudioContext;
  master: GainNode;
  layers: Record<TimeOfDay, SoundLayer>;
}

export function useAmbientSound(time: TimeOfDay) {
  const stateRef = useRef<AmbientState | null>(null);
  const activeRef = useRef<TimeOfDay | null>(null);
  const [muted, setMuted] = useState(() => {
    if (typeof window === 'undefined') return true;
    const saved = localStorage.getItem('spotify-city-sound-muted');
    return saved === null ? true : saved === 'true';
  });

  const init = useCallback(() => {
    if (stateRef.current) return stateRef.current;
    const ctx = new AudioContext();
    const master = ctx.createGain();
    master.gain.value = 0.07; // very low ambient volume
    master.connect(ctx.destination);

    const layers: Record<TimeOfDay, SoundLayer> = {
      night: createNightscape(ctx, master),
      dawn: createDawnscape(ctx, master),
      day: createDayscape(ctx, master),
      sunset: createSunsetscape(ctx, master),
    };

    stateRef.current = { ctx, master, layers };
    return stateRef.current;
  }, []);

  // Crossfade when time changes
  useEffect(() => {
    if (muted) return;
    const state = init();
    if (state.ctx.state === 'suspended') state.ctx.resume();

    const now = state.ctx.currentTime;
    // Fade out all, fade in active
    for (const key of Object.keys(state.layers) as TimeOfDay[]) {
      const layer = state.layers[key];
      layer.gain.gain.cancelScheduledValues(now);
      if (key === time) {
        layer.gain.gain.setTargetAtTime(1, now, FADE_TIME / 3);
      } else {
        layer.gain.gain.setTargetAtTime(0, now, FADE_TIME / 3);
      }
    }
    activeRef.current = time;
  }, [time, muted, init]);

  // Handle mute/unmute
  useEffect(() => {
    localStorage.setItem('spotify-city-sound-muted', String(muted));
    const state = stateRef.current;
    if (!state) return;

    if (muted) {
      state.ctx.suspend();
    } else {
      state.ctx.resume();
    }
  }, [muted]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      const state = stateRef.current;
      if (!state) return;
      // Clear all intervals
      for (const layer of Object.values(state.layers)) {
        const intervals = (layer.gain as any)._intervals as ReturnType<typeof setInterval>[] | undefined;
        intervals?.forEach(clearInterval);
      }
      state.ctx.close();
      stateRef.current = null;
    };
  }, []);

  const toggle = useCallback(() => {
    // Init on first user interaction (browser autoplay policy)
    init();
    setMuted(m => !m);
  }, [init]);

  return { muted, toggle };
}

// --- Speaker button component ---

export function SpeakerButton({ muted, onToggle }: { muted: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      title={muted ? 'Enable ambient sound' : 'Mute ambient sound'}
      className="w-11 h-11 sm:w-9 sm:h-9 rounded-[10px] flex items-center justify-center transition-all duration-200 cursor-pointer"
      style={{
        border: !muted ? '2px solid rgba(29,185,84,0.8)' : '1px solid rgba(255,255,255,0.1)',
        background: !muted ? 'rgba(29,185,84,0.15)' : 'rgba(8,9,10,0.7)',
        backdropFilter: 'blur(10px)',
        color: !muted ? '#1DB954' : 'rgba(255,255,255,0.5)',
        boxShadow: !muted ? '0 0 12px rgba(29,185,84,0.3)' : 'none',
      }}
    >
      {muted ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 5 6 9H2v6h4l5 4V5Z" />
          <line x1="23" y1="9" x2="17" y2="15" />
          <line x1="17" y1="9" x2="23" y2="15" />
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 5 6 9H2v6h4l5 4V5Z" />
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        </svg>
      )}
    </button>
  );
}
