import type { Instruction } from '@iroha2/data-model';
import { http } from '@/shared/api';

function hexToBytes(hex: string) {
  const bytes = [];
  for (let i = 0; i < hex.length; i += 2) {
    bytes.push(parseInt(hex.slice(i, i + 2), 16));
  }

  return Uint8Array.from(bytes);
}

export function mapFromDto(transaction: TransactionDto) {
  const instructions: Instruction[] = [];
  // TypeError: Invalid argument type in ToBigInt operation (@iroha2_data-model.js:240)
  //   transaction.c.payload.instructions.c?.map((i: string) => Instruction.fromBuffer(hexToBytes(i))) ?? [];

  return {
    committed: !!transaction.rejection_reason,
    block_hash: transaction.block_hash,
    block_height: transaction.block_height ?? 0,
    hash: transaction.hash,
    signatures: transaction.signatures,
    payload: {
      ...transaction.payload,
      instructions,
    },
  };
}

export async function fetchList(params?: PaginationParams): Promise<Paginated<Transaction>> {
  const res = await http.fetchTransactions(params);
  const data = res.data.map(mapFromDto);

  return {
    pagination: res.pagination,
    data,
  };
}
