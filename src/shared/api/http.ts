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

const BASE_URL = import.meta.env.VITE_API_URL ?? '/api/v1';

async function get<T>(path: string, params?: PaginationParams): Promise<T> {
  const url = new URL(`${BASE_URL}${path}`);

  if (params) {
    Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, String(value)));
  }

  const res = await fetch(url);
  return res.json();
}

export function fetchAccounts(params?: PaginationParams): Promise<Paginated<Account>> {
  return get('/accounts', params);
}

export function fetchAccount(id: string): Promise<Account> {
  return get(`/accounts/${id}`);
}

export function fetchAssets(params?: AssetSearchParams): Promise<Paginated<Asset>> {
  return get('/assets', params);
}

export function fetchAsset(id: string): Promise<Asset> {
  return get(`/assets/${id}`);
}

export function fetchAssetDefinitions(params: PaginationParams): Promise<Paginated<AssetDefinition>> {
  return get('/asset-definitions', params);
}

export function fetchAssetDefinition(id: string): Promise<AssetDefinition> {
  return get(`/asset-definitions/${id}`);
}

export function fetchDomains(params?: PaginationParams): Promise<Paginated<Domain>> {
  return get('/domains', params);
}

export function fetchDomain(id: string): Promise<Domain> {
  return get(`/domains/${id}`);
}

export function fetchBlocks(params?: PaginationParams): Promise<Paginated<Block>> {
  return get('/blocks', params);
}

export async function fetchBlock(heightOrHash: number | string): Promise<Block> {
  return get(`/blocks/${heightOrHash}`);
}

export function fetchTransactions(params?: TransactionSearchParams): Promise<Paginated<TransactionWithHash>> {
  return get('/transactions', params);
}
