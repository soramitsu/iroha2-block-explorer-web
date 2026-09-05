// @vitest-environment node

import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

import explorerConfig, { collectBuildPublicAssets } from './vite.config.mts';

describe('Vite configuration', () => {
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

  it('reserves root config.json for the signed deployment injector', async () => {
    const publicRoot = await mkdtemp(path.join(os.tmpdir(), 'explorer-public-assets-'));
    try {
      await mkdir(path.join(publicRoot, 'nested'));
      await Promise.all([
        writeFile(path.join(publicRoot, 'config.json'), '{"must":"not ship"}\n'),
        writeFile(path.join(publicRoot, 'favicon.svg'), '<svg/>\n'),
        writeFile(path.join(publicRoot, 'nested', 'config.json'), '{"fixture":true}\n'),
      ]);

      const assets = await collectBuildPublicAssets(publicRoot);

      expect(assets.map(({ fileName }) => fileName)).toEqual([
        'favicon.svg',
        'nested/config.json',
      ]);
      expect(Buffer.from(assets[0]?.source ?? []).toString('utf8')).toBe('<svg/>\n');
    } finally {
      await rm(publicRoot, { recursive: true, force: true });
    }
  });

  it('disables Vite public-directory copying in production builds', async () => {
    if (typeof explorerConfig !== 'function') {
      throw new TypeError('expected the Explorer Vite config to be environment-aware');
    }

    const config = await explorerConfig({
      command: 'build',
      mode: 'production',
      isSsrBuild: false,
      isPreview: false,
    });

    expect(config.build?.copyPublicDir).toBe(false);
    expect(config.plugins).toEqual(expect.arrayContaining([
      expect.objectContaining({ name: 'explorer-build-public-assets', apply: 'build' }),
    ]));
  });
});
