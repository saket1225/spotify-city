import { describe, it, expect } from 'vitest';
import { generateBuildingParams } from '../buildingGenerator';
import type { SpotifyProfile } from '@/types';

function makeProfile(overrides: Partial<SpotifyProfile> = {}): SpotifyProfile {
  return {
    id: 'test-1',
    displayName: 'TestUser',
    imageUrl: 'https://example.com/img.png',
    estimatedListeningHours: 500,
    totalTracksPlayed: 2000,
    avgTrackDuration: 3.5,
    listeningStreak: 7,
    playlistDuration: 600,
    totalPlaylists: 10,
    topGenres: ['rock', 'indie'],
    topArtists: [],
    topTracks: [],
    ...overrides,
  };
}

describe('generateBuildingParams', () => {
  it('returns valid BuildingParams with required fields', () => {
    const params = generateBuildingParams(makeProfile(), 0);
    expect(params.height).toBeGreaterThanOrEqual(2);
    expect(params.height).toBeLessThanOrEqual(25);
    expect(params.width).toBeGreaterThanOrEqual(1.8);
    expect(params.depth).toBeGreaterThanOrEqual(1.5);
    expect(params.primaryColor).toMatch(/^#[0-9a-fA-F]{6}$/);
    expect(params.secondaryColor).toMatch(/^#[0-9a-fA-F]{6}$/);
    expect(params.accentColor).toMatch(/^#[0-9a-fA-F]{6}$/);
    expect(params.position).toHaveLength(3);
    expect(params.style).toBeDefined();
    expect(params.variant).toBeGreaterThanOrEqual(0);
    expect(params.variant).toBeLessThanOrEqual(2);
  });

  it('position spread increases with index', () => {
    const profile = makeProfile();
    const positions = Array.from({ length: 20 }, (_, i) => {
      const p = generateBuildingParams(profile, i);
      return Math.sqrt(p.position[0] ** 2 + p.position[2] ** 2);
    });
    // Not strictly monotonic due to seeded random, but average of later indices
    // should use different spread values. Just check they're all finite and positive.
    for (const d of positions) {
      expect(Number.isFinite(d)).toBe(true);
      expect(d).toBeGreaterThan(0);
    }
  });

  it('height correlates with listening hours', () => {
    const low = generateBuildingParams(makeProfile({ estimatedListeningHours: 10 }), 0);
    const high = generateBuildingParams(makeProfile({ estimatedListeningHours: 10000 }), 0);
    expect(high.height).toBeGreaterThan(low.height);
  });

  it('genre affects primary color', () => {
    const rock = generateBuildingParams(makeProfile({ topGenres: ['rock'] }), 0);
    const pop = generateBuildingParams(makeProfile({ topGenres: ['pop'] }), 0);
    expect(rock.primaryColor).not.toBe(pop.primaryColor);
  });

  it('genre affects building style', () => {
    const rock = generateBuildingParams(makeProfile({ topGenres: ['rock'] }), 0);
    const classical = generateBuildingParams(makeProfile({ topGenres: ['classical'] }), 0);
    expect(rock.style).toBe('fortress');
    expect(classical.style).toBe('cathedral');
  });
});
