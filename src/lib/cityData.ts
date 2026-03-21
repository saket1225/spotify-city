import type { CityData } from '@/types';

function mulberry32(a: number) {
  return function() {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}

const DISTRICTS = [
  { center: [0, 0], radius: 400, color: [1, 0.41, 0.71] },         // pop - pink
  { center: [800, -600], radius: 350, color: [1, 0.13, 0.27] },    // rock - red
  { center: [-700, -500], radius: 350, color: [1, 0.84, 0] },      // hiphop - gold
  { center: [-600, 700], radius: 350, color: [0, 1, 1] },          // electronic - cyan
  { center: [700, 600], radius: 350, color: [0.22, 1, 0.56] },     // indie - green
  { center: [0, -900], radius: 350, color: [0.67, 0.4, 1] },       // classical - purple
];

// Genre distribution weights (cumulative)
const GENRE_WEIGHTS = [0.25, 0.40, 0.55, 0.65, 0.75, 0.80, 0.85, 0.90, 0.95, 1.0];
// Maps to: pop, rock, hiphop, electronic, indie, classical, classical, indie, rock, pop
const GENRE_MAP = [0, 1, 2, 3, 4, 5, 5, 4, 1, 0];

const FIRST_NAMES = ['Luna','Kai','Nova','Jax','Aria','Zion','Maya','Leo','Sage','Raven','Echo','Phoenix','Atlas','Lyra','Orion','Jade','Rio','Sky','Ash','Quinn'];
const SUFFIXES = ['Beats','Wave','Sound','Mix','Flow','Tone','Bass','Vibe','Tune','Drop','Loop','Sync','Pulse','Rush','Glow'];

export function generateMillionCity(count: number = 1000000): CityData {
  const rand = mulberry32(42);
  const positions = new Float32Array(count * 3);
  const scales = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const genreIndices = new Uint8Array(count);
  const names: string[] = new Array(count);
  const hours = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    // Genre
    const r = rand();
    let gi = 0;
    for (let g = 0; g < GENRE_WEIGHTS.length; g++) {
      if (r < GENRE_WEIGHTS[g]) { gi = GENRE_MAP[g]; break; }
    }
    genreIndices[i] = gi;
    const d = DISTRICTS[gi];

    // Height (power law)
    const h = Math.pow(rand(), 3) * 23 + 2;
    hours[i] = Math.round(h * 400);
    const w = 1.5 + rand() * 2.5;
    const depth = 1.2 + rand() * 2.3;
    scales[i*3] = w;
    scales[i*3+1] = h;
    scales[i*3+2] = depth;

    // Position in district
    const angle = rand() * Math.PI * 2;
    const heightNorm = (h - 2) / 23;
    const distFactor = (1 - heightNorm) * 0.8 + 0.1;
    const spread = (rand() * d.radius * distFactor) + 3;
    positions[i*3] = d.center[0] + Math.cos(angle) * spread;
    positions[i*3+1] = 0;
    positions[i*3+2] = d.center[1] + Math.sin(angle) * spread;

    // Color (genre color with slight variation)
    const cv = 0.85 + rand() * 0.3;
    colors[i*3] = d.color[0] * cv;
    colors[i*3+1] = d.color[1] * cv;
    colors[i*3+2] = d.color[2] * cv;

    // Name
    const fi = (i * 7 + 13) % FIRST_NAMES.length;
    const si = (i * 11 + 3) % SUFFIXES.length;
    names[i] = FIRST_NAMES[fi] + SUFFIXES[si] + (i > 300 ? i : '');
  }

  return { count, positions, scales, colors, genreIndices, names, hours };
}
