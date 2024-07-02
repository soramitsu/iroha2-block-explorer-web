import type { AxiosInstance } from 'axios';
import type { Paginated, PaginationParamsDto, Tagged } from '@/core/types/common';
import { axiosInstance } from '@/api/instance';
import type { Instruction } from '@iroha2/data-model';

export interface TransactionDto {
  /**
   * WIP zeroed
   */
  hash: string
  block_hash: string
  // TODO: bloch_height is missing from backend response
  block_height: number
  payload: TransactionDtoPayload
  signatures: Signature[]
  /**
   * List of serialized {@link @iroha2/data-model#TransactionRejectionReason}
   */
  rejection_reason?: string
}

export interface TransactionDtoPayload extends TransactionDefaultPayload {
  instructions: TransactionInstructions
}

// TODO: Research difference with TransactionDto and design, instructions, block_height
export interface Transaction {
  committed: boolean
  block_hash: string
  // block_height: number
  hash: string
  payload: TransactionPayload
  signatures: Signature[]
  rejection_reason?: string
}

export interface TransactionPayload extends TransactionDefaultPayload {
  instructions: Instruction[]
}

export interface TransactionDefaultPayload {
  account_id: string
  /**
   * ISO timestamp
   */
  creation_time: string
  time_to_live_ms: number | null
  nonce: number | null
  metadata: any
}

/**
 * `Instructions` `string[]` - list of serialized
 * {@link @iroha2/data-model#Instruction}
 */
export type TransactionInstructions = Tagged<'Instructions', string[]> | Tagged<'Wasm', undefined>;

export interface Signature {
  /**
   * Public key's multihash
   */
  public_key: string
  /**
   * Hex binary
   */
  payload: string
}

class TransactionsApi {
  constructor(private readonly axiosInstance: AxiosInstance) {}

  fetchTransactions(params?: PaginationParamsDto): Promise<Paginated<TransactionDto>> {
    return this.axiosInstance.get('/transactions', { params }).then(({ data }) => data);
  }
}

export default new TransactionsApi(axiosInstance);
