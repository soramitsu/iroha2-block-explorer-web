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
const TransactionStatus = z.enum(['Committed', 'Rejected']);
export type TransactionStatus = z.infer<typeof TransactionStatus>;

const Duration = z.object({
  ms: z.number().min(0),
});
const Timestamp = z.string().transform((ctx) => new Date(ctx));

export const DomainId = z.string().brand('DomainId');
export type DomainId = z.infer<typeof DomainId>;

export class AccountId {
  public readonly signatory: string;
  public readonly domain: DomainId;
  public constructor(signatory: string, domain: DomainId) {
    this.signatory = signatory;
    this.domain = domain;
  }

  public toString() {
    return this.signatory + '@' + this.domain;
  }

  public toJSON() {
    return this.toString();
  }
}

export const AccountIdSchema = z.string().transform((val, ctx) => {
  const accountParts = val.split('@');
  if (accountParts.length !== 2) {
    ctx.addIssue({
      code: z.ZodIssueCode.invalid_literal,
      message: 'Invalid accountId format',
      expected: 'signatory@account_domain format',
      received: val,
    });
  }

  const [account, account_domain] = accountParts;

  return new AccountId(account, account_domain as DomainId);
});

export class AssetDefinitionId {
  public readonly name: string;
  public readonly domain: DomainId;

  public constructor(name: string, domain: DomainId) {
    this.name = name;
    this.domain = domain;
  }

  public toString() {
    return this.name + '#' + this.domain;
  }
}

export const AssetDefinitionIdSchema = z.string().transform((val, ctx) => {
  const assetDefinitionParts = val.split('#');

  if (assetDefinitionParts.length !== 2) {
    ctx.addIssue({
      code: z.ZodIssueCode.invalid_literal,
      message: 'Invalid assetDefinitionId format',
      expected: 'asset#asset_domain format',
      received: val,
    });
  }

  const [asset, asset_domain] = assetDefinitionParts;

  return new AssetDefinitionId(asset, asset_domain as DomainId);
});

export class AssetId {
  public readonly account: AccountId;
  public readonly definition: AssetDefinitionId;

  public constructor(account: AccountId, definition: AssetDefinitionId) {
    this.account = new AccountId(account.signatory, account.domain);
    this.definition = new AssetDefinitionId(definition.name, definition.domain ? definition.domain : account.domain);
  }

  public toString() {
    if (this.account.domain === this.definition.domain) {
      return this.definition.name + '##' + this.account.toString();
    }

    return this.definition.toString() + '#' + this.account.toString();
  }

  public toJSON() {
    return this.toString();
  }
}

export const AssetIdSchema = z.string().transform((val, ctx) => {
  const assetIdParts = val.split('#');
  if (assetIdParts.length !== 3) {
    ctx.addIssue({
      code: z.ZodIssueCode.invalid_literal,
      message: 'Invalid assetId format',
      expected: 'asset#asset_domain#signatory@account_domain or asset##signatory@domain format',
      received: val,
    });
  }

  const [asset, asset_domain, account] = assetIdParts;

  const accountParts = account.split('@');
  if (accountParts.length !== 2) {
    ctx.addIssue({
      code: z.ZodIssueCode.invalid_literal,
      message: 'Invalid account format',
      expected: 'signatory@account_domain format',
      received: account,
    });
  }

  const [signatory, account_domain] = accountParts;

  return new AssetId(
    new AccountId(signatory, account_domain as DomainId),
    new AssetDefinitionId(asset, asset_domain as DomainId)
  );
});

export interface AccountSearchParams extends PaginationParams {
  domain?: DomainId
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
  domain?: DomainId
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
  id: DomainId,
  logo: z.string().nullable(),
  metadata: Metadata,
  owned_by: AccountIdSchema,
  accounts: z.number(),
  assets: z.number(),
});

export type Domain = z.infer<typeof Domain>;

export interface TransactionSearchParams extends PaginationParams {
  authority?: AccountId
  block?: number
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
