import { describe, it, expect } from 'vitest';
import { generateMillionCity } from '../cityData';

describe('generateMillionCity', () => {
  const COUNT = 1000;
  const data = generateMillionCity(COUNT);

  it('returns correct count', () => {
    expect(data.count).toBe(COUNT);
  });

  it('positions has correct length (count*3)', () => {
    expect(data.positions.length).toBe(COUNT * 3);
  });

  it('scales has correct length (count*3)', () => {
    expect(data.scales.length).toBe(COUNT * 3);
  });

  it('colors has correct length (count*3)', () => {
    expect(data.colors.length).toBe(COUNT * 3);
  });

  it('genreIndices has correct length', () => {
    expect(data.genreIndices.length).toBe(COUNT);
  });

  it('names has correct length', () => {
    expect(data.names.length).toBe(COUNT);
  });

  it('hours has correct length', () => {
    expect(data.hours.length).toBe(COUNT);
  });

  it('genre indices are all 0-5', () => {
    for (let i = 0; i < COUNT; i++) {
      expect(data.genreIndices[i]).toBeGreaterThanOrEqual(0);
      expect(data.genreIndices[i]).toBeLessThanOrEqual(5);
    }
  });

  it('all positions are finite numbers', () => {
    for (let i = 0; i < COUNT * 3; i++) {
      expect(Number.isFinite(data.positions[i])).toBe(true);
    }
  });

  it('heights are positive (scales[i*3+1] > 0)', () => {
    for (let i = 0; i < COUNT; i++) {
      expect(data.scales[i * 3 + 1]).toBeGreaterThan(0);
    }
  });

  it('hours are all positive', () => {
    for (let i = 0; i < COUNT; i++) {
      expect(data.hours[i]).toBeGreaterThan(0);
    }
  });

  it('seeded PRNG produces deterministic output', () => {
    const a = generateMillionCity(100);
    const b = generateMillionCity(100);
    expect(Array.from(a.positions)).toEqual(Array.from(b.positions));
    expect(Array.from(a.scales)).toEqual(Array.from(b.scales));
    expect(Array.from(a.colors)).toEqual(Array.from(b.colors));
    expect(Array.from(a.genreIndices)).toEqual(Array.from(b.genreIndices));
    expect(a.names).toEqual(b.names);
    expect(Array.from(a.hours)).toEqual(Array.from(b.hours));
  });
});
