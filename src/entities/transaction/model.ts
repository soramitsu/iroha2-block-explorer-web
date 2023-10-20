import { Instruction } from '@iroha2/data-model';
import { http } from '~shared/api';

declare global {
  export interface Transaction {
    committed: boolean,
    block_hash: string;
    block_height: number;
    hash: string;
    payload: {
      account_id: string;
      instructions: Instruction[];
      creation_time: string;
      time_to_live_ms: number;
      nonce: null | number;
      metadata: any;
    };
    signatures: Signature[];
    rejection_reason?: string;
  }
}

function hexToBytes(hex: string) {
  const bytes = [];
  for (let i = 0; i < hex.length; i += 2) {
    bytes.push(parseInt(hex.slice(i, i + 2), 16));
  }

  return Uint8Array.from(bytes);
}

export function mapFromDto(transaction: TransactionDto): Transaction {
  const instructions = transaction.c.payload.instructions.c
    ?.map((i: string) => Instruction.fromBuffer(hexToBytes(i))) ?? [];

  return {
    committed: transaction.t === 'Committed',
    block_hash: transaction.c.block_hash,
    block_height: transaction.c.block_height ?? 0,
    hash: transaction.c.hash,
    signatures: transaction.c.signatures,
    payload: {
      ...transaction.c.payload,
      instructions,
    },
  };
};

export async function fetchList(params?: PaginationParams): Promise<Paginated<Transaction>> {
  const res = await http.fetchTransactions(params);
  const data = res.data.map(mapFromDto);

  return {
    pagination: res.pagination,
    data,
  };
}
export async function fetchBlocksList(selectedTransaction: TransactionDto[], params?: PaginationParams): Promise<Paginated<Transaction>> {
  const res = await http.fetchBlockTransactions(selectedTransaction);
  const data = res.data.map(mapFromDto);

  return {
    pagination: res.pagination,
    data,
  };
}
