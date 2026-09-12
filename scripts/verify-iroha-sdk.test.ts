// @vitest-environment node
import { cp, lstat, mkdtemp, mkdir, readFile, realpath, rename, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';
import { IROHA_SDK_SPECIFIER, verifyIrohaSdk, verifyIrohaSdkArchive } from './verify-iroha-sdk.mjs';

const repository = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const roots: string[] = [];
const archiveName = 'iroha-iroha-js-0.0.3.tgz';
const inventoryName = 'iroha-iroha-js-0.0.3.files.json';

async function fixture({ installed = true } = {}) {
  const root = await realpath(await mkdtemp(path.join(tmpdir(), 'explorer-sdk-integrity-')));
  roots.push(root);
  await mkdir(path.join(root, 'vendor'));
  for (const name of [archiveName, inventoryName]) await cp(path.join(repository, 'vendor', name), path.join(root, 'vendor', name));
  await writeFile(path.join(root, 'package.json'), JSON.stringify({ dependencies: { '@iroha/iroha-js': IROHA_SDK_SPECIFIER } }));
  const packageRoot = path.join(root, 'node_modules/@iroha/iroha-js');
  if (installed) {
    await cp(await realpath(path.join(repository, 'node_modules/@iroha/iroha-js')), packageRoot, { recursive: true });
    // Every mutation starts from a package accepted by the exact same checker.
    await verifyIrohaSdk(root);
  }
  return { root, packageRoot };
}

afterEach(async () => {
  await Promise.all(roots.splice(0).map(root => rm(root, { recursive: true, force: true })));
});

describe('admitted SDK package integrity', () => {
  it('checks all 200 installed files without changing the real package', async () => {
    const wasm = path.join(repository, 'node_modules/@iroha/iroha-js/dist/wasm/iroha_js_codec_wasm_bg.wasm');
    const before = await lstat(wasm);
    expect(await verifyIrohaSdk(repository)).toEqual({
      files: 200,
      archiveSha256: '02600597032e3c0074b915c06b6125aea3a98c549f60e0ccee7d75dfdbdbb79f',
      inventorySha256: '9ef5fecacf6ced1799ad28393ed42dfb3fd64c992076c7eb474fea9ae2c50ba7',
      status: 'package-integrity-verified',
    });
    const after = await lstat(wasm);
    expect([after.ino, after.size, after.mtimeMs, after.ctimeMs]).toEqual([before.ino, before.size, before.mtimeMs, before.ctimeMs]);
  });

  it('authenticates archive inputs before installation without claiming installed-package integrity', async () => {
    const { root } = await fixture({ installed: false });
    expect(await verifyIrohaSdkArchive(root)).toMatchObject({ files: 200, status: 'archive-integrity-verified' });
    await expect(lstat(path.join(root, 'node_modules'))).rejects.toMatchObject({ code: 'ENOENT' });
    await expect(verifyIrohaSdk(root)).rejects.toMatchObject({ code: 'ENOENT' });
  });

  it.each([archiveName, inventoryName])('rejects substituted bytes in %s before installation', async name => {
    const { root } = await fixture({ installed: false });
    const filename = path.join(root, 'vendor', name); const bytes = await readFile(filename);
    bytes[0] = bytes[0]! ^ 1;
    await writeFile(filename, bytes);
    await expect(verifyIrohaSdkArchive(root)).rejects.toThrow(/SDK (archive|inventory) differs/);
  });

  it('rejects other SDK dependency sources', async () => {
    const { root } = await fixture({ installed: false });
    await writeFile(path.join(root, 'package.json'), JSON.stringify({ dependencies: { '@iroha/iroha-js': 'file:../iroha/javascript/iroha_js' } }));
    await expect(verifyIrohaSdkArchive(root)).rejects.toThrow('SDK dependency must select the exact admitted vendored archive');
  });

  it.each([
    'dist/wasm/iroha_js_codec_wasm_bg.wasm',
    'dist/wasm/iroha_js_codec_wasm.js',
    'dist/public/browserCodec.js',
    'native/iroha_js_host.checksums.json',
    'browser-codec.d.ts',
    'package.json',
  ])('rejects altered installed %s bytes', async name => {
    const { root, packageRoot } = await fixture();
    const filename = path.join(packageRoot, name); const bytes = await readFile(filename);
    bytes[0] = bytes[0]! ^ 1;
    await writeFile(filename, bytes);
    await expect(verifyIrohaSdk(root)).rejects.toThrow(`Installed SDK bytes differ: ${name}`);
  });

  it('rejects additional installed files', async () => {
    const { root, packageRoot } = await fixture();
    await writeFile(path.join(packageRoot, 'unexpected.js'), 'extra');
    await expect(verifyIrohaSdk(root)).rejects.toThrow('Installed SDK contains an unexpected file: unexpected.js');
  });

  it('rejects additional empty directories', async () => {
    const { root, packageRoot } = await fixture();
    await mkdir(path.join(packageRoot, 'unexpected'));
    await expect(verifyIrohaSdk(root)).rejects.toThrow('Installed SDK contains an unexpected directory: unexpected');
  });

  it('rejects installed symlinks even when they select package bytes', async () => {
    const { root, packageRoot } = await fixture();
    await symlink('package.json', path.join(packageRoot, 'unexpected-link'));
    await expect(verifyIrohaSdk(root)).rejects.toThrow('Installed SDK must not contain links or special files: unexpected-link');
  });

  it('fails on missing distribution files without recreating them', async () => {
    const { root, packageRoot } = await fixture();
    const dist = path.join(packageRoot, 'dist');
    await rm(dist, { recursive: true });
    await expect(verifyIrohaSdk(root)).rejects.toThrow('Installed SDK file inventory differs from the admitted package');
    await expect(lstat(dist)).rejects.toMatchObject({ code: 'ENOENT' });
  });

  it('rejects an installed package link outside its node_modules', async () => {
    const { root, packageRoot } = await fixture();
    const outside = path.join(root, 'outside-package');
    await rename(packageRoot, outside); await symlink(outside, packageRoot);
    await expect(verifyIrohaSdk(root)).rejects.toThrow('Installed SDK must remain inside this checkout node_modules');
  });

  it('rejects a linked node_modules root', async () => {
    const { root } = await fixture();
    const modules = path.join(root, 'node_modules'); const outside = path.join(root, 'outside-modules');
    await rename(modules, outside); await symlink(outside, modules);
    await expect(verifyIrohaSdk(root)).rejects.toThrow('SDK node_modules must be a real directory inside this checkout');
  });
});
