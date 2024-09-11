import { z } from 'zod';
import BigNumber from 'bignumber.js';

const Paginaion = z.object({
  page: z.number(),
  per_page: z.number(),
  total_pages: z.number(),
  total_items: z.number(),
});

export type Pagination = z.infer<typeof Paginaion>;

export const Paginated = <T extends z.ZodType>(item: T) =>
  z.object({
    pagination: Paginaion,
    items: item.array(),
  });

export interface Paginated<T> {
  pagination: Pagination
  items: T[]
}

const PaginationParams = z
  .object({
    page: z.number(),
    per_page: z.number(),
  })
  .partial();

export type PaginationParams = z.infer<typeof PaginationParams>;

const Metadata = z.record(z.string(), z.any());

const Duration = z.object({
  ms: z.number().min(0),
});
const Timestamp = z.string().transform((ctx) => new Date(ctx));

const DomainId = z.string().brand('DomainId');
export type DomainId = z.infer<typeof DomainId>;

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

export const Account = z.object({
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
  metadata: Metadata,
  owned_assets: z.number(),
  owned_domains: z.number(),
});

export type Account = z.infer<typeof Account>;

export interface AssetSearchParams extends PaginationParams {
  owned_by?: string
}

export const Asset = z.object({
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
    z.object({ kind: z.literal('Store'), metadata: Metadata }),
  ]),
});

export type Asset = z.infer<typeof Asset>;

export const AssetDefinition = z.object({
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
  metadata: Metadata,
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

export type AssetDefinition = z.infer<typeof AssetDefinition>;

export const Domain = z.object({
  id: DomainId,
  logo: z.string().nullable(),
  metadata: Metadata,
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

export type Domain = z.infer<typeof Domain>;

export interface TransactionSearchParams extends PaginationParams {
  authority?: string
  block_hash?: string
}

export const Transaction = z.object({
  authority: z.string(),
  hash: z.string(),
  block_hash: z.string(),
  created_at: Timestamp,
  instructions: z.enum(['Instructions', 'Wasm']),
  status: z.enum(['Committed', 'Rejected']),
});

export const DetailedTransaction = z.object({
  authority: z.string(),
  hash: z.string(),
  block_hash: z.string(),
  created_at: Timestamp,
  instructions: z.enum(['Instructions', 'Wasm']),
  status: z.enum(['Committed', 'Rejected']),
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
  consensus_estimation: Duration,
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
