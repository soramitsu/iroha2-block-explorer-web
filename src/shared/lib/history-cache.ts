import { isCanonicalIrohaHashLiteral32 } from './iroha-hash';

/** Cache identity is exact ledger metadata plus the active Torii endpoint. */
export function historyCacheKey(kind: string, networkId: string | undefined, toriiUrl: string): string | null {
  if (!networkId || !isCanonicalIrohaHashLiteral32(networkId)) return null;
  try {
    const endpoint = new URL(toriiUrl);
    if (!['http:', 'https:'].includes(endpoint.protocol) || endpoint.username || endpoint.password) return null;
  } catch {
    return null;
  }
  return `iroha-history-v1:${kind}:${encodeURIComponent(networkId)}:${encodeURIComponent(toriiUrl)}`;
}
