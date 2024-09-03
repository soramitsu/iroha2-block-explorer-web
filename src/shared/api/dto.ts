import { z } from 'zod';
import BigNumber from 'bignumber.js';
import invariant from 'tiny-invariant';

const paginationSchema = z.object({
  page: z.number(),
  per_page: z.number(),
  total_pages: z.number(),
  total_items: z.number(),
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

class AssetDefinitionId {
  private assetName = '';
  private assetDomain = '';

  public constructor(name: string, domain: string) {
    this.assetName = name;
    this.assetDomain = domain;
  }

  public get name() {
    return this.assetName;
  }
  public get domain() {
    return this.assetDomain;
  }
  public toString() {
    return this.assetName + '#' + this.assetDomain;
  }
}

export function transformToAssetDefinitionId(assetDefinitionId: string): AssetDefinitionId {
  const parts = assetDefinitionId.split('#');
  invariant(parts.length === 2, 'Invalid assetDefinitionId format');

  const [asset, asset_domain] = parts;

  return new AssetDefinitionId(asset, asset_domain);
}

class AssetId {
  private assetName = '';
  private assetDomain = '';
  private accountSignatory = '';
  private accountDomain = '';

  public constructor(data: { asset: string, asset_domain: string, signatory: string, account_domain: string }) {
    this.assetName = data.asset;
    this.assetDomain = data.asset_domain;
    this.accountSignatory = data.signatory;
    this.accountDomain = data.account_domain;
  }

  public get asset() {
    return this.assetName;
  }
  public get domain() {
    return this.assetDomain ? this.assetDomain : this.accountDomain;
  }
  public get signatory() {
    return this.accountSignatory;
  }
  public get account_domain() {
    return this.accountDomain;
  }
  public get asset_definition_id() {
    return this.assetName + '#' + this.domain;
  }
  public toString() {
    return this.assetName + '#' + this.assetDomain + '#' + this.accountSignatory + '@' + this.accountDomain;
  }
}

export function transformToAssetId(assetId: string): AssetId {
  const assetIdParts = assetId.split('#');
  invariant(assetIdParts.length === 3, 'Invalid assetId format');
  const [asset, asset_domain, account] = assetIdParts;

  const accountParts = account.split('@');
  invariant(accountParts.length === 2, 'Invalid account format');
  const [signatory, account_domain] = accountParts;

  const data = {
    asset,
    asset_domain,
    signatory,
    account_domain,
  };

  return new AssetId(data);
}

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
  id: z.string().transform(transformToAssetId),
  value: z.discriminatedUnion('kind', [
    z.object({ kind: z.literal('Numeric'), value: z.string().transform((value) => BigNumber(value)) }),
    z.object({ kind: z.literal('Store'), metadata: metadataSchema }),
  ]),
});

export type Asset = z.infer<typeof assetSchema>;

export const assetDefinitionSchema = z.object({
  id: z.string().transform(transformToAssetDefinitionId),
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
