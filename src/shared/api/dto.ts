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
  logo: z.string().nullable(),
  metadata: metadataSchema,
  mintable: z.enum(['Infinitely', 'Once', 'Not']),
  owned_by: accountIdSchema,
  type: z.discriminatedUnion('kind', [
    z.object({
      kind: z.literal('Numeric'),
      scale: z.number().min(0).nullable(),
    }),
    z.object({ kind: z.literal('Store') }),
  ]),
});

export type AssetDefinition = z.infer<typeof assetDefinitionSchema>;

export const domainSchema = z.object({
  id: domainIdSchema,
  logo: z.string().nullable(),
  metadata: metadataSchema,
  owned_by: z.string(),
});

export type Domain = z.infer<typeof domainSchema>;

export interface TransactionSearchParams extends PaginationParams {
  account?: string
}

const transactionPayloadSchema = z.object({
  authority: z.string(),
  chain: z.string(),
  created_at: z.string().transform((x) => new Date(x)),
  instructions: z.discriminatedUnion('kind', [
    z.object({ kind: z.literal('Instructions'), value: z.record(z.string(), z.any()).array() }),
    z.object({ kind: z.literal('Wasm') }),
  ]),
  metadata: metadataSchema,
  time_to_live: z
    .object({
      ms: z.number().min(0),
    })
    .nullable(),
  nonce: z.number().nullable(),
});

const transactionSchema = z.object({
  hash: z.string(),
  error: z.record(z.string(), z.any()).nullable(),
  payload: transactionPayloadSchema,
  signature: z.string(),
});

export const transactionsWithHashSchema = transactionSchema.extend({
  block_hash: z.string(),
});

export type Transaction = z.infer<typeof transactionSchema>;
export type TransactionWithHash = z.infer<typeof transactionsWithHashSchema>;

export const blockSchema = z.object({
  hash: z.string(),
  header: z.object({
    consensus_estimation: z.object({
      ms: z.number().min(0),
    }),
    created_at: z.string().transform((x) => new Date(x)),
    height: z.number(),
    prev_block_hash: z.string().nullable(),
    transactions_hash: z.string(),
  }),

  signatures: z.array(
    z.object({
      payload: z.string(),
      topology_index: z.number().min(0),
    })
  ),

  transactions: transactionSchema.array(),
});

export type Block = z.infer<typeof blockSchema>;
