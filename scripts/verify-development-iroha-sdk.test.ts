import { cp, mkdtemp, mkdir, readFile, realpath, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';
import { DEVELOPMENT_IROHA_SPECIFIER, verifyDevelopmentIrohaSdk } from './verify-development-iroha-sdk.mjs';

const repository = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const roots: string[] = [];

async function fixture() {
  const root = await mkdtemp(path.join(tmpdir(), 'explorer-development-sdk-'));
  roots.push(root);
  await mkdir(path.join(root, 'vendor'));
  for (const name of ['iroha-iroha-js-0.0.3.tgz', 'iroha-iroha-js-0.0.3.development-files.json']) {
    await cp(path.join(repository, 'vendor', name), path.join(root, 'vendor', name));
  }
  await writeFile(path.join(root, 'package.json'), JSON.stringify({ dependencies: { '@iroha/iroha-js': DEVELOPMENT_IROHA_SPECIFIER } }));
  const installed = path.join(root, 'node_modules', '@iroha', 'iroha-js');
  await cp(await realpath(path.join(repository, 'node_modules', '@iroha', 'iroha-js')), installed, { recursive: true });
  return { root, installed };
}

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe('unsigned development SDK archive verification', () => {
  it('verifies every file and labels the result development-only', async () => {
    expect(await verifyDevelopmentIrohaSdk(repository)).toMatchObject({ files: 163, status: 'development-only' });
  });

  it('rejects archive and inventory substitution', async () => {
    for (const name of ['iroha-iroha-js-0.0.3.tgz', 'iroha-iroha-js-0.0.3.development-files.json']) {
      const { root } = await fixture();
      await writeFile(path.join(root, 'vendor', name), 'substituted');
      await expect(verifyDevelopmentIrohaSdk(root)).rejects.toThrow(/differs/);
    }
  });

  it('rejects changed bytes, additional files and symlinks in installed SDKs', async () => {
    for (const change of ['bytes', 'extra', 'symlink']) {
      const { root, installed } = await fixture();
      if (change === 'bytes') {
        const file = path.join(installed, 'dist/networkId.js');
        await writeFile(file, `${await readFile(file, 'utf8')}\n// changed\n`);
      } else if (change === 'extra') await writeFile(path.join(installed, 'unexpected.js'), 'extra');
      else await symlink('package.json', path.join(installed, 'unexpected-link'));
      await expect(verifyDevelopmentIrohaSdk(root)).rejects.toThrow(/differs|differ|links/);
    }
  });
});
