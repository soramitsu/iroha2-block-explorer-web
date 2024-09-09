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

const durationSchema = z.object({
  ms: z.number().min(0),
});
const dateSchema = z.string().transform((ctx) => new Date(ctx));

const domainIdSchema = z.string().brand('DomainId');
export type DomainId = z.infer<typeof domainIdSchema>;

export class AccountId {
  private signatory: string;
  private accountDomain: DomainId;
  public constructor(signatory: string, domain: DomainId) {
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

  return new AccountId(account, account_domain as DomainId);
}

export class AssetDefinitionId {
  private readonly name: string;
  private readonly domain: DomainId;

  public constructor(name: string, domain: DomainId) {
    this.name = name;
    this.domain = domain;
  }

  public getName() {
    return this.name;
  }
  public getDomain() {
    return this.domain;
  }
  public toString() {
    return this.name + '#' + this.domain;
  }
}

export function transformToAssetDefinitionId(assetDefinitionId: string): AssetDefinitionId {
  const [asset, asset_domain] = assetDefinitionId.split('#');

  return new AssetDefinitionId(asset, asset_domain as DomainId);
}

export class AssetId {
  private readonly account: AccountId;
  private readonly definition: AssetDefinitionId;

  public constructor(account: AccountId, definition: AssetDefinitionId) {
    this.account = new AccountId(account.getSignatory(), account.getAccountDomain());
    this.definition = new AssetDefinitionId(
      definition.getName(),
      definition.getDomain() ? definition.getDomain() : account.getAccountDomain()
    );
  }

  public getAccount() {
    return this.account;
  }
  public getDefintion() {
    return this.definition;
  }
  public toString() {
    if (this.account.getAccountDomain() === this.definition.getDomain()) {
      return this.definition.getName() + '##' + this.account.toString();
    }

    return this.definition.toString() + '#' + this.account.toString();
  }
}

export function transformToAssetId(assetId: string): AssetId {
  const [asset, asset_domain, account] = assetId.split('#');
  const [signatory, account_domain] = account.split('@');

  return new AssetId(
    new AccountId(signatory, account_domain as DomainId),
    new AssetDefinitionId(asset, asset_domain as DomainId)
  );
}

export const accountSchema = z.object({
  id: z.string().transform((val, ctx) => {
    if (val.split('@').length !== 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.invalid_literal,
        message: 'Invalid accountId format',
        expected: 'signatory@account_domain format',
        received: val,
      });
    }

    return transformToAccountId(val);
  }),
  metadata: metadataSchema,
  owned_assets: z.number(),
  owned_domains: z.number(),
});

export type Account = z.infer<typeof accountSchema>;

export interface AssetSearchParams extends PaginationParams {
  owned_by?: string
}

export const assetSchema = z.object({
  id: z.string().transform((val, ctx) => {
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

    return transformToAssetId(val);
  }),
  value: z.discriminatedUnion('kind', [
    z.object({ kind: z.literal('Numeric'), value: z.string().transform((value) => BigNumber(value)) }),
    z.object({ kind: z.literal('Store'), metadata: metadataSchema }),
  ]),
});

export type Asset = z.infer<typeof assetSchema>;

export const assetDefinitionSchema = z.object({
  id: z.string().transform((val, ctx) => {
    if (val.split('#').length !== 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.invalid_literal,
        message: 'Invalid assetDefinitionId format',
        expected: 'asset#asset_domain format',
        received: val,
      });
    }

    return transformToAssetDefinitionId(val);
  }),
  type: z.enum(['Numeric', 'Store']),
  logo: z.string().nullable(),
  assets: z.number(),
  metadata: metadataSchema,
  mintable: z.enum(['Infinitely', 'Once', 'Not']),
  owned_by: z.string().transform((val, ctx) => {
    if (val.split('@').length !== 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.invalid_literal,
        message: 'Invalid accountId format',
        expected: 'signatory@account_domain format',
        received: val,
      });
    }

    return transformToAccountId(val);
  }),
});

export type AssetDefinition = z.infer<typeof assetDefinitionSchema>;

export const domainSchema = z.object({
  id: domainIdSchema,
  logo: z.string().nullable(),
  metadata: metadataSchema,
  owned_by: z.string().transform((val, ctx) => {
    if (val.split('@').length !== 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.invalid_literal,
        message: 'Invalid accountId format',
        expected: 'signatory@account_domain format',
        received: val,
      });
    }

    return transformToAccountId(val);
  }),
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
  created_at: dateSchema,
  instructions: z.enum(['Instructions', 'Wasm']),
  status: z.enum(['Committed', 'Rejected']),
});

export const detailedTransactionSchema = z.object({
  authority: z.string(),
  hash: z.string(),
  block_hash: z.string(),
  created_at: dateSchema,
  instructions: z.enum(['Instructions', 'Wasm']),
  status: z.enum(['Committed', 'Rejected']),
  rejection_reason: z.record(z.string(), z.any()).nullable(),
  metadata: metadataSchema,
  nonce: z.number().nullable(),
  signature: z.string(),
  time_to_live: durationSchema.nullable(),
});

export type Transaction = z.infer<typeof transactionSchema>;
export type DetailedTransaction = z.infer<typeof detailedTransactionSchema>;

export const blockSchema = z.object({
  hash: z.string(),
  height: z.number(),
  created_at: dateSchema,
  prev_block_hash: z.string().nullable(),
  transactions_hash: z.string(),
  transactions_rejected: z.number(),
  transactions_total: z.number(),
  consensus_estimation: durationSchema,
});

export type Block = z.infer<typeof blockSchema>;

export const peerStatusSchema = z.object({
  blocks: z.number(),
  peers: z.number(),
  queue_size: z.number(),
  txs_accepted: z.number(),
  txs_rejected: z.number(),
  uptime: durationSchema,
  view_changes: z.number(),
});

export type PeerStatus = z.infer<typeof peerStatusSchema>;
