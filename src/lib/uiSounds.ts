// Procedural UI sound effects via Web Audio API
// All sounds are subtle, premium, and minimal

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  // Respect mute state
  if (localStorage.getItem('spotify-city-sound-muted') === 'true') return null;
  if (!ctx || ctx.state === 'closed') {
    ctx = new AudioContext();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

/** Short plucky synth note — pitch varies with building height */
export function playBuildingClick(height: number = 1) {
  const c = getCtx();
  if (!c) return;
  const t = c.currentTime;
  // Map height (roughly 0.5–6) to frequency (220–880 Hz)
  const freq = 220 + Math.min(height, 6) * 110;

  const osc = c.createOscillator();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(freq, t);
  osc.frequency.exponentialRampToValueAtTime(freq * 1.5, t + 0.03);
  osc.frequency.exponentialRampToValueAtTime(freq * 0.8, t + 0.12);

  const gain = c.createGain();
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(0.1, t + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

  osc.connect(gain).connect(c.destination);
  osc.start(t);
  osc.stop(t + 0.16);
}

/** Soft low whoosh — filtered noise burst */
export function playPanelClose() {
  const c = getCtx();
  if (!c) return;
  const t = c.currentTime;

  const buf = c.createBuffer(1, c.sampleRate * 0.15, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

  const src = c.createBufferSource();
  src.buffer = buf;

  const lp = c.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.setValueAtTime(800, t);
  lp.frequency.exponentialRampToValueAtTime(200, t + 0.12);

  const gain = c.createGain();
  gain.gain.setValueAtTime(0.08, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

  src.connect(lp).connect(gain).connect(c.destination);
  src.start(t);
}

/** Camera shutter — white noise burst with bandpass sweep */
export function playScreenshotCapture() {
  const c = getCtx();
  if (!c) return;
  const t = c.currentTime;

  const buf = c.createBuffer(1, c.sampleRate * 0.2, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

  const src = c.createBufferSource();
  src.buffer = buf;

  const bp = c.createBiquadFilter();
  bp.type = 'bandpass';
  bp.Q.value = 2;
  bp.frequency.setValueAtTime(3000, t);
  bp.frequency.exponentialRampToValueAtTime(600, t + 0.15);

  const gain = c.createGain();
  gain.gain.setValueAtTime(0.12, t);
  gain.gain.linearRampToValueAtTime(0.15, t + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

  src.connect(bp).connect(gain).connect(c.destination);
  src.start(t);
}

/** Subtle click — very short sine pulse */
export function playModeSwitch() {
  const c = getCtx();
  if (!c) return;
  const t = c.currentTime;

  const osc = c.createOscillator();
  osc.type = 'sine';
  osc.frequency.value = 660;

  const gain = c.createGain();
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(0.07, t + 0.003);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

  osc.connect(gain).connect(c.destination);
  osc.start(t);
  osc.stop(t + 0.05);
}
