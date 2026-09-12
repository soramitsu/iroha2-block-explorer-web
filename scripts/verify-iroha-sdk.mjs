/** Read-only package integrity checks. These hashes identify the admitted
 * consumer artifact; they do not grant signed release or deployment authority. */
import { createHash } from 'node:crypto';
import { lstat, readFile, readdir, realpath } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const IROHA_SDK_SPECIFIER = 'file:vendor/iroha-iroha-js-0.0.3.tgz';
export const IROHA_SDK_ARCHIVE_SHA256 = '02600597032e3c0074b915c06b6125aea3a98c549f60e0ccee7d75dfdbdbb79f';
export const IROHA_SDK_INVENTORY_SHA256 = '9ef5fecacf6ced1799ad28393ed42dfb3fd64c992076c7eb474fea9ae2c50ba7';
const archiveBytesLength = 6911208;
const inventoryBytesLength = 25758;
const inventoryFilename = 'iroha-iroha-js-0.0.3.files.json';
const hash = bytes => createHash('sha256').update(bytes).digest('hex');

async function regularBytes(filename, expectedSize) {
  if (await realpath(filename) !== filename) throw new Error(`SDK input must not traverse links: ${filename}`);
  const before = await lstat(filename);
  if (!before.isFile() || before.isSymbolicLink()) throw new Error(`SDK input must be a regular file: ${filename}`);
  if (before.size > 64 * 1024 * 1024 || (expectedSize !== undefined && before.size !== expectedSize)) {
    throw new Error(`SDK input size differs from the pinned artifact: ${filename}`);
  }
  const bytes = await readFile(filename); const after = await lstat(filename);
  if (before.ino !== after.ino || before.dev !== after.dev || before.size !== after.size || bytes.length !== after.size
    || before.mtimeMs !== after.mtimeMs || before.ctimeMs !== after.ctimeMs || before.mode !== after.mode) {
    throw new Error(`SDK input changed while reading: ${filename}`);
  }
  return bytes;
}

async function verifiedArchiveInputs(repositoryRoot) {
  const repository = await realpath(repositoryRoot);
  const packageJson = JSON.parse(await regularBytes(path.join(repository, 'package.json')));
  if (packageJson.dependencies?.['@iroha/iroha-js'] !== IROHA_SDK_SPECIFIER) {
    throw new Error('SDK dependency must select the exact admitted vendored archive');
  }
  const archive = await regularBytes(path.join(repository, IROHA_SDK_SPECIFIER.slice(5)), archiveBytesLength);
  if (hash(archive) !== IROHA_SDK_ARCHIVE_SHA256) throw new Error('SDK archive differs from the pinned consumer artifact');
  const inventoryBytes = await regularBytes(path.join(repository, 'vendor', inventoryFilename), inventoryBytesLength);
  if (hash(inventoryBytes) !== IROHA_SDK_INVENTORY_SHA256) throw new Error('SDK inventory differs from the pinned consumer artifact');
  const inventory = JSON.parse(inventoryBytes);
  if (inventory.schema !== 'iroha.sdk-package-inventory.v1' || inventory.archiveSha256 !== IROHA_SDK_ARCHIVE_SHA256 || inventory.files.length !== 200) {
    throw new Error('SDK inventory does not describe the admitted 200-file package');
  }
  return { repository, inventory };
}

/** Check immutable inputs before an offline package install exists. */
export async function verifyIrohaSdkArchive(repositoryRoot) {
  const { inventory } = await verifiedArchiveInputs(repositoryRoot);
  return { files: inventory.files.length, archiveSha256: IROHA_SDK_ARCHIVE_SHA256, inventorySha256: IROHA_SDK_INVENTORY_SHA256, status: 'archive-integrity-verified' };
}

/** Verify every installed package byte, including the existing glue and Wasm.
 * Missing dist files fail; this checker never copies source or builds anything. */
export async function verifyIrohaSdk(repositoryRoot) {
  const { repository, inventory } = await verifiedArchiveInputs(repositoryRoot);
  const nodeModules = await realpath(path.join(repository, 'node_modules'));
  if (nodeModules !== path.join(repository, 'node_modules')) throw new Error('SDK node_modules must be a real directory inside this checkout');
  const packageRoot = await realpath(path.join(nodeModules, '@iroha/iroha-js'));
  const relative = path.relative(nodeModules, packageRoot);
  if (!relative || relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
    throw new Error('Installed SDK must remain inside this checkout node_modules');
  }
  const expectedFiles = new Map(inventory.files.map(entry => [entry.path, entry]));
  const expectedDirectories = new Set(inventory.files.flatMap(entry => {
    const segments = entry.path.split('/');
    return segments.slice(0, -1).map((_, index) => segments.slice(0, index + 1).join('/'));
  }));
  const found = [];
  async function visit(directory, prefix = '') {
    for (const name of (await readdir(directory)).sort()) {
      const relative = `${prefix}${name}`; const filename = path.join(directory, name);
      const metadata = await lstat(filename);
      if (metadata.isDirectory() && !metadata.isSymbolicLink()) {
        if (!expectedDirectories.has(relative)) throw new Error(`Installed SDK contains an unexpected directory: ${relative}`);
        await visit(filename, `${relative}/`);
      } else if (metadata.isFile() && !metadata.isSymbolicLink()) {
        const expected = expectedFiles.get(relative);
        if (!expected) throw new Error(`Installed SDK contains an unexpected file: ${relative}`);
        const bytes = await regularBytes(filename, expected.sizeBytes);
        if (hash(bytes) !== expected.sha256) throw new Error(`Installed SDK bytes differ: ${relative}`);
        found.push(relative);
      } else throw new Error(`Installed SDK must not contain links or special files: ${relative}`);
    }
  }
  await visit(packageRoot);
  if (JSON.stringify(found.sort()) !== JSON.stringify([...expectedFiles.keys()].sort())) {
    throw new Error('Installed SDK file inventory differs from the admitted package');
  }
  return { files: found.length, archiveSha256: IROHA_SDK_ARCHIVE_SHA256, inventorySha256: IROHA_SDK_INVENTORY_SHA256, status: 'package-integrity-verified' };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2);
    if (args.length > 1 || (args.length === 1 && args[0] !== '--archive-only')) throw new Error('Usage: node scripts/verify-iroha-sdk.mjs [--archive-only]');
    const repository = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
    const result = await (args.length ? verifyIrohaSdkArchive(repository) : verifyIrohaSdk(repository));
    console.log(JSON.stringify(result));
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
