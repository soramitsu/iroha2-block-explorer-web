import {
  chmodSync,
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  symlinkSync,
} from 'node:fs';
import { spawnSync } from 'node:child_process';
import { homedir, tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  EXACT_TOOLCHAIN_REPOSITORY_ROOT,
  NODE_DOWNLOAD_ORIGIN,
  REQUIRED_PNPM_INTEGRITY,
  REQUIRED_PNPM_VERSION,
  assertRequiredPnpmVersion,
  executeExactToolchainCommand,
  resolveNodeArtifact,
  resolveToolchainCache,
  sanitizedExactToolchainEnvironment,
  validateToolchainCacheDirectory,
} from './run-exact-toolchain.mjs';

const cleanupRoots: string[] = [];

afterEach(() => {
  for (const root of cleanupRoots.splice(0)) {
    if (existsSync(root)) rmSync(root, { force: true, recursive: true });
  }
});

function privateTemporaryParent() {
  const parent = mkdtempSync(
    path.join(realpathSync(tmpdir()), 'iroha-exact-toolchain-test-')
  );
  chmodSync(parent, 0o700);
  cleanupRoots.push(parent);
  return parent;
}

describe('exact CI toolchain bootstrap', () => {
  it('matches the repository Node and package-manager declarations', () => {
    const packageJson = JSON.parse(readFileSync(path.resolve('package.json'), 'utf8'));
    expect(readFileSync(path.resolve('.node-version'), 'utf8').trim()).toBe('24.19.0');
    expect(packageJson.engines?.node).toBe('24.19.0');
    expect(packageJson.packageManager).toBe('pnpm@10.11.0');
  });

  it('pins official Node 24.19.0 archives for every supported CI/local platform', () => {
    expect(NODE_DOWNLOAD_ORIGIN).toBe('https://nodejs.org/dist/v24.19.0');
    expect(resolveNodeArtifact('linux', 'x64')).toEqual({
      file: 'node-v24.19.0-linux-x64.tar.gz',
      sha256: 'f625d97cd707df4ff96254916fbc5ff014f09c09effe5a1e0ca8f6d41a8789d4',
    });
    expect(resolveNodeArtifact('linux', 'arm64')).toEqual({
      file: 'node-v24.19.0-linux-arm64.tar.gz',
      sha256: 'd28c8a5bf0a808f0ed434a1dce8c54ae98f0371c0bd86ac58abc613f73e6643f',
    });
    expect(resolveNodeArtifact('darwin', 'x64').file).toBe(
      'node-v24.19.0-darwin-x64.tar.gz'
    );
    expect(resolveNodeArtifact('darwin', 'arm64').file).toBe(
      'node-v24.19.0-darwin-arm64.tar.gz'
    );
  });

  it('keeps the shell-first bootstrap hashes aligned with the verified artifact map', () => {
    const bootstrap = readFileSync(
      path.resolve('scripts/bootstrap-exact-toolchain.sh'),
      'utf8'
    );
    for (const [platform, architecture] of [
      ['linux', 'x64'],
      ['linux', 'arm64'],
      ['darwin', 'x64'],
      ['darwin', 'arm64'],
    ] as const) {
      const artifact = resolveNodeArtifact(platform, architecture);
      expect(bootstrap).toContain(`node_archive="${artifact.file}"`);
      expect(bootstrap).toContain(`node_archive_sha256="${artifact.sha256}"`);
    }
  });

  it('rehashes the cached official archive and freshly extracts Node for every invocation', () => {
    const bootstrap = readFileSync(
      path.resolve('scripts/bootstrap-exact-toolchain.sh'),
      'utf8'
    );
    expect(bootstrap).toContain('archives_root="$toolchain_cache/.archives"');
    expect(bootstrap).toContain('validate_archive_file "$archive_path"');
    expect(bootstrap).toContain(
      'staging_root=$(mktemp -d "$toolchain_cache/.node-run.XXXXXX")'
    );
    expect(bootstrap).not.toContain('node_installation=');
    expect(bootstrap).not.toContain('cached Node installation');
  });

  it('publishes a raced Node archive without replacing or leaking either verified copy', () => {
    const bootstrap = readFileSync(
      path.resolve('scripts/bootstrap-exact-toolchain.sh'),
      'utf8'
    );
    expect(bootstrap).toContain(
      'if ln "$downloaded_archive" "$archive_path" 2>/dev/null; then'
    );
    expect(bootstrap).toContain(
      'elif [ -e "$archive_path" ] || [ -L "$archive_path" ]; then'
    );
    expect(bootstrap.match(/rm -f -- "\$downloaded_archive"/gu)).toHaveLength(3);
    expect(bootstrap).not.toContain('mv "$downloaded_archive" "$archive_path"');
  });

  it('rejects unsupported platforms instead of selecting a fallback binary', () => {
    expect(() => resolveNodeArtifact('win32', 'x64')).toThrow(
      'does not support platform'
    );
    expect(() => resolveNodeArtifact('linux', 'riscv64')).toThrow(
      'does not support platform'
    );
  });

  it('accepts only pnpm 10.11.0', () => {
    expect(REQUIRED_PNPM_VERSION).toBe('10.11.0');
    expect(REQUIRED_PNPM_INTEGRITY).toBe(
      'sha512.6540583f41cc5f628eb3d9773ecee802f4f9ef9923cc45b69890fb47991d4b092964694ec3a4f738a420c918a333062c8b925d312f42e4f0c263eb603551f977'
    );
    expect(assertRequiredPnpmVersion('10.11.0\n')).toBe('10.11.0');
    expect(() => assertRequiredPnpmVersion('10.11.1')).toThrow(
      'pnpm 10.11.0 is required'
    );
    expect(() => assertRequiredPnpmVersion('9.15.0')).toThrow(
      'pnpm 10.11.0 is required'
    );
  });

  it('rejects broad, in-repository, relative, and non-normalized cache paths', () => {
    const filesystemRoot = path.parse(EXACT_TOOLCHAIN_REPOSITORY_ROOT).root;
    const canonicalTemp = realpathSync(tmpdir());
    const canonicalHome = realpathSync(homedir());
    for (const unsafe of [
      filesystemRoot,
      path.join(filesystemRoot, 'cache'),
      canonicalTemp,
      canonicalHome,
      EXACT_TOOLCHAIN_REPOSITORY_ROOT,
      path.join(EXACT_TOOLCHAIN_REPOSITORY_ROOT, '.toolchain-cache'),
      `${canonicalTemp}/nested/../cache`,
      'relative/cache',
    ]) {
      expect(() => resolveToolchainCache(unsafe)).toThrow(
        /absolute normalized|broad or in-repository/u
      );
    }

    const safe = path.join(privateTemporaryParent(), 'cache');
    expect(resolveToolchainCache(safe)).toBe(safe);
  });

  it('creates only an owner-private real cache and rejects unsafe existing entries', async () => {
    const parent = privateTemporaryParent();
    const cache = path.join(parent, 'cache');
    await expect(validateToolchainCacheDirectory(cache)).resolves.toBe(cache);
    expect(lstatSync(cache).mode & 0o777).toBe(0o700);

    chmodSync(cache, 0o770);
    await expect(validateToolchainCacheDirectory(cache)).rejects.toThrow(
      'must have mode 0700'
    );

    const secondParent = privateTemporaryParent();
    const target = path.join(secondParent, 'target');
    const linkedCache = path.join(secondParent, 'cache');
    mkdirSync(target, { mode: 0o700 });
    symlinkSync(target, linkedCache);
    await expect(validateToolchainCacheDirectory(linkedCache)).rejects.toThrow(
      'must be a real directory'
    );
  });

  it('makes the shell-first boundary reject broad and permissive caches before Node starts', () => {
    const bootstrap = path.resolve('scripts/bootstrap-exact-toolchain.sh');
    const broadResult = spawnSync('sh', [bootstrap, 'true'], {
      encoding: 'utf8',
      env: {
        ...process.env,
        IROHA_EXPLORER_TOOLCHAIN_CACHE: EXACT_TOOLCHAIN_REPOSITORY_ROOT,
        NODE_OPTIONS: '--require /definitely-not-present/attacker.js',
      },
    });
    expect(broadResult.status).toBe(1);
    expect(broadResult.stderr).toContain(
      'refusing broad or in-repository exact-toolchain cache'
    );
    expect(broadResult.stderr).not.toContain('attacker.js');

    const parent = privateTemporaryParent();
    const permissiveCache = path.join(parent, 'cache');
    mkdirSync(permissiveCache, { mode: 0o755 });
    const permissiveResult = spawnSync('sh', [bootstrap, 'true'], {
      encoding: 'utf8',
      env: {
        ...process.env,
        IROHA_EXPLORER_TOOLCHAIN_CACHE: permissiveCache,
      },
    });
    expect(permissiveResult.status).toBe(1);
    expect(permissiveResult.stderr).toContain('must have mode 0700');
  });

  it('uses an allowlisted private environment and binds commands to the canonical repository', () => {
    const environment = sanitizedExactToolchainEnvironment(
      {
        COREPACK_INTEGRITY_KEYS: '0',
        COREPACK_ENV_FILE: '/attacker/.corepack.env',
        COREPACK_NPM_PASSWORD: 'attacker-password',
        COREPACK_NPM_REGISTRY: 'https://attacker.invalid',
        COREPACK_NPM_TOKEN: 'attacker-token',
        NODE_OPTIONS: '--require /attacker.js',
        NODE_PATH: '/attacker',
        NPM_CONFIG_REGISTRY: 'https://attacker.invalid',
        PNPM_HOME: '/attacker/pnpm',
        HTTPS_PROXY: 'https://attacker.invalid',
        NODE_EXTRA_CA_CERTS: '/attacker/ca.pem',
        GIT_CONFIG_GLOBAL: '/attacker/gitconfig',
        VITE_API_URL: 'https://attacker.invalid',
        PATH: '/usr/bin',
        IROHA_REPO_ROOT: EXACT_TOOLCHAIN_REPOSITORY_ROOT,
        PLAYWRIGHT_BROWSERS_PATH: '/ms-playwright',
        RUN_LIVE_MOCHI_E2E: '1',
      },
      {
        corepackHome: '/private/cache/corepack',
        nodeBin: '/verified-node/bin',
        toolBin: '/private/cache/tool-bin',
      }
    );
    expect(environment).not.toHaveProperty('NODE_OPTIONS');
    expect(environment).not.toHaveProperty('NODE_PATH');
    expect(environment).not.toHaveProperty('COREPACK_INTEGRITY_KEYS');
    expect(environment).not.toHaveProperty('COREPACK_NPM_PASSWORD');
    expect(environment).not.toHaveProperty('COREPACK_NPM_TOKEN');
    expect(environment).not.toHaveProperty('HTTPS_PROXY');
    expect(environment).not.toHaveProperty('NODE_EXTRA_CA_CERTS');
    expect(environment).not.toHaveProperty('GIT_CONFIG_GLOBAL');
    expect(environment).not.toHaveProperty('VITE_API_URL');
    expect(environment).toMatchObject({
      COREPACK_DEFAULT_TO_LATEST: '0',
      COREPACK_ENABLE_NETWORK: '1',
      COREPACK_ENABLE_PROJECT_SPEC: '1',
      COREPACK_ENABLE_STRICT: '1',
      COREPACK_ENABLE_UNSAFE_CUSTOM_URLS: '0',
      COREPACK_ENV_FILE: '0',
      COREPACK_HOME: '/private/cache/corepack',
      COREPACK_NPM_REGISTRY: 'https://registry.npmjs.org',
      HOME: '/private/cache/home',
      IROHA_REPO_ROOT: EXACT_TOOLCHAIN_REPOSITORY_ROOT,
      NPM_CONFIG_GLOBALCONFIG: '/private/cache/npm-globalconfig',
      NPM_CONFIG_REGISTRY: 'https://registry.npmjs.org',
      NPM_CONFIG_USERCONFIG: '/private/cache/npm-userconfig',
      PLAYWRIGHT_BROWSERS_PATH: '/ms-playwright',
      PNPM_HOME: '/private/cache/pnpm-home',
      RUN_LIVE_MOCHI_E2E: '1',
      TMPDIR: '/private/cache/tmp',
      XDG_CONFIG_HOME: '/private/cache/xdg-config',
    });
    expect(environment.PATH).toBe(
      ['/private/cache/tool-bin', '/verified-node/bin', '/usr/bin'].join(
        path.delimiter
      )
    );

    const spawn = vi.fn(() => ({ status: 0 }));
    expect(
      executeExactToolchainCommand('pnpm', ['test:unit'], { environment, spawn })
    ).toBe(0);
    expect(spawn).toHaveBeenCalledWith('pnpm', ['test:unit'], {
      cwd: EXACT_TOOLCHAIN_REPOSITORY_ROOT,
      env: environment,
      stdio: 'inherit',
    });
  });

  it('rejects a relative Playwright browser override and ignores non-enabled controls', () => {
    expect(() =>
      sanitizedExactToolchainEnvironment(
        { PATH: '/usr/bin', PLAYWRIGHT_BROWSERS_PATH: '../attacker' },
        {
          corepackHome: '/private/cache/corepack',
          nodeBin: '/verified-node/bin',
          toolBin: '/private/cache/tool-bin',
        }
      )
    ).toThrow('PLAYWRIGHT_BROWSERS_PATH must be an absolute normalized path');

    expect(() =>
      sanitizedExactToolchainEnvironment(
        { PATH: '/usr/bin', RUN_LIVE_MOCHI_E2E: '1', IROHA_REPO_ROOT: '../iroha' },
        {
          corepackHome: '/private/cache/corepack',
          nodeBin: '/verified-node/bin',
          toolBin: '/private/cache/tool-bin',
        }
      )
    ).toThrow('IROHA_REPO_ROOT must be an absolute normalized path');

    const environment = sanitizedExactToolchainEnvironment(
      {
        CI: 'true',
        PATH: '/usr/bin',
        RUN_LIVE_MOCHI_E2E: 'true',
        IROHA_REPO_ROOT: EXACT_TOOLCHAIN_REPOSITORY_ROOT,
      },
      {
        corepackHome: '/private/cache/corepack',
        nodeBin: '/verified-node/bin',
        toolBin: '/private/cache/tool-bin',
      }
    );
    expect(environment).not.toHaveProperty('CI');
    expect(environment).not.toHaveProperty('RUN_LIVE_MOCHI_E2E');
    expect(environment).not.toHaveProperty('IROHA_REPO_ROOT');
  });

  it('uses a disposable Corepack home instead of a persistent executable cache', () => {
    const runner = readFileSync(
      path.resolve('scripts/run-exact-toolchain.mjs'),
      'utf8'
    );
    expect(runner).toContain("mkdtemp(path.join(cacheRoot, '.toolchain-run-'))");
    expect(runner).toContain("path.join(toolRoot, 'corepack')");
    expect(runner).toContain(
      '`pnpm@§{REQUIRED_PNPM_VERSION}+§{REQUIRED_PNPM_INTEGRITY}`'.replaceAll(
        '§',
        '$'
      )
    );
    expect(runner).not.toContain("path.join(cacheRoot, 'corepack')");
  });

  it('removes Node injection before the verified Node executable is first invoked', () => {
    const bootstrap = readFileSync(
      path.resolve('scripts/bootstrap-exact-toolchain.sh'),
      'utf8'
    );
    const stripInjection = bootstrap.indexOf('unset NODE_OPTIONS NODE_PATH');
    const versionCheck = bootstrap.indexOf('"$exact_node" --version');
    const runner = bootstrap.indexOf(
      '"$exact_node" "$repository_root/scripts/run-exact-toolchain.mjs"'
    );
    expect(stripInjection).toBeGreaterThan(0);
    expect(versionCheck).toBeGreaterThan(stripInjection);
    expect(runner).toBeGreaterThan(versionCheck);
  });
});
