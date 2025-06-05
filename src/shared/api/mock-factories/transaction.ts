import { randEmail, randNumber, randTextRange } from '@ngneat/falso';
import { hash } from './utils';

function makeTransactionContent(): CommittedTransaction {
  return {
    block_hash: hash(64),
    block_height: randNumber(),
    hash: hash(64),
    payload: {
      account_id: randEmail(),
      instructions: {
        t: 'Instructions',
        c: [],
      },
      creation_time: new Date(Date.now() - 10000).toISOString(),
      time_to_live_ms: 100000,
      nonce: null,
      metadata: {},
    },
    signatures: [
      {
        public_key: hash(70),
        payload: hash(132),
      },
    ],
  };
}

export function makeCommittedTransaction(): TransactionDto {
  return {
    t: 'Committed',
    c: makeTransactionContent(),
  };
}

export function makeRejectedTransaction(): TransactionDto {
  return {
    t: 'Rejected',
    c: {
      ...makeTransactionContent(),
      rejection_reason: randTextRange({ min: 10, max: 100 }),
    },
  };
}

export function transactionList(length: number): TransactionDto[] {
  const n = length ?? randNumber({ min: 0, max: 400 });

  return new Array(n)
    .fill(null)
    .map((_, i) => i % 5 === 0 ? makeRejectedTransaction() : makeCommittedTransaction());
}
