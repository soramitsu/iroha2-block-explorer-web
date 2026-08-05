// @vitest-environment node

import { describe, expect, it } from 'vitest';

import explorerConfig from './vite.config.mts';

describe('Vite Torii proxy', () => {
  it('requests JSON from the newest Torii status endpoint', async () => {
    if (typeof explorerConfig !== 'function') {
      throw new TypeError('expected the Explorer Vite config to be environment-aware');
    }

    const config = await explorerConfig({
      command: 'serve',
      mode: 'test',
      isSsrBuild: false,
      isPreview: false,
    });

    expect(config.server?.proxy?.['/status']).toMatchObject({
      changeOrigin: true,
      headers: {
        Accept: 'application/json',
      },
    });
  });
});
