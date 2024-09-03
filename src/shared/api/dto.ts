import { z } from 'zod';
import BigNumber from 'bignumber.js';

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

class DomainId {
  private domain: string;
  constructor(domain: string) {
    this.domain = domain;
  }
  public getDomain() {
    return this.domain;
  }
}

class AccountId {
  private signatory: string;
  private accountDomain: string;
  public constructor(signatory: string, domain: string) {
    this.signatory = signatory;
    this.accountDomain = domain;
  }

  public getSignatory() {
    return this.signatory;
  }
  public getAccountDomain() {
    return this.accountDomain;
  }
  public toString() {
    return this.signatory + '@' + this.accountDomain;
  }
}

export function transformToAccountId(accountId: string): AccountId {
  const [account, account_domain] = accountId.split('@');

  return new AccountId(account, account_domain);
}

class AssetDefinitionId {
  private name: string;
  private domain: DomainId;

  public constructor(name: string, domain: string) {
    this.name = name;
    this.domain = new DomainId(domain);
  }

  public getName() {
    return this.name;
  }
  public getDomain() {
    return this.domain.getDomain();
  }
  public toString() {
    return this.name + '#' + this.domain.getDomain();
  }
}

export function transformToAssetDefinitionId(assetDefinitionId: string): AssetDefinitionId {
  const [asset, asset_domain] = assetDefinitionId.split('#');

  return new AssetDefinitionId(asset, asset_domain);
}

class AssetId {
  private account: AccountId;
  private definition: AssetDefinitionId;

  public constructor(data: { asset: string, asset_domain: string, signatory: string, account_domain: string }) {
    this.account = new AccountId(data.signatory, data.account_domain);
    this.definition = new AssetDefinitionId(data.asset, data.asset_domain ? data.asset_domain : data.account_domain);
  }

  public get asset() {
    return this.definition.getName();
  }
  public get domain() {
    return this.definition.getDomain();
  }
  public get assetDefinition() {
    return this.definition.toString();
  }
  public get signatory() {
    return this.account.getSignatory();
  }
  public get accountDomain() {
    return this.account.getAccountDomain();
  }
  public toString() {
    return this.definition.toString() + '#' + this.account.toString();
  }
}

export function transformToAssetId(assetId: string): AssetId {
  const [asset, asset_domain, account] = assetId.split('#');
  const [signatory, account_domain] = account.split('@');

  const data = {
    asset,
    asset_domain,
    signatory,
    account_domain,
  };

  return new AssetId(data);
}

export const accountSchema = z.object({
  id: z
    .string()
    .superRefine((val, ctx) => {
      if (val.split('@').length !== 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.invalid_literal,
          message: 'Invalid accountId format',
          expected: 'signatory@account_domain format',
          received: val,
        });
      }
    })
    .transform(transformToAccountId),
  metadata: metadataSchema,
  owned_assets: z.number(),
  owned_domains: z.number(),
});

export type Account = z.infer<typeof accountSchema>;

export interface AssetSearchParams extends PaginationParams {
  owned_by?: string
}

export const assetSchema = z.object({
  id: z
    .string()
    .superRefine((val, ctx) => {
      const assetIdParts = val.split('#');
      if (assetIdParts.length !== 3) {
        ctx.addIssue({
          code: z.ZodIssueCode.invalid_literal,
          message: 'Invalid assetId format',
          expected: 'asset#asset_domain#signatory@account_domain or asset##signatory@domain format',
          received: val,
        });
      }

      const [, , account] = assetIdParts;

      const accountParts = account.split('@');
      if (accountParts.length !== 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.invalid_literal,
          message: 'Invalid account format',
          expected: 'signatory@account_domain format',
          received: account,
        });
      }
    })
    .transform(transformToAssetId),
  value: z.discriminatedUnion('kind', [
    z.object({ kind: z.literal('Numeric'), value: z.string().transform((value) => BigNumber(value)) }),
    z.object({ kind: z.literal('Store'), metadata: metadataSchema }),
  ]),
});

export type Asset = z.infer<typeof assetSchema>;

export const assetDefinitionSchema = z.object({
  id: z
    .string()
    .superRefine((val, ctx) => {
      if (val.split('#').length !== 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.invalid_literal,
          message: 'Invalid assetDefinitionId format',
          expected: 'asset#asset_domain format',
          received: val,
        });
      }
    })
    .transform(transformToAssetDefinitionId),
  type: z.enum(['Numeric', 'Store']),
  logo: z.string().nullable(),
  assets: z.number(),
  metadata: metadataSchema,
  mintable: z.enum(['Infinitely', 'Once', 'Not']),
  owned_by: z
    .string()
    .superRefine((val, ctx) => {
      if (val.split('@').length !== 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.invalid_literal,
          message: 'Invalid accountId format',
          expected: 'signatory@account_domain format',
          received: val,
        });
      }
    })
    .transform(transformToAccountId),
});

export type AssetDefinition = z.infer<typeof assetDefinitionSchema>;

export const domainSchema = z.object({
  id: z.string().transform((ctx) => new DomainId(ctx)),
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
