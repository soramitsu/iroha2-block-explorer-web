import type { Instruction } from '@iroha2/data-model';
import { http } from '@/shared/api';

export interface Transaction {
  committed: boolean
  block_hash: string
  block_height: number
  hash: string
  payload: {
    account_id: string
    instructions: Instruction[]
    creation_time: Date
    time_to_live_ms: number | null
    nonce: null | number
    metadata: any
  }
  signatures: Signature[]
  rejection_reason?: string
}

function hexToBytes(hex: string) {
  const bytes = [];
  for (let i = 0; i < hex.length; i += 2) {
    bytes.push(parseInt(hex.slice(i, i + 2), 16));
  }

  return Uint8Array.from(bytes);
}

export function mapFromDto(transaction: TransactionDto): Transaction {
  const instructions: Instruction[] = [];
  // TypeError: Invalid argument type in ToBigInt operation (@iroha2_data-model.js:240)
  //   transaction.c.payload.instructions.c?.map((i: string) => Instruction.fromBuffer(hexToBytes(i))) ?? [];
  // probably incompatibility between the version of @iroha2/data-model package and Iroha itself

  return {
    committed: !!transaction.rejection_reason,
    block_hash: transaction.block_hash,
    block_height: transaction.block_height,
    hash: transaction.hash,
    signatures: transaction.signatures,
    payload: {
      ...transaction.payload,
      creation_time: new Date(transaction.payload.creation_time),
      instructions,
    },
  };
}

export async function fetchList(params?: PaginationParams): Promise<Paginated<TransactionDto>> {
  return await http.fetchTransactions(params);
}
