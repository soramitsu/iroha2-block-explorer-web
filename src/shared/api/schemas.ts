import { z } from 'zod';
import BigNumber from 'bignumber.js';

const pagination = z.object({
  page: z.number(),
  per_page: z.number(),
  total_pages: z.number(),
  total_items: z.number(),
});

export type Pagination = z.infer<typeof pagination>;

export const paginated = <T extends z.ZodType>(item: T) =>
  z.object({
    pagination: pagination,
    items: item.array(),
  });

export interface Paginated<T> {
  pagination: Pagination
  items: T[]
}

const paginationParams = z
  .object({
    page: z.number(),
    per_page: z.number(),
  })
  .partial();

export type PaginationParams = z.infer<typeof paginationParams>;

const metadata = z.record(z.string(), z.any());

const duration = z.object({
  ms: z.number().min(0),
});
const date = z.string().transform((ctx) => new Date(ctx));

const domainId = z.string().brand('DomainId');
export type DomainId = z.infer<typeof domainId>;

export class AccountId {
  private readonly signatory: string;
  private readonly domain: DomainId;
  public constructor(signatory: string, domain: DomainId) {
    this.signatory = signatory;
    this.domain = domain;
  }

  public getSignatory() {
    return this.signatory;
  }
  public getAccountDomain() {
    return this.domain;
  }
  public toString() {
    return this.signatory + '@' + this.domain;
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

export const account = z.object({
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
  metadata: metadata,
  owned_assets: z.number(),
  owned_domains: z.number(),
});

export type Account = z.infer<typeof account>;

export interface AssetSearchParams extends PaginationParams {
  owned_by?: string
}

export const asset = z.object({
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
    z.object({ kind: z.literal('Store'), metadata: metadata }),
  ]),
});

export type Asset = z.infer<typeof asset>;

export const assetDefinition = z.object({
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
  metadata: metadata,
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

export type AssetDefinition = z.infer<typeof assetDefinition>;

export const domain = z.object({
  id: domainId,
  logo: z.string().nullable(),
  metadata: metadata,
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

export type Domain = z.infer<typeof domain>;

export interface TransactionSearchParams extends PaginationParams {
  authority?: string
  block_hash?: string
}

export const transaction = z.object({
  authority: z.string(),
  hash: z.string(),
  block_hash: z.string(),
  created_at: date,
  instructions: z.enum(['Instructions', 'Wasm']),
  status: z.enum(['Committed', 'Rejected']),
});

export const detailedTransaction = z.object({
  authority: z.string(),
  hash: z.string(),
  block_hash: z.string(),
  created_at: date,
  instructions: z.enum(['Instructions', 'Wasm']),
  status: z.enum(['Committed', 'Rejected']),
  rejection_reason: z.record(z.string(), z.any()).nullable(),
  metadata: metadata,
  nonce: z.number().nullable(),
  signature: z.string(),
  time_to_live: duration.nullable(),
});

export type Transaction = z.infer<typeof transaction>;
export type DetailedTransaction = z.infer<typeof detailedTransaction>;

export const block = z.object({
  hash: z.string(),
  height: z.number(),
  created_at: date,
  prev_block_hash: z.string().nullable(),
  transactions_hash: z.string(),
  transactions_rejected: z.number(),
  transactions_total: z.number(),
  consensus_estimation: duration,
});

export type Block = z.infer<typeof block>;

export const peerStatus = z.object({
  blocks: z.number(),
  peers: z.number(),
  queue_size: z.number(),
  txs_accepted: z.number(),
  txs_rejected: z.number(),
  uptime: duration,
  view_changes: z.number(),
});

export type PeerStatus = z.infer<typeof peerStatus>;
