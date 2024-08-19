import { randNumber } from '@ngneat/falso';
import { hash } from './utils';

export function makeBlockShallow(block_hash?: string): BlockShallow {
  return {
    block_hash: block_hash ?? hash(64),
    height: randNumber(),
    rejected_transactions: randNumber({ min: 0, max: 5 }),
    timestamp: new Date(Date.now() - 10000).toISOString(),
    transactions: randNumber({ min: 1, max: 20 }),
  };
}

export function makeBlock(heightOrHash?: number | string): Block {
  return {
    block_hash: typeof heightOrHash === 'string' ? heightOrHash : hash(64),
    height: typeof heightOrHash === 'number' ? heightOrHash : randNumber(),
    timestamp: new Date(Date.now() - 10000).toISOString(),
    parent_block_hash: hash(64),
    rejected_transactions_merkle_root_hash: hash(64),
    invalidated_blocks_hashes: Array.from({ length: 8 }, () => hash(64)),
    transactions: Array.from({ length: 8 }, () => hash(64)),
    rejected_transactions: Array.from({ length: 8 }, () => hash(64)),
    view_change_proofs: [],
  };
}
