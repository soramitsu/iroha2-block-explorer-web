/* eslint-disable no-unused-vars */
/* eslint-disable camelcase */
import type { JsonObject } from 'type-fest';
import type { Instruction } from '@iroha2/data-model';

export {};

declare global {
  interface Tagged<T, Content> {
    t: T
    c: Content
  }

  interface PaginationParams {
    page: number
    page_size: number
  }

  interface Paginated<T> {
    pagination: {
      page: number
      page_size: number
      total: number
    }
    data: T[]
  }

  interface Asset {
    account_id: string
    definition_id: string
    value: AssetValue
  }

  type AssetValue =
    | Tagged<'Quantity', string>
    | Tagged<'BigQuantity', string>
    | Tagged<'Fixed', string>
    | Tagged<'Store', JsonObject>;

  type AssetValueType = 'Quantity' | 'BigQuantity' | 'Fixed' | 'Store';

  interface AssetDefinition {
    id: string
    value_type: AssetValueType
    mintable: Mintable
  }

  type Mintable = 'Once' | 'Infinitely' | 'Not';

  interface Peer {
    address: string
    public_key: PublicKey
  }

  interface Role {
    id: string
    permissions: PermissionToken[]
  }

  interface PermissionToken {
    name: string
    params: any
  }

  interface Account {
    id: string
    assets: Asset[]
    signatories?: PublicKey[]
    permission_tokens?: PermissionToken[]
    roles: Role[]
    signature_check_condition?: any
    metadata: any
  }

  interface Domain {
    id: string
    accounts: Account[]
    asset_definitions: AssetDefinition[]
    logo: null | string
    metadata: any
    /**
     * amount of triggers, always 0 for now
     */
    triggers: number
  }

  interface PublicKey {
    digest_function: string
    payload: string
  }

  interface Status {
    peers: string
    blocks: string
    txs: string
    uptime: {
      secs: string
      nanos: string
    }
  }

  export interface BlockShallow {
    height: number
    /**
     * ISO DateTime
     */
    timestamp: string
    block_hash: string
    /**
     * Transactions count
     */
    transactions: number
    /**
     * Rejected transactions count
     */
    rejected_transactions: number
  }

  export interface Block {
    height: number
    /**
     * See {@link BlockShallow.timestamp}
     */
    timestamp: string
    block_hash: string
    parent_block_hash: string
    rejected_transactions_merkle_root_hash: string
    invalidated_blocks_hashes: string[]
    /**
     * List of serialized {@link @iroha2/data-model#VersionedValidTransaction}
     */
    transactions: string[]
    /**
     * List of serialized {@link @iroha2/data-model#VersionedRejectedTransaction}
     */
    rejected_transactions: string[]
    /**
     * List of hashes. WIP always empty
     */
    view_change_proofs: string[]
  }

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
    hash: string
    block_hash: string
    block_height: number
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
}
