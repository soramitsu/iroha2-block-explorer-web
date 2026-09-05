import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('runtime config', () => {
  const legacyNetworkId = '11'.repeat(32);
  const checkedNetworkId = `hash:${'AB'.repeat(32)}#B99E`;
  const configurationError = 'Explorer runtime configuration is unavailable or invalid.';
  const genericConfig = {
    toriiBaseUrl: 'https://taira.sora.org',
    toriiForceBaseUrl: true,
    networkId: checkedNetworkId,
  };
  const bpngConfig = {
    toriiBaseUrl: 'https://taira.sora.org',
    toriiForceBaseUrl: true,
    networkId: checkedNetworkId,
  };

  function useHost(hostname: string) {
    vi.stubGlobal('window', {
      location: { hostname },
      setTimeout: (handler: () => void, delay: number) => globalThis.setTimeout(handler, delay),
      clearTimeout: (timer: ReturnType<typeof setTimeout>) => globalThis.clearTimeout(timer),
    });
  }

  beforeEach(() => useHost('explorer.example'));

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it('loads and exposes valid config.json values', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        toriiEconometricsEndpointsEnabled: true,
        toriiBaseUrl: 'https://torii.example',
        networkId: checkedNetworkId,
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
    expect(module.getRuntimeConfig().networkId).toBe(checkedNetworkId);
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

  it('keeps defaults only for an optional 404 outside the BPNG host', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({}),
    });
    vi.stubGlobal('fetch', fetchMock as any);

    const module = await import('./runtime-config');

    await expect(module.loadRuntimeConfig()).resolves.toEqual({});
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

    await expect(module.loadRuntimeConfig()).rejects.toThrow(configurationError);
    expect(module.getRuntimeConfig()).toEqual({});
  });

  it.each([
    ['uppercase', 'AA'.repeat(32)],
    ['wrong length', '11'.repeat(31)],
    ['unmarked final byte', `${'11'.repeat(31)}10`],
  ])('rejects an invalid non-BPNG %s NetworkId binding', async (_label, invalidNetworkId) => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        toriiBaseUrl: 'https://torii.example',
        networkId: invalidNetworkId,
      }),
    });
    vi.stubGlobal('fetch', fetchMock as any);

    const module = await import('./runtime-config');

    await expect(module.loadRuntimeConfig()).rejects.toThrow(configurationError);
    expect(module.getRuntimeConfig()).toEqual({});
  });

  it('rejects retired raw lowercase NetworkId outside the BPNG host', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ networkId: legacyNetworkId }),
    }));
    const module = await import('./runtime-config');

    await expect(module.loadRuntimeConfig()).rejects.toThrow(configurationError);
    expect(module.getRuntimeConfig()).toEqual({});
  });

  it('accepts and preserves a checked v4 NetworkId outside the BPNG host', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ networkId: checkedNetworkId }),
    }));
    const module = await import('./runtime-config');

    await expect(module.loadRuntimeConfig()).resolves.toMatchObject({ networkId: checkedNetworkId });
    expect(module.getRuntimeConfig().networkId).toBe(checkedNetworkId);
  });

  it('rejects malformed JSON without exposing its body or using another config path', async () => {
    vi.stubEnv('BASE_URL', '/explorer/');
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => { throw new SyntaxError('private-response-content'); },
    });
    vi.stubGlobal('fetch', fetchMock);
    const module = await import('./runtime-config');

    await expect(module.loadRuntimeConfig()).rejects.toThrow(configurationError);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith('/explorer/config.json', expect.any(Object));
    expect(module.getRuntimeConfig()).toEqual({});
  });

  it.each([400, 401, 403, 429, 500, 502, 503])('rejects HTTP %s without a config fallback', async (status) => {
    vi.stubEnv('BASE_URL', '/explorer/');
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, status });
    vi.stubGlobal('fetch', fetchMock);
    const module = await import('./runtime-config');

    await expect(module.loadRuntimeConfig()).rejects.toThrow(configurationError);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(module.getRuntimeConfig()).toEqual({});
  });

  it('permits the existing root config lookup only after an optional subpath 404', async () => {
    vi.stubEnv('BASE_URL', '/explorer/');
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: false, status: 404 })
      .mockResolvedValueOnce({ ok: true, json: async () => genericConfig });
    vi.stubGlobal('fetch', fetchMock);
    const module = await import('./runtime-config');

    await expect(module.loadRuntimeConfig()).resolves.toEqual(genericConfig);
    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual(['/explorer/config.json', '/config.json']);
  });

  it('rejects a network error and permits an explicit fresh retry at the same location', async () => {
    const fetchMock = vi.fn()
      .mockRejectedValueOnce(new Error('private-transport-details'))
      .mockResolvedValueOnce({ ok: true, json: async () => genericConfig });
    vi.stubGlobal('fetch', fetchMock);
    const module = await import('./runtime-config');

    await expect(module.loadRuntimeConfig()).rejects.toThrow(configurationError);
    expect(module.getRuntimeConfig()).toEqual({});
    await expect(module.loadRuntimeConfig()).resolves.toEqual(genericConfig);
    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual(['/config.json', '/config.json']);
  });

  it('rejects timeout instead of starting with empty configuration', async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn((_url, options) => new Promise((_resolve, reject) => {
      options.signal.addEventListener('abort', () => reject(new Error('private-timeout-details')));
    }));
    vi.stubGlobal('fetch', fetchMock);
    const module = await import('./runtime-config');

    const rejectedLoad = expect(module.loadRuntimeConfig()).rejects.toThrow(configurationError);
    await vi.advanceTimersByTimeAsync(1500);
    await rejectedLoad;
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(module.getRuntimeConfig()).toEqual({});
  });

  it('shares and caches a successful configuration load', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => genericConfig });
    vi.stubGlobal('fetch', fetchMock);
    const module = await import('./runtime-config');

    await expect(Promise.all([module.loadRuntimeConfig(), module.loadRuntimeConfig()]))
      .resolves.toEqual([genericConfig, genericConfig]);
    await expect(module.loadRuntimeConfig()).resolves.toEqual(genericConfig);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('requires config on the BPNG host even when it returns 404', async () => {
    useHost('explorer-bpng.soramitsu.io');
    vi.stubEnv('BASE_URL', '/explorer/');
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 404 });
    vi.stubGlobal('fetch', fetchMock);
    const module = await import('./runtime-config');

    await expect(module.loadRuntimeConfig()).rejects.toThrow(configurationError);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['empty profile', {}],
    ['missing endpoint', { toriiForceBaseUrl: true, networkId: checkedNetworkId }],
    ['unforced endpoint', { ...bpngConfig, toriiForceBaseUrl: false }],
    ['missing NetworkId', { toriiBaseUrl: bpngConfig.toriiBaseUrl, toriiForceBaseUrl: true }],
    ['raw lowercase NetworkId', { ...bpngConfig, networkId: legacyNetworkId }],
    ['raw uppercase NetworkId', { ...bpngConfig, networkId: 'AB'.repeat(32) }],
    ['lowercase literal body', { ...bpngConfig, networkId: `hash:${'ab'.repeat(32)}#B99E` }],
    ['lowercase literal checksum', { ...bpngConfig, networkId: `hash:${'AB'.repeat(32)}#b99E` }],
    ['invalid checksum', { ...bpngConfig, networkId: checkedNetworkId.replace(/B99E$/u, '0000') }],
    ['missing checksum', { ...bpngConfig, networkId: `hash:${'AB'.repeat(32)}` }],
    ['unmarked checked hash', { ...bpngConfig, networkId: `hash:${'10'.repeat(32)}#2B24` }],
    ['surrounding NetworkId whitespace', { ...bpngConfig, networkId: ` ${checkedNetworkId}` }],
    ['alternate endpoint', { ...bpngConfig, toriiBaseUrl: 'https://other-torii.example' }],
    ['endpoint URL suffix', { ...bpngConfig, toriiBaseUrl: 'https://taira.sora.org/' }],
    ['optional failover settings', { ...bpngConfig, toriiFailoverEnabled: true }],
    ['optional settings', { ...bpngConfig, toriiRequestTimeoutMs: 5000 }],
  ])('rejects the BPNG %s', async (_label, config) => {
    useHost('explorer-bpng.soramitsu.io');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => config }));
    const module = await import('./runtime-config');

    await expect(module.loadRuntimeConfig()).rejects.toThrow(configurationError);
    expect(module.getRuntimeConfig()).toEqual({});
  });

  it('loads the exact complete BPNG Taira profile', async () => {
    useHost('explorer-bpng.soramitsu.io');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => bpngConfig }));
    const module = await import('./runtime-config');

    await expect(module.loadRuntimeConfig()).resolves.toEqual(bpngConfig);
    expect(module.getRuntimeConfig()).toEqual(bpngConfig);
    expect(module.getRuntimeConfig().networkId).toBe(checkedNetworkId);
  });
});
