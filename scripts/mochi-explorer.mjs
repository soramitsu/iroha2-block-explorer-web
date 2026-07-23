#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
export const EXPLORER_WORKSPACE_ROOT = resolve(SCRIPT_DIR, '..');
export const DEFAULT_PROFILE_PATH = join(EXPLORER_WORKSPACE_ROOT, 'tests/mochi/explorer-profile.json');
export const DEFAULT_MOCHI_CONFIG_PATH = join(
  EXPLORER_WORKSPACE_ROOT,
  'tests/mochi/explorer-local.toml'
);
const ALLOWED_COMMANDS = new Set(['up', 'down', 'status', 'reset', 'env', 'mcp-add-command']);

export function validateMochiProfile(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new TypeError('Mochi Explorer profile must be an object');
  }
  if (value.schema_version !== 1) throw new Error('Unsupported Mochi Explorer profile schema');
  if (!/^[0-9a-f]{40}$/u.test(value.iroha_revision ?? '')) {
    throw new Error('Mochi Explorer profile must pin a full lowercase Iroha revision');
  }
  if (value.profile !== 'single-peer' && value.profile !== 'four-peer-bft') {
    throw new Error('Mochi Explorer profile must use a supported Mochi preset');
  }
  for (const key of ['profile_slug', 'chain_id']) {
    if (typeof value[key] !== 'string' || value[key].trim() === '') {
      throw new Error(`Mochi Explorer profile ${key} must be non-empty`);
    }
  }
  if (!Number.isSafeInteger(value.start_timeout_seconds) || value.start_timeout_seconds <= 0) {
    throw new Error('Mochi Explorer start timeout must be a positive safe integer');
  }
  if (
    !value.seed
    || typeof value.seed.domain_id !== 'string'
    || !Number.isSafeInteger(value.seed.minimum_head_height)
    || value.seed.minimum_head_height < 1
    || !Number.isSafeInteger(value.seed.minimum_transactions)
    || value.seed.minimum_transactions < 1
  ) {
    throw new Error('Mochi Explorer seed assertions are incomplete');
  }
  return Object.freeze({
    ...value,
    seed: Object.freeze({ ...value.seed }),
  });
}

export function loadMochiProfile(path = DEFAULT_PROFILE_PATH) {
  return validateMochiProfile(JSON.parse(readFileSync(path, 'utf8')));
}

export function resolveIrohaRoot(workspaceRoot, override) {
  return override ? resolve(override) : resolve(workspaceRoot, '../iroha');
}

export function resolveMochiPython(platform, environment = {}) {
  if (typeof environment.MOCHI_PYTHON === 'string' && environment.MOCHI_PYTHON.trim() !== '') {
    return environment.MOCHI_PYTHON;
  }
  return platform === 'darwin' ? '/usr/bin/python3' : 'python3';
}

export function buildMochiEnvironment(profile, workspaceRoot, baseEnvironment = process.env) {
  const rustMinStack = typeof baseEnvironment.RUST_MIN_STACK === 'string'
    && baseEnvironment.RUST_MIN_STACK.trim() !== ''
    ? baseEnvironment.RUST_MIN_STACK
    : String(32 * 1024 * 1024);
  return {
    ...baseEnvironment,
    RUST_MIN_STACK: rustMinStack,
    MOCHI_CONFIG: join(workspaceRoot, 'tests/mochi/explorer-local.toml'),
    MOCHI_WORKSPACE_ROOT: workspaceRoot,
    MOCHI_PROFILE: profile.profile,
    MOCHI_PROFILE_SLUG: profile.profile_slug,
    MOCHI_CHAIN_ID: profile.chain_id,
    MOCHI_START_TIMEOUT_SECONDS: String(profile.start_timeout_seconds),
    MOCHI_PYTHON: resolveMochiPython(process.platform, baseEnvironment),
  };
}

export function verifyPinnedIrohaRevision(irohaRoot, expectedRevision, runner = spawnSync) {
  const result = runner('git', ['rev-parse', 'HEAD'], {
    cwd: irohaRoot,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  if (result.status !== 0) {
    throw new Error(`Unable to resolve the sibling Iroha revision: ${String(result.stderr ?? '').trim()}`);
  }
  const actual = String(result.stdout ?? '').trim();
  if (actual !== expectedRevision) {
    throw new Error(`Pinned Iroha revision mismatch: expected ${expectedRevision}, found ${actual}`);
  }
  return actual;
}

export function runMochiCommand(command, options = {}) {
  if (!ALLOWED_COMMANDS.has(command)) throw new Error(`Unsupported Mochi command: ${command}`);
  const workspaceRoot = options.workspaceRoot ?? EXPLORER_WORKSPACE_ROOT;
  const profile = options.profile ?? loadMochiProfile(options.profilePath);
  const irohaRoot = resolveIrohaRoot(workspaceRoot, options.irohaRoot ?? process.env.IROHA_REPO_ROOT);
  const runner = options.runner ?? spawnSync;
  verifyPinnedIrohaRevision(irohaRoot, profile.iroha_revision, runner);
  const helper = join(irohaRoot, 'scripts/mochi_local_sandbox.sh');
  const result = runner('bash', [helper, command], {
    cwd: irohaRoot,
    env: buildMochiEnvironment(profile, workspaceRoot, options.environment),
    stdio: 'inherit',
  });
  if (result.error) throw result.error;
  return result.status ?? 1;
}

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : '';
if (invokedPath === fileURLToPath(import.meta.url)) {
  const command = process.argv[2];
  if (!command) {
    process.stderr.write('Usage: node scripts/mochi-explorer.mjs <up|down|status|reset|env|mcp-add-command>\n');
    process.exitCode = 2;
  } else {
    try {
      process.exitCode = runMochiCommand(command);
    } catch (error) {
      process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
      process.exitCode = 1;
    }
  }
}
