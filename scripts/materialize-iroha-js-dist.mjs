import { createHash, randomUUID } from 'node:crypto';
import {
  cp,
  lstat,
  readFile,
  realpath,
  rename,
  readdir,
  rm,
} from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { checkIrohaPinFiles } from './check-iroha-pin.mjs';

const IROHA_PACKAGE = '@iroha/iroha-js';
const IROHA_PACKAGE_PATH = path.join('@iroha', 'iroha-js');
const FULL_SHA_PATTERN = /^[0-9a-f]{40}$/u;
const GIT_TREE_PATTERN = /^[0-9a-f]{40}$/u;
const SHA256_PATTERN = /^[0-9a-f]{64}$/u;

/**
 * Git tree identities for the exact `javascript/iroha_js/src` directory
 * admitted by this Explorer checkout. The installed source is checked before
 * any executable module is materialized, so a mutable/corrupt package store
 * cannot silently become the browser SDK.
 */
export const REVIEWED_IROHA_JS_SRC_TREES = Object.freeze({
  '234e4a9c7090efd206dbdec6fcf851b72b577cf3': 'a277897cd377ce163f10ea53c28e7db006059b83',
  '1c3e843f0b1e5114e8b63202d703a826d7ec8fb5': '83469c34d36768e4728fe4c55be5c757441ff76f',
  '1e0f79552e01ab98a3fa4f7891e8698d74f34088': '83469c34d36768e4728fe4c55be5c757441ff76f',
});

/** Exact package metadata which declares the reviewed runtime target surface. */
export const REVIEWED_IROHA_JS_PACKAGE_JSON_SHA256 = Object.freeze({
  '234e4a9c7090efd206dbdec6fcf851b72b577cf3': '6e29a4acc64c944961921f5cd4f4e2e7a2e4368c6844f806ce69a1bd7e664bfb',
  '1c3e843f0b1e5114e8b63202d703a826d7ec8fb5': '99ce1a83134791477ddc13050011699333b792bd9c80f145c08eb6a452b30511',
  '1e0f79552e01ab98a3fa4f7891e8698d74f34088': '99ce1a83134791477ddc13050011699333b792bd9c80f145c08eb6a452b30511',
});

function gitObjectDigest(kind, bytes) {
  return createHash('sha1')
    .update(`${kind} ${bytes.length}\0`, 'utf8')
    .update(bytes)
    .digest();
}

function gitNameCompare(left, right) {
  return Buffer.from(left, 'utf8').compare(Buffer.from(right, 'utf8'));
}

/** Compute the canonical Git tree identity of a real directory. */
export async function gitTreeDigest(directory) {
  const metadata = await lstat(directory);
  if (!metadata.isDirectory() || metadata.isSymbolicLink()) {
    throw new Error(`Iroha JS source tree must be a real directory: ${directory}`);
  }

  const entries = (await readdir(directory, { withFileTypes: true }))
    .sort((left, right) => gitNameCompare(
      `${left.name}${left.isDirectory() ? '/' : ''}`,
      `${right.name}${right.isDirectory() ? '/' : ''}`
    ));
  const body = [];
  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    const entryMetadata = await lstat(entryPath);
    let mode;
    let digest;
    if (entryMetadata.isDirectory() && !entryMetadata.isSymbolicLink()) {
      mode = '40000';
      digest = Buffer.from(await gitTreeDigest(entryPath), 'hex');
    } else if (entryMetadata.isFile() && !entryMetadata.isSymbolicLink()) {
      mode = (entryMetadata.mode & 0o111) === 0 ? '100644' : '100755';
      digest = gitObjectDigest('blob', await readFile(entryPath));
    } else {
      throw new Error(`Iroha JS source tree must not contain links or special files: ${entryPath}`);
    }
    body.push(Buffer.from(`${mode} ${entry.name}\0`, 'utf8'), digest);
  }
  return gitObjectDigest('tree', Buffer.concat(body)).toString('hex');
}

function collectConditionalTargets(value, output) {
  if (typeof value === 'string') {
    output.add(value);
    return;
  }
  if (!value || typeof value !== 'object' || Array.isArray(value)) return;
  for (const [condition, target] of Object.entries(value)) {
    if (condition === 'types') continue;
    collectConditionalTargets(target, output);
  }
}

export function runtimePackageTargets(packageJson) {
  const targets = new Set();
  if (typeof packageJson?.main === 'string') targets.add(packageJson.main);
  if (packageJson?.exports && typeof packageJson.exports === 'object') {
    for (const value of Object.values(packageJson.exports)) {
      collectConditionalTargets(value, targets);
    }
  }
  if (packageJson?.browser && typeof packageJson.browser === 'object') {
    for (const [source, replacement] of Object.entries(packageJson.browser)) {
      targets.add(source);
      if (typeof replacement === 'string') targets.add(replacement);
    }
  }
  return [...targets].sort(gitNameCompare);
}

function resolvedPackageTarget(packageRoot, target) {
  if (typeof target !== 'string' || !target.startsWith('./')) {
    throw new Error(`${IROHA_PACKAGE} runtime target must be package-relative: ${String(target)}`);
  }
  const resolved = path.resolve(packageRoot, target);
  const relative = path.relative(packageRoot, resolved);
  if (relative === '' || relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
    throw new Error(`${IROHA_PACKAGE} runtime target escapes the package: ${target}`);
  }
  return resolved;
}

async function requireRegularTarget(packageRoot, target) {
  const resolved = resolvedPackageTarget(packageRoot, target);
  let metadata;
  try {
    metadata = await lstat(resolved);
  } catch (error) {
    if (error?.code === 'ENOENT') {
      throw new Error(`${IROHA_PACKAGE} runtime target is missing: ${target}`);
    }
    throw error;
  }
  if (!metadata.isFile() || metadata.isSymbolicLink()) {
    throw new Error(`${IROHA_PACKAGE} runtime target must be a real file: ${target}`);
  }
}

async function requireRuntimeTargets(packageRoot, targets) {
  await Promise.all(targets.map((target) => requireRegularTarget(packageRoot, target)));
}

function reviewedSourceTarget(packageRoot, target) {
  const match = /^\.\/(?:src|dist)\/(.+)$/u.exec(target);
  if (!match?.[1]) {
    throw new Error(`${IROHA_PACKAGE} runtime target must be under ./src or ./dist: ${target}`);
  }
  const sourceRoot = path.join(packageRoot, 'src');
  const resolved = path.resolve(sourceRoot, match[1]);
  const relative = path.relative(sourceRoot, resolved);
  if (relative === '' || relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
    throw new Error(`${IROHA_PACKAGE} runtime target escapes the reviewed source tree: ${target}`);
  }
  return `./src/${relative.split(path.sep).join('/')}`;
}

function assertExpectedSourceTree(expectedSourceTree) {
  if (!GIT_TREE_PATTERN.test(expectedSourceTree)) {
    throw new Error(`Reviewed Iroha JS source tree must be a full lowercase Git tree: ${expectedSourceTree}`);
  }
}

async function publishDistribution(packageRoot, sourceRoot, expectedSourceTree) {
  const distRoot = path.join(packageRoot, 'dist');
  try {
    const existing = await gitTreeDigest(distRoot);
    if (existing !== expectedSourceTree) {
      throw new Error(
        `${IROHA_PACKAGE} existing dist tree ${existing} does not match reviewed source ${expectedSourceTree}`
      );
    }
    return { changed: false, distRoot };
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
  }

  const stagingRoot = path.join(packageRoot, `.bpng-dist-stage-${process.pid}-${randomUUID()}`);
  try {
    await cp(sourceRoot, stagingRoot, {
      recursive: true,
      errorOnExist: true,
      force: false,
      preserveTimestamps: false,
    });
    const staged = await gitTreeDigest(stagingRoot);
    if (staged !== expectedSourceTree) {
      throw new Error(
        `${IROHA_PACKAGE} staged dist tree ${staged} does not match reviewed source ${expectedSourceTree}`
      );
    }
    try {
      await rename(stagingRoot, distRoot);
    } catch (error) {
      if (!['EEXIST', 'ENOTEMPTY'].includes(error?.code)) throw error;
      const concurrent = await gitTreeDigest(distRoot);
      if (concurrent !== expectedSourceTree) {
        throw new Error(
          `${IROHA_PACKAGE} concurrently published dist tree ${concurrent} does not match reviewed source ${expectedSourceTree}`
        );
      }
      return { changed: false, distRoot };
    }
    return { changed: true, distRoot };
  } finally {
    await rm(stagingRoot, { force: true, recursive: true });
  }
}

/**
 * Validate the installed immutable source and materialize `dist` when the
 * upstream package exports it. The upstream build is intentionally a byte-for-
 * byte copy of `src`; this implementation neither executes upstream install
 * hooks nor consults a mutable sibling checkout.
 */
export async function materializeIrohaJsDistribution({
  expectedPackageJsonSha256,
  expectedSourceTree,
  packageRoot,
} = {}) {
  assertExpectedSourceTree(expectedSourceTree);
  if (expectedPackageJsonSha256 !== undefined && !SHA256_PATTERN.test(expectedPackageJsonSha256)) {
    throw new Error(`Reviewed Iroha JS package.json digest must be a full lowercase SHA-256: ${expectedPackageJsonSha256}`);
  }
  const canonicalPackageRoot = await realpath(packageRoot);
  const packageMetadata = await lstat(canonicalPackageRoot);
  if (!packageMetadata.isDirectory() || packageMetadata.isSymbolicLink()) {
    throw new Error(`${IROHA_PACKAGE} package root must be a real directory: ${canonicalPackageRoot}`);
  }

  const packageJsonPath = path.join(canonicalPackageRoot, 'package.json');
  const packageJsonMetadata = await lstat(packageJsonPath);
  if (!packageJsonMetadata.isFile() || packageJsonMetadata.isSymbolicLink()) {
    throw new Error(`${IROHA_PACKAGE} package.json must be a real file`);
  }
  const packageJsonBytes = await readFile(packageJsonPath);
  const packageJsonSha256 = createHash('sha256').update(packageJsonBytes).digest('hex');
  if (expectedPackageJsonSha256 !== undefined && packageJsonSha256 !== expectedPackageJsonSha256) {
    throw new Error(
      `${IROHA_PACKAGE} package.json SHA-256 ${packageJsonSha256} does not match reviewed digest ${expectedPackageJsonSha256}`
    );
  }
  const packageJson = JSON.parse(packageJsonBytes.toString('utf8'));
  if (packageJson?.name !== IROHA_PACKAGE) {
    throw new Error(`Installed package must be ${IROHA_PACKAGE}`);
  }

  const sourceRoot = path.join(canonicalPackageRoot, 'src');
  const actualSourceTree = await gitTreeDigest(sourceRoot);
  if (actualSourceTree !== expectedSourceTree) {
    throw new Error(
      `${IROHA_PACKAGE} source tree ${actualSourceTree} does not match reviewed tree ${expectedSourceTree}`
    );
  }

  const runtimeTargets = runtimePackageTargets(packageJson);
  if (runtimeTargets.length === 0) {
    throw new Error(`${IROHA_PACKAGE} package does not declare any runtime targets`);
  }
  await requireRuntimeTargets(
    canonicalPackageRoot,
    runtimeTargets.map((target) => reviewedSourceTarget(canonicalPackageRoot, target))
  );
  const distTargets = runtimeTargets.filter((target) => target.startsWith('./dist/'));
  let changed = false;
  if (distTargets.length > 0) {
    ({ changed } = await publishDistribution(canonicalPackageRoot, sourceRoot, expectedSourceTree));
  }
  await requireRuntimeTargets(canonicalPackageRoot, runtimeTargets);

  return Object.freeze({
    changed,
    packageRoot: canonicalPackageRoot,
    runtimeTargets: Object.freeze(runtimeTargets),
    packageJsonSha256,
    sourceTree: actualSourceTree,
  });
}

function isInside(parent, child) {
  const relative = path.relative(parent, child);
  return relative !== '' && relative !== '..' && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative);
}

async function main() {
  const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const result = await checkIrohaPinFiles({
    packagePath: path.join(repositoryRoot, 'package.json'),
    profilePath: path.join(repositoryRoot, 'tests', 'mochi', 'explorer-profile.json'),
    lockfilePath: path.join(repositoryRoot, 'pnpm-lock.yaml'),
  });
  if (result.errors.length > 0 || !result.revision || !FULL_SHA_PATTERN.test(result.revision)) {
    throw new Error(`Cannot materialize ${IROHA_PACKAGE}: ${result.errors.join('; ') || 'invalid Iroha pin'}`);
  }
  const expectedSourceTree = REVIEWED_IROHA_JS_SRC_TREES[result.revision];
  if (!expectedSourceTree) {
    throw new Error(`Iroha JS revision ${result.revision} has no reviewed installed-source tree`);
  }
  const expectedPackageJsonSha256 = REVIEWED_IROHA_JS_PACKAGE_JSON_SHA256[result.revision];
  if (!expectedPackageJsonSha256) {
    throw new Error(`Iroha JS revision ${result.revision} has no reviewed package.json digest`);
  }

  const nodeModulesRoot = await realpath(path.join(repositoryRoot, 'node_modules'));
  const packageRoot = await realpath(path.join(nodeModulesRoot, IROHA_PACKAGE_PATH));
  if (!isInside(nodeModulesRoot, packageRoot)) {
    throw new Error(`${IROHA_PACKAGE} package root must remain inside this checkout's node_modules`);
  }
  const materialized = await materializeIrohaJsDistribution({
    expectedPackageJsonSha256,
    expectedSourceTree,
    packageRoot,
  });
  console.log(
    `IROHA JS DIST: ${result.revision} source ${materialized.sourceTree}; runtime targets verified`
  );
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(`IROHA JS DIST: ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  });
}
