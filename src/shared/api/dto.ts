import { z } from 'zod';
import BigNumber from 'bignumber.js';

const paginationSchema = z.object({
  page: z.number(),
  per_page: z.number(),
  // TODO: remove nullable when backend is ready
  total_pages: z.number().nullable(),
  total_items: z.number().nullable(),
});

export type Pagination = z.infer<typeof paginationSchema>;

export const paginatedSchema = <T extends z.ZodType>(item: T) =>
  z.object({
    pagination: paginationSchema,
    items: item.array(),
  });

export interface Paginated<T> {
  pagination: Pagination
  items: T[]
}

const paginationParamsSchema = z
  .object({
    page: z.number(),
    per_page: z.number(),
  })
  .partial();

export type PaginationParams = z.infer<typeof paginationParamsSchema>;

const metadataSchema = z.record(z.string(), z.any());

const accountIdSchema = z.string().brand('AccountId');
const domainIdSchema = z.string().brand('DomainId');
const assetDefinitionIdSchema = z.string().brand('AssetDefinitionId');
const assetIdSchema = z.string().brand('AssetId');

export const accountSchema = z.object({
  id: accountIdSchema,
  metadata: metadataSchema,
  owned_assets: z.number(),
  owned_domains: z.number(),
});

export type Account = z.infer<typeof accountSchema>;

export interface AssetSearchParams extends PaginationParams {
  owned_by?: string
}

export const assetSchema = z.object({
  id: assetIdSchema,
  value: z.discriminatedUnion('kind', [
    z.object({ kind: z.literal('Numeric'), value: z.string().transform((value) => BigNumber(value)) }),
    z.object({ kind: z.literal('Store'), metadata: metadataSchema }),
  ]),
});

export type Asset = z.infer<typeof assetSchema>;

export const assetDefinitionSchema = z.object({
  id: assetDefinitionIdSchema,
  type: z.enum(['Numeric', 'Store']),
  logo: z.string().nullable(),
  assets: z.number(),
  metadata: metadataSchema,
  mintable: z.enum(['Infinitely', 'Once', 'Not']),
  owned_by: accountIdSchema,
});

export type AssetDefinition = z.infer<typeof assetDefinitionSchema>;

export const domainSchema = z.object({
  id: domainIdSchema,
  logo: z.string().nullable(),
  metadata: metadataSchema,
  owned_by: z.string(),
  accounts: z.number(),
  assets: z.number(),
});

export type Domain = z.infer<typeof domainSchema>;

export interface TransactionSearchParams extends PaginationParams {
  authority?: string
  block_hash?: string
}

export const transactionSchema = z.object({
  authority: z.string(),
  hash: z.string(),
  block_hash: z.string(),
  error: z.boolean(),
  created_at: z.string().transform((x) => new Date(x)),
  instructions: z.enum(['Instructions', 'Wasm']),
});

export const detailedTransactionSchema = z.object({
  authority: z.string(),
  hash: z.string(),
  block_hash: z.string(),
  created_at: z.string().transform((x) => new Date(x)),
  instructions: z.enum(['Instructions', 'Wasm']),
  error: z.record(z.string(), z.any()).nullable(),
  metadata: metadataSchema,
  nonce: z.number().nullable(),
  signature: z.string(),
  time_to_live: z
    .object({
      ms: z.number().min(0),
    })
    .nullable(),
});

export type Transaction = z.infer<typeof transactionSchema>;
export type DetailedTransaction = z.infer<typeof detailedTransactionSchema>;

export const blockSchema = z.object({
  hash: z.string(),
  height: z.number(),
  created_at: z.string().transform((x) => new Date(x)),
  prev_block_hash: z.string().nullable(),
  transactions_hash: z.string(),
  transactions_rejected: z.number(),
  transactions_total: z.number(),
  consensus_estimation: z.object({
    ms: z.number().min(0),
  }),
});

export type Block = z.infer<typeof blockSchema>;

export const peerStatusSchema = z.object({
  blocks: z.number(),
  peers: z.number(),
  queue_size: z.number(),
  txs_accepted: z.number(),
  txs_rejected: z.number(),
  uptime: z.object({
    ms: z.number().min(0),
  }),
  view_changes: z.number(),
});

export type PeerStatus = z.infer<typeof peerStatusSchema>;
