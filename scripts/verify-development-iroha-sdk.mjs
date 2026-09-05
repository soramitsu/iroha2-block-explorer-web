import { createHash } from 'node:crypto';
import { lstat, readFile, readdir, realpath } from 'node:fs/promises';
import path from 'node:path';

export const DEVELOPMENT_IROHA_SPECIFIER = 'file:vendor/iroha-iroha-js-0.0.3.tgz';
const ARCHIVE_SHA256 = '02f8957b16810e94a034065bce2c80e54912f202d17b7f4dbf78d183f7397054';
const INVENTORY_SHA256 = 'b5af079d33f0729284e4d9c88e69b166e374d80403f231697ae959176b213642';
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');

async function regularBytes(file) {
  const metadata = await lstat(file);
  if (!metadata.isFile() || metadata.isSymbolicLink()) throw new Error(`SDK input must be a regular file: ${file}`);
  return readFile(file);
}

async function inventory(directory, prefix = '') {
  const result = Object.create(null);
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const name = prefix ? `${prefix}/${entry.name}` : entry.name;
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) Object.assign(result, await inventory(file, name));
    else if (entry.isFile()) result[name] = sha256(await regularBytes(file));
    else throw new Error(`Installed SDK must not contain links or special files: ${name}`);
  }
  return result;
}

/** Verify a fixed unsigned development archive; this does not admit an accepted release. */
export async function verifyDevelopmentIrohaSdk(repositoryRoot) {
  const packageJson = JSON.parse(await regularBytes(path.join(repositoryRoot, 'package.json')));
  if (packageJson.dependencies?.['@iroha/iroha-js'] !== DEVELOPMENT_IROHA_SPECIFIER) {
    throw new Error('Development SDK dependency must select the exact reviewed archive');
  }
  const vendor = path.join(repositoryRoot, 'vendor');
  if (sha256(await regularBytes(path.join(vendor, 'iroha-iroha-js-0.0.3.tgz'))) !== ARCHIVE_SHA256) {
    throw new Error('Development SDK archive differs from the reproducible 339a candidate');
  }
  const inventoryBytes = await regularBytes(path.join(vendor, 'iroha-iroha-js-0.0.3.development-files.json'));
  if (sha256(inventoryBytes) !== INVENTORY_SHA256) throw new Error('Development SDK inventory differs from the reviewed archive');
  const expected = JSON.parse(inventoryBytes);
  const nodeModules = await realpath(path.join(repositoryRoot, 'node_modules'));
  const packageRoot = await realpath(path.join(nodeModules, '@iroha/iroha-js'));
  const relative = path.relative(nodeModules, packageRoot);
  if (!relative || relative.startsWith(`..${path.sep}`) || relative === '..' || path.isAbsolute(relative)) {
    throw new Error('Installed development SDK must remain inside this checkout node_modules');
  }
  const actual = await inventory(packageRoot);
  const names = Object.keys(expected).sort();
  if (JSON.stringify(Object.keys(actual).sort()) !== JSON.stringify(names)) {
    throw new Error('Installed development SDK file inventory differs from the reviewed archive');
  }
  for (const name of names) {
    if (actual[name] !== expected[name]) throw new Error(`Installed development SDK bytes differ: ${name}`);
  }
  return { files: names.length, archiveSha256: ARCHIVE_SHA256, status: 'development-only' };
}
