import type {
  Account,
  AssetDefinition,
  Asset,
  Domain,
  PaginationParams,
  Block,
  Paginated,
  TransactionSearchParams,
  TransactionWithHash,
  AssetSearchParams,
} from '@/shared/api/dto';
import {
  accountSchema,
  assetSchema,
  assetDefinitionSchema,
  domainSchema,
  blockSchema,
  transactionsWithHashSchema,
} from '@/shared/api/dto';

const BASE_URL = import.meta.env.VITE_API_URL ?? '/api/v1';

async function get<T>(path: string, params?: PaginationParams): Promise<T> {
  const url = new URL(`${BASE_URL}${path}`);

  if (params) {
    Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, String(value)));
  }

  const res = await fetch(url);
  return res.json();
}

export async function fetchAccounts(params?: PaginationParams): Promise<Paginated<Account>> {
  const res = await get<Paginated<Account>>('/accounts', params);
  accountSchema.array().parse(res.items);

  return res;
}

export async function fetchAccount(id: string): Promise<Account> {
  const res = await get<Account>(`/accounts/${id}`);
  return accountSchema.parse(res);
}

export async function fetchAssets(params?: AssetSearchParams): Promise<Paginated<Asset>> {
  const res = await get<Paginated<Asset>>('/assets', params);
  assetSchema.array().parse(res.items);

  return res;
}

export async function fetchAsset(id: string): Promise<Asset> {
  const res = await get<Asset>(`/assets/${id}`);
  return assetSchema.parse(res);
}

export async function fetchAssetDefinitions(params: PaginationParams): Promise<Paginated<AssetDefinition>> {
  const res = await get<Paginated<AssetDefinition>>('/asset-definitions', params);
  assetDefinitionSchema.array().parse(res.items);

  return res;
}

export async function fetchAssetDefinition(id: string): Promise<AssetDefinition> {
  const res = await get<AssetDefinition>(`/asset-definitions/${id}`);
  return assetDefinitionSchema.parse(res);
}

export async function fetchDomains(params?: PaginationParams): Promise<Paginated<Domain>> {
  const res = await get<Paginated<Domain>>('/domains', params);
  domainSchema.array().parse(res.items);

  return res;
}

export async function fetchDomain(id: string): Promise<Domain> {
  const res = await get<Domain>(`/domains/${id}`);
  return domainSchema.parse(res);
}

export async function fetchBlocks(params?: PaginationParams): Promise<Paginated<Block>> {
  const res = await get<Paginated<Block>>('/blocks', params);
  blockSchema.array().parse(res.items);

  return res;
}

export async function fetchBlock(heightOrHash: number | string): Promise<Block> {
  const res = await get<Block>(`/blocks/${heightOrHash}`);
  return blockSchema.parse(res);
}

export async function fetchTransactions(params?: TransactionSearchParams): Promise<Paginated<TransactionWithHash>> {
  const res = await get<Paginated<TransactionWithHash>>('/transactions', params);
  transactionsWithHashSchema.array().parse(res.items);

  return res;
}
