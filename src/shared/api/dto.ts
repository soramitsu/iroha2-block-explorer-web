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

export type AccountDto = z.infer<typeof accountSchema>;

const assetSearchDto = paginationParamsSchema.extend({
  owned_by: accountIdSchema.optional(),
});
export type AssetSearchDto = z.infer<typeof assetSearchDto>;

export const assetSchema = z.object({
  id: assetIdSchema,
  value: z.union([
    z.object({ kind: z.literal('Numeric'), value: z.string().transform((value) => BigNumber(value)) }),
    z.object({ kind: z.literal('Store'), metadata: metadataSchema }),
  ]),
});

export type AssetDto = z.infer<typeof assetSchema>;

export const assetDefinitionSchema = z.object({
  id: assetDefinitionIdSchema,
  logo: z.string().nullable(),
  metadata: metadataSchema,
  mintable: z.enum(['Infinitely', 'Once', 'Not']),
  owned_by: accountIdSchema,
  type: z.union([
    z.object({
      kind: z.literal('Numeric'),
      scale: z
        .number()
        .min(0)
        .transform((value) => BigNumber(value))
        .nullable(),
    }),
    z.object({ kind: z.literal('Store') }),
  ]),
});

export type AssetDefinitionDto = z.infer<typeof assetDefinitionSchema>;

const transactionSearchSchema = paginationParamsSchema.extend({
  account: accountIdSchema.optional(),
});
export type TransactionSearchDto = z.infer<typeof transactionSearchSchema>;

const transactionPayloadSchema = z.object({
  authority: z.string(),
  chain: z.string(),
  created_at: z.string().transform((x) => new Date(x)),
  instructions: z.union([
    z.object({ kind: z.literal('Instructions'), value: z.record(z.string(), z.any()).array() }),
    z.object({ kind: z.literal('Wasm') }),
  ]),
  metadata: metadataSchema,
  time_to_live: z
    .object({
      ms: z
        .number()
        .min(0)
        .transform((value) => BigNumber(value)),
    })
    .nullable(),
  nonce: z.number().nullable(),
});

export const transactionSchema = z.object({
  hash: z.string(),
  error: z
    .object({
      Validation: z.object({
        InstructionFailed: z.object({
          Math: z.string(),
        }),
      }),
    })
    .nullable(),
  payload: transactionPayloadSchema,
  signature: z.string(),
  block_hash: z.string(),
});

export type TransactionDto = z.infer<typeof transactionSchema>;

const transactionBlockSchema = transactionSchema.omit({ block_hash: true });

export const blockSchema = z.object({
  hash: z.string(),
  header: z.object({
    consensus_estimation: z.object({
      ms: z
        .number()
        .min(0)
        .transform((value) => BigNumber(value)),
    }),
    created_at: z.string().transform((x) => new Date(x)),
    height: z.number(),
    prev_block_hash: z.string().nullable(),
    transactions_hash: z.string(),
  }),

  signatures: z.array(
    z.object({
      payload: z.string(),
      topology_index: z
        .number()
        .min(0)
        .transform((value) => BigNumber(value)),
    })
  ),

  transactions: transactionBlockSchema.array(),
});

export type BlockDto = z.infer<typeof blockSchema>;

export const domainSchema = z.object({
  id: domainIdSchema,
  logo: z.string().nullable(),
  metadata: metadataSchema,
  owned_by: z.string(),
});

export type DomainDto = z.infer<typeof domainSchema>;
