import { describe, it, expect, vi, afterEach } from 'vitest';

describe('runtime config', () => {
  const networkId = '11'.repeat(32);

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it('loads and exposes valid config.json values', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        toriiEconometricsEndpointsEnabled: true,
        toriiBaseUrl: 'https://torii.example',
        networkId,
        kotodamaCompilerUrl: 'https://compiler.example',
        sorafsPublicBaseUrl: 'https://cdn.example',
        toriiFailoverEnabled: true,
        toriiFailoverNodes: ['https://nexus.mof3.sora.org:18080', 'https://testus.mof3.sora.org:18080'],
        toriiFailoverFailureThreshold: 5,
        toriiRequestTimeoutMs: 5000,
        toriiRequestRetryCount: 1,
        toriiRequestRetryBaseDelayMs: 200,
      }),
    });
    vi.stubGlobal('fetch', fetchMock as any);

    const module = await import('./runtime-config');

    await module.loadRuntimeConfig();
    expect(fetchMock).toHaveBeenCalledWith('/config.json', expect.any(Object));
    expect(module.getRuntimeConfig().toriiEconometricsEndpointsEnabled).toBe(true);
    expect(module.getRuntimeConfig().toriiBaseUrl).toBe('https://torii.example');
    expect(module.getRuntimeConfig().networkId).toBe(networkId);
    expect(module.getRuntimeConfig().kotodamaCompilerUrl).toBe('https://compiler.example');
    expect(module.getRuntimeConfig().sorafsPublicBaseUrl).toBe('https://cdn.example');
    expect(module.getRuntimeConfig().toriiFailoverEnabled).toBe(true);
    expect(module.getRuntimeConfig().toriiFailoverNodes).toEqual([
      'https://nexus.mof3.sora.org:18080',
      'https://testus.mof3.sora.org:18080',
    ]);
    expect(module.getRuntimeConfig().toriiFailoverFailureThreshold).toBe(5);
    expect(module.getRuntimeConfig().toriiRequestTimeoutMs).toBe(5000);
    expect(module.getRuntimeConfig().toriiRequestRetryCount).toBe(1);
    expect(module.getRuntimeConfig().toriiRequestRetryBaseDelayMs).toBe(200);
  });

  it('keeps defaults when config.json is missing', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({}),
    });
    vi.stubGlobal('fetch', fetchMock as any);

    const module = await import('./runtime-config');

    await module.loadRuntimeConfig();
    expect(module.getRuntimeConfig()).toEqual({});
  });

  it('rejects unknown public fields instead of retaining accidental secrets', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        toriiBaseUrl: 'https://torii.example',
        operatorToken: 'must-not-be-public',
      }),
    });
    vi.stubGlobal('fetch', fetchMock as any);

    const module = await import('./runtime-config');

    await module.loadRuntimeConfig();
    expect(module.getRuntimeConfig()).toEqual({});
  });

  it.each([
    ['uppercase', 'AA'.repeat(32)],
    ['wrong length', '11'.repeat(31)],
    ['unmarked final byte', `${'11'.repeat(31)}10`],
  ])('rejects an invalid %s NetworkId binding', async (_label, invalidNetworkId) => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        toriiBaseUrl: 'https://torii.example',
        networkId: invalidNetworkId,
      }),
    });
    vi.stubGlobal('fetch', fetchMock as any);

    const module = await import('./runtime-config');

    await module.loadRuntimeConfig();
    expect(module.getRuntimeConfig()).toEqual({});
  });
});
