import type {
  Account,
  AssetDefinition,
  Asset,
  Domain,
  PaginationParams,
  Block,
  Paginated,
  TransactionSearchParams,
  AssetSearchParams,
  Transaction,
  PeerStatus,
} from '@/shared/api/dto';
import {
  peerStatusSchema,
  accountSchema,
  assetSchema,
  assetDefinitionSchema,
  domainSchema,
  blockSchema,
  paginatedSchema,
  transactionSchema,
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
  const res = await get('/accounts', params);
  return paginatedSchema(accountSchema).parse(res);
}

export async function fetchAccount(id: string): Promise<Account> {
  const res = await get(`/accounts/${id}`);
  return accountSchema.parse(res);
}

export async function fetchAssets(params?: AssetSearchParams): Promise<Paginated<Asset>> {
  const res = await get('/assets', params);
  return paginatedSchema(assetSchema).parse(res);
}

export async function fetchAsset(id: string): Promise<Asset> {
  const res = await get(`/assets/${id}`);
  return assetSchema.parse(res);
}

export async function fetchAssetDefinitions(params?: PaginationParams): Promise<Paginated<AssetDefinition>> {
  const res = await get('/assets-definitions', params);
  return paginatedSchema(assetDefinitionSchema).parse(res);
}

export async function fetchAssetDefinition(id: string): Promise<AssetDefinition> {
  const res = await get(`/assets-definitions/${id}`);
  return assetDefinitionSchema.parse(res);
}

export async function fetchDomains(params?: PaginationParams): Promise<Paginated<Domain>> {
  const res = await get('/domains', params);
  return paginatedSchema(domainSchema).parse(res);
}

export async function fetchDomain(id: string): Promise<Domain> {
  const res = await get(`/domains/${id}`);
  return domainSchema.parse(res);
}

export async function fetchBlocks(params?: PaginationParams): Promise<Paginated<Block>> {
  const res = await get('/blocks', params);
  return paginatedSchema(blockSchema).parse(res);
}

export async function fetchBlock(heightOrHash: number | string): Promise<Block> {
  const res = await get(`/blocks/${heightOrHash}`);
  return blockSchema.parse(res);
}

export async function fetchPeerStatus(): Promise<PeerStatus> {
  const res = await get('/status');
  return peerStatusSchema.parse(res);
}

export async function fetchTransactions(params?: TransactionSearchParams): Promise<Paginated<Transaction>> {
  const res = await get('/transactions', params);
  return paginatedSchema(transactionSchema).parse(res);
}
