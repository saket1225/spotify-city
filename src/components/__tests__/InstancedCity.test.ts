import { describe, it, expect } from 'vitest';

describe('InstancedCity', () => {
  it('can be imported without errors', async () => {
    // InstancedCity uses 'use client' and React Three Fiber hooks,
    // so we just verify the module resolves without throwing
    const mod = await import('../InstancedCity');
    expect(mod.default).toBeDefined();
    expect(typeof mod.default).toBe('function');
  });
});
