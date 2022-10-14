import { randNumber } from '@ngneat/falso';
import { hash } from './utils';

export function makeBlock(block_hash?: string): BlockShallow {
  return {
    block_hash: block_hash ?? hash(64),
    height: randNumber(),
    rejected_transactions: randNumber({ min: 0, max: 5 }),
    timestamp: new Date(Date.now() - 10000).toISOString(),
    transactions: randNumber({ min: 1, max: 20 }),
  };
}
