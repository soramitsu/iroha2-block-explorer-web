import { execFileSync } from 'node:child_process';
import { chmod, mkdtemp, mkdir, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { afterEach, describe, expect, it } from 'vitest';

import {
  gitTreeDigest,
  materializeIrohaJsDistribution,
  REVIEWED_IROHA_JS_PACKAGE_JSON_SHA256,
  REVIEWED_IROHA_JS_SRC_TREES,
  runtimePackageTargets,
} from './materialize-iroha-js-dist.mjs';

import { checkIrohaPinFiles } from './check-iroha-pin.mjs';
import { verifyDevelopmentIrohaSdk } from './verify-development-iroha-sdk.mjs';

const temporaryRoots: string[] = [];

async function fixturePackage({ exportsFrom = 'dist' }: { exportsFrom?: 'dist' | 'src' } = {}) {
  const packageRoot = await mkdtemp(path.join(tmpdir(), 'explorer-iroha-js-dist-test-'));
  temporaryRoots.push(packageRoot);
  await mkdir(path.join(packageRoot, 'src', 'nested'), { recursive: true });
  await writeFile(path.join(packageRoot, 'src', 'index.js'), 'export const value = 1;\n');
  await writeFile(path.join(packageRoot, 'src', 'browser.js'), 'export const browser = true;\n');
  await writeFile(path.join(packageRoot, 'src', 'nested', 'worker.js'), 'export default 2;\n');
  await chmod(path.join(packageRoot, 'src', 'nested', 'worker.js'), 0o755);
  await writeFile(
    path.join(packageRoot, 'package.json'),
    `${JSON.stringify({
      name: '@iroha/iroha-js',
      main: `./${exportsFrom}/index.js`,
      exports: {
        '.': {
          import: `./${exportsFrom}/index.js`,
          types: './index.d.ts',
        },
        './browser': {
          browser: `./${exportsFrom}/browser.js`,
          import: `./${exportsFrom}/browser.js`,
          types: './browser.d.ts',
        },
      },
      browser: {
        [`./${exportsFrom}/index.js`]: `./${exportsFrom}/browser.js`,
      },
    }, null, 2)}\n`
  );
  return packageRoot;
}

afterEach(async () => {
  await Promise.all(temporaryRoots.splice(0).map((root) => rm(root, { force: true, recursive: true })));
});

describe('runtimePackageTargets', () => {
  it('binds the Linux-fixed candidate to the same reviewed JavaScript artifacts', () => {
    const priorCandidate = '1c3e843f0b1e5114e8b63202d703a826d7ec8fb5';
    const linuxFixedCandidate = '1e0f79552e01ab98a3fa4f7891e8698d74f34088';
    const stableLinuxCandidate = '1d679048066424e9d9f1bdf7e42d7d12e2b8ae6d';

    expect(REVIEWED_IROHA_JS_SRC_TREES[linuxFixedCandidate]).toBe(
      REVIEWED_IROHA_JS_SRC_TREES[priorCandidate]
    );
    expect(REVIEWED_IROHA_JS_SRC_TREES[stableLinuxCandidate]).toBe(
      REVIEWED_IROHA_JS_SRC_TREES[priorCandidate]
    );
    expect(REVIEWED_IROHA_JS_PACKAGE_JSON_SHA256[linuxFixedCandidate]).toBe(
      REVIEWED_IROHA_JS_PACKAGE_JSON_SHA256[priorCandidate]
    );
    expect(REVIEWED_IROHA_JS_PACKAGE_JSON_SHA256[stableLinuxCandidate]).toBe(
      REVIEWED_IROHA_JS_PACKAGE_JSON_SHA256[priorCandidate]
    );
  });

  it('collects runtime conditions and ignores declaration-only targets', () => {
    expect(runtimePackageTargets({
      main: './dist/index.js',
      exports: {
        '.': { import: './dist/index.js', types: './index.d.ts' },
        './browser': { browser: './dist/browser.js', types: './browser.d.ts' },
      },
      browser: { './dist/index.js': './dist/browser.js' },
    })).toEqual(['./dist/browser.js', './dist/index.js']);
  });
});

describe('materializeIrohaJsDistribution', () => {
  it('computes the same tree identity as Git for directory/name-prefix ordering', async () => {
    const packageRoot = await fixturePackage({ exportsFrom: 'src' });
    await mkdir(path.join(packageRoot, 'src', 'prefix'));
    await writeFile(path.join(packageRoot, 'src', 'prefix', 'nested.js'), 'nested\n');
    await writeFile(path.join(packageRoot, 'src', 'prefix.js'), 'sibling\n');
    execFileSync('git', ['init', '--quiet'], { cwd: packageRoot });
    execFileSync('git', ['add', '--', 'src'], { cwd: packageRoot });
    const rootTree = execFileSync('git', ['write-tree'], {
      cwd: packageRoot,
      encoding: 'utf8',
    }).trim();
    const expected = execFileSync('git', ['rev-parse', `${rootTree}:src`], {
      cwd: packageRoot,
      encoding: 'utf8',
    }).trim();

    expect(await gitTreeDigest(path.join(packageRoot, 'src'))).toBe(expected);
  });

  it('validates source-export packages without creating dist', async () => {
    const packageRoot = await fixturePackage({ exportsFrom: 'src' });
    const expectedSourceTree = await gitTreeDigest(path.join(packageRoot, 'src'));

    const result = await materializeIrohaJsDistribution({ packageRoot, expectedSourceTree });

    expect(result.sourceTree).toBe(expectedSourceTree);
    expect(result.changed).toBe(false);
    await expect(readFile(path.join(packageRoot, 'dist', 'index.js'))).rejects.toMatchObject({ code: 'ENOENT' });
  });

  it('materializes candidate-style dist exports as an exact source tree and is idempotent', async () => {
    const packageRoot = await fixturePackage();
    const expectedSourceTree = await gitTreeDigest(path.join(packageRoot, 'src'));

    const first = await materializeIrohaJsDistribution({ packageRoot, expectedSourceTree });
    const second = await materializeIrohaJsDistribution({ packageRoot, expectedSourceTree });

    expect(first.changed).toBe(true);
    expect(second.changed).toBe(false);
    expect(await gitTreeDigest(path.join(packageRoot, 'dist'))).toBe(expectedSourceTree);
    expect(await readFile(path.join(packageRoot, 'dist', 'nested', 'worker.js'), 'utf8')).toBe(
      'export default 2;\n'
    );
  });

  it('rejects an installed source tree outside the reviewed identity', async () => {
    const packageRoot = await fixturePackage();

    await expect(materializeIrohaJsDistribution({
      packageRoot,
      expectedSourceTree: '0'.repeat(40),
    })).rejects.toThrow(/does not match reviewed tree/u);
  });

  it('rejects package metadata outside the reviewed digest', async () => {
    const packageRoot = await fixturePackage();
    const expectedSourceTree = await gitTreeDigest(path.join(packageRoot, 'src'));

    await expect(materializeIrohaJsDistribution({
      packageRoot,
      expectedPackageJsonSha256: '0'.repeat(64),
      expectedSourceTree,
    })).rejects.toThrow(/package\.json SHA-256 .* does not match reviewed digest/u);
  });

  it('rejects links in installed source', async () => {
    const packageRoot = await fixturePackage();
    await symlink('index.js', path.join(packageRoot, 'src', 'linked.js'));

    await expect(gitTreeDigest(path.join(packageRoot, 'src'))).rejects.toThrow(/must not contain links/u);
  });

  it.skipIf(process.platform === 'win32')('rejects special files in installed source', async () => {
    const packageRoot = await fixturePackage();
    const fifoPath = path.join(packageRoot, 'src', 'runtime.fifo');
    execFileSync('mkfifo', [fifoPath]);

    await expect(gitTreeDigest(path.join(packageRoot, 'src'))).rejects.toThrow(/special files/u);
  });

  it('rejects an existing divergent distribution', async () => {
    const packageRoot = await fixturePackage();
    const expectedSourceTree = await gitTreeDigest(path.join(packageRoot, 'src'));
    await materializeIrohaJsDistribution({ packageRoot, expectedSourceTree });
    await writeFile(path.join(packageRoot, 'dist', 'index.js'), 'tampered\n');

    await expect(materializeIrohaJsDistribution({
      packageRoot,
      expectedSourceTree,
    })).rejects.toThrow(/existing dist tree .* does not match reviewed source/u);
  });

  it('rejects a declared runtime target absent from the reviewed source', async () => {
    const packageRoot = await fixturePackage();
    const packageJsonPath = path.join(packageRoot, 'package.json');
    const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8'));
    packageJson.exports['./missing'] = { import: './dist/missing.js' };
    await writeFile(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`);
    const expectedSourceTree = await gitTreeDigest(path.join(packageRoot, 'src'));

    await expect(materializeIrohaJsDistribution({
      packageRoot,
      expectedSourceTree,
    })).rejects.toThrow(/runtime target is missing/u);
  });

  it('rejects a package runtime target that escapes the package root', async () => {
    const packageRoot = await fixturePackage({ exportsFrom: 'src' });
    const packageJsonPath = path.join(packageRoot, 'package.json');
    const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8'));
    packageJson.main = './../outside.js';
    await writeFile(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`);
    const expectedSourceTree = await gitTreeDigest(path.join(packageRoot, 'src'));

    await expect(materializeIrohaJsDistribution({
      packageRoot,
      expectedSourceTree,
    })).rejects.toThrow(/runtime target must be under|runtime target escapes/u);
  });

  it('verifies the installed development archive while the accepted release pin remains closed', async () => {
    const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
    await expect(verifyDevelopmentIrohaSdk(repositoryRoot)).resolves.toMatchObject({
      files: 163,
      status: 'development-only',
    });
    const admission = await checkIrohaPinFiles({
      packagePath: path.join(repositoryRoot, 'package.json'),
      profilePath: path.join(repositoryRoot, 'tests/mochi/explorer-profile.json'),
      lockfilePath: path.join(repositoryRoot, 'pnpm-lock.yaml'),
    });
    expect(admission.revision).toBeNull();
    expect(admission.errors).toContain('@iroha/iroha-js must use github:hyperledger-iroha/iroha#<40-lowercase-hex-sha>&path:javascript/iroha_js');
  });
});
