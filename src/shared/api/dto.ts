/* eslint-disable no-unused-vars */
/* eslint-disable camelcase */
export { };

declare global {
  type Tagged<T, Content> = {
    t: T;
    c: Content;
  };

  type PaginationParams = {
    page: number,
    page_size: number,
  }

  interface Paginated<T> {
    pagination: {
      page: number;
      page_size: number;
      total: number;
    };
    data: T[];
  }

  interface Asset {
    account_id: string;
    definition_id: string;
    value: AssetValue;
  }

  type AssetValue =
    | Tagged<'Quantity', string>
    | Tagged<'BigQuantity', string>
    | Tagged<'Fixed', string>
    | Tagged<'Store', any>;

  type AssetValueType = 'Quantity' | 'BigQuantity' | 'Fixed' | 'Store';

  interface AssetDefinition {
    id: string;
    value_type: AssetValueType;
    mintable: Mintable;
  }

  type Mintable = 'Once' | 'Infinitely' | 'Not'

  interface Peer {
    address: string;
    public_key: PublicKey;
  }

  interface Role {
    id: string;
    permissions: PermissionToken[];
  }

  interface PermissionToken {
    name: string;
    params: any;
  }

  interface Account {
    id: string;
    assets: Asset[];
    signatories?: PublicKey[];
    permission_tokens?: PermissionToken[];
    roles: Role[];
    signature_check_condition?: any;
    metadata: any;
  }

  interface Domain {
    id: string;
    accounts: Account[];
    asset_definitions: AssetDefinition[];
    logo: null | string;
    metadata: any;
    /**
     * amount of triggers, always 0 for now
     */
    triggers: number;
  }

  interface PublicKey {
    digest_function: string;
    payload: string;
  }

  interface Status {
    peers: string;
    blocks: string;
    txs: string;
    uptime: {
      secs: string;
      nanos: string;
    };
  }

  export interface BlockShallow {
    height: number;
    /**
     * ISO DateTime
     */
    timestamp: string;
    block_hash: string;
    /**
     * Transactions count
     */
    transactions: number;
    /**
     * Rejected transactions count
     */
    rejected_transactions: number;
  }

  export interface Block {
    height: number;
    /**
     * See {@link BlockShallow.timestamp}
     */
    timestamp: string;
    block_hash: string;
    parent_block_hash: string;
    rejected_transactions_merkle_root_hash: string;
    invalidated_blocks_hashes: string[];
    /**
     * List of serialized {@link @iroha2/data-model#VersionedValidTransaction}
     */
    transactions: string[];
    /**
     * List of serialized {@link @iroha2/data-model#VersionedRejectedTransaction}
     */
    rejected_transactions: string[];
    /**
     * List of hashes. WIP always empty
     */
    view_change_proofs: string[];
  }

  export type TransactionDto =
    | Tagged<'Committed', CommittedTransaction>
    | Tagged<'Rejected', RejectedTransaction>;

  export interface CommittedTransaction {
    /**
     * WIP zeroed
     */
    block_hash: string;
    block_height: number;
    hash: string;
    payload: TransactionPayload;
    signatures: Signature[];
  }

  export interface RejectedTransaction extends CommittedTransaction {
    /**
     * List of serialized {@link @iroha2/data-model#TransactionRejectionReason}
     */
    rejection_reason: string;
  }

  export interface TransactionPayload {
    account_id: string;
    instructions: TransactionInstructions;
    /**
     * ISO timestamp
     */
    creation_time: string;
    time_to_live_ms: number;
    nonce: null | number;
    metadata: any;
  }

  /**
   * `Instructions` `string[]` - list of serialized
   * {@link @iroha2/data-model#Instruction}
   */
  export type TransactionInstructions =
    | Tagged<'Instructions', string[]>
    | Tagged<'Wasm', undefined>;

  export interface Signature {
    /**
     * Public key's multihash
     */
    public_key: string;
    /**
     * Hex binary
     */
    payload: string;
  }
};
