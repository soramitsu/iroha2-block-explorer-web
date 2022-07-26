import { Instruction } from '@iroha2/data-model';

declare global {
  export interface Transaction {
    block_hash: string;
    payload: {
      account_id: string;
      instructions: Instruction[];
      creation_time: string;
      time_to_live_ms: number;
      nonce: null | number;
      metadata: any;
    }
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

export function mapTransaction(transaction: TransactionDto): Transaction {
  const instructions = transaction.c.payload.instructions.c
    ?.map((i: string) => Instruction.fromBuffer(hexToBytes(i))) ?? [];

  return {
    block_hash: transaction.c.block_hash,
    signatures: transaction.c.signatures,
    payload: {
      ...transaction.c.payload,
      instructions,
    },
  };
};
