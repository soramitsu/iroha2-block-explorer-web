import { z } from 'zod';
import BigNumber from 'bignumber.js';
import { AssetDefinitionId, AccountId, AssetId } from '@iroha/core/data-model';

const Pagination = z.object({
  page: z.number(),
  per_page: z.number(),
  total_pages: z.number(),
  total_items: z.number(),
});

export type Pagination = z.infer<typeof Pagination>;

export const Paginated = <T extends z.ZodType>(item: T) =>
  z.object({
    pagination: Pagination,
    items: item.array(),
  });

export interface Paginated<T> {
  pagination: Pagination
  items: T[]
}

export interface PaginationParams {
  page: number
  per_page: number
}

const Metadata = z.record(z.string(), z.any());
const TransactionStatus = z.enum(['Committed', 'Rejected']);
export type TransactionStatus = z.infer<typeof TransactionStatus>;

const Duration = z.object({
  ms: z.number().min(0),
});
const Timestamp = z.string().transform((ctx) => new Date(ctx));

export const AccountIdSchema = z.string().transform(AccountId.parse);

export const AssetDefinitionIdSchema = z.string().transform(AssetDefinitionId.parse);

export const AssetIdSchema = z.string().transform(AssetId.parse);

export interface AccountSearchParams extends PaginationParams {
  domain?: string
  with_asset?: AssetDefinitionId
}

export const Account = z.object({
  id: AccountIdSchema,
  metadata: Metadata,
  owned_assets: z.number(),
  owned_domains: z.number(),
});

export type Account = z.infer<typeof Account>;

export interface AssetSearchParams extends PaginationParams {
  owned_by?: AccountId
  definition?: AssetDefinitionId
}

export const Asset = z.object({
  id: AssetIdSchema,
  value: z.discriminatedUnion('kind', [
    z.object({ kind: z.literal('Numeric'), value: z.string().transform((value) => BigNumber(value)) }),
    z.object({ kind: z.literal('Store'), metadata: Metadata }),
  ]),
});

export type Asset = z.infer<typeof Asset>;

export interface AssetDefinitionSearchParams extends PaginationParams {
  domain?: string
  owned_by?: AccountId
}

export const AssetDefinition = z.object({
  id: AssetDefinitionIdSchema,
  type: z.enum(['Numeric', 'Store']),
  logo: z.string().nullable(),
  assets: z.number(),
  metadata: Metadata,
  mintable: z.enum(['Infinitely', 'Once', 'Not']),
  owned_by: AccountIdSchema,
});

export type AssetDefinition = z.infer<typeof AssetDefinition>;

export interface DomainSearchParams extends PaginationParams {
  owned_by?: AccountId
}

export const Domain = z.object({
  id: z.string(),
  logo: z.string().nullable(),
  metadata: Metadata,
  owned_by: AccountIdSchema,
  accounts: z.number(),
  assets: z.number(),
});

export type Domain = z.infer<typeof Domain>;

export interface TransactionSearchParams extends Partial<PaginationParams> {
  authority?: AccountId
  block?: number
  status?: TransactionStatus
}

export const Transaction = z.object({
  authority: z.string(),
  hash: z.string(),
  block: z.number(),
  created_at: Timestamp,
  executable: z.enum(['Instructions', 'Wasm']),
  status: TransactionStatus,
});

export const DetailedTransaction = Transaction.extend({
  rejection_reason: z.record(z.string(), z.any()).nullable(),
  metadata: Metadata,
  nonce: z.number().nullable(),
  signature: z.string(),
  time_to_live: Duration.nullable(),
});

export type Transaction = z.infer<typeof Transaction>;
export type DetailedTransaction = z.infer<typeof DetailedTransaction>;

export const Block = z.object({
  hash: z.string(),
  height: z.number(),
  created_at: Timestamp,
  prev_block_hash: z.string().nullable(),
  transactions_hash: z.string(),
  transactions_rejected: z.number(),
  transactions_total: z.number(),
});

export type Block = z.infer<typeof Block>;

export const PeerStatus = z.object({
  blocks: z.number(),
  peers: z.number(),
  queue_size: z.number(),
  txs_accepted: z.number(),
  txs_rejected: z.number(),
  uptime: Duration,
  view_changes: z.number(),
});

export type PeerStatus = z.infer<typeof PeerStatus>;

export interface InstructionsSearchParams extends PaginationParams {
  authority?: string
  kind?: string
  transaction_hash?: string
  transaction_status?: TransactionStatus
  block?: number
}

const InstructionKind = z.enum([
  'Register',
  'Unregister',
  'Mint',
  'Burn',
  'Transfer',
  'SetKeyValue',
  'RemoveKeyValue',
  'Grant',
  'Revoke',
  'ExecuteTrigger',
  'SetParameter',
  'Upgrade',
  'Log',
  'Custom',
]);
export type InstructionKind = z.infer<typeof InstructionKind>;

export const Instruction = z.object({
  authority: z.string(),
  created_at: z.string().transform((x) => new Date(x)),
  kind: InstructionKind,
  // TODO: add payload schemas for every kind
  payload: z.union([z.record(z.string(), z.any()), z.string()]),
  transaction_hash: z.string(),
  transaction_status: TransactionStatus,
  block: z.number(),
});
export type Instruction = z.infer<typeof Instruction>;
