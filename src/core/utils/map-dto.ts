import { Instruction } from '@iroha2/data-model';
import type { Transaction, TransactionDto } from '@/api/transactions';

function hexToBytes(hex: string) {
  const bytes = [];
  for (let i = 0; i < hex.length; i += 2) {
    bytes.push(parseInt(hex.slice(i, i + 2), 16));
  }

  return Uint8Array.from(bytes);
}

export function mapTransactionFromDto(transaction: TransactionDto): Transaction {
  const instructions =
    transaction.payload.instructions.c?.map((i: string) => Instruction.fromBuffer(hexToBytes(i))) ?? [];

  return {
    committed: !!transaction.rejection_reason,
    block_hash: transaction.block_hash,
    // block_height: transaction.c.block_height ?? 0,
    hash: transaction.hash,
    signatures: transaction.signatures,
    payload: {
      ...transaction.payload,
      instructions,
    },
  };
}
