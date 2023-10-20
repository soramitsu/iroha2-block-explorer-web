import { randNumber } from '@ngneat/falso';
import { hash } from './utils';
import { transactionList } from '../mock-factories/transaction';

export function makeBlock(block_hash?: string): BlockShallow {
  return {
    block_hash: block_hash ?? hash(64),
    height: randNumber(),
    rejected_transactions: randNumber({ min: 0, max: 5 }),
    timestamp: new Date(Date.now() - 10000).toISOString(),
    transactions: randNumber({ min: 1, max: 20 }),
  };
}

export function makeBlockDetails(height?: number): Block {
  return {
    block_hash: hash(64),
    parent_block_hash: hash(64),
    rejected_transactions_merkle_root_hash: hash(64),
    invalidated_blocks_hashes: [],
    height: height ?? randNumber(),
    rejected_transactions: [],
    timestamp: new Date(Date.now() - 10000).toISOString(),
    transactions: transactionList(400),
    view_change_proofs: [],
  };
}
