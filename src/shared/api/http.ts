import type {
  AccountDto,
  AssetDefinitionDto,
  AssetDto,
  DomainDto,
  PaginationParams,
  BlockDto,
  Paginated,
  TransactionSearchDto,
  TransactionWithHashDto,
  AssetSearchDto,
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

export function fetchAccounts(params?: PaginationParams): Promise<Paginated<AccountDto>> {
  return get('/accounts', params);
}

export function fetchAccount(id: string): Promise<AccountDto> {
  return get(`/accounts/${id}`);
}

export function fetchAssets(params?: AssetSearchDto): Promise<Paginated<AssetDto>> {
  return get('/assets', params);
}

export function fetchAsset(id: string): Promise<AssetDto> {
  return get(`/assets/${id}`);
}

export function fetchAssetDefinitions(params: PaginationParams): Promise<Paginated<AssetDefinitionDto>> {
  return get('/asset-definitions', params);
}

export function fetchAssetDefinition(id: string): Promise<AssetDefinitionDto> {
  return get(`/asset-definitions/${id}`);
}

export function fetchDomains(params?: PaginationParams): Promise<Paginated<DomainDto>> {
  return get('/domains', params);
}

export function fetchDomain(id: string): Promise<DomainDto> {
  return get(`/domains/${id}`);
}

export function fetchBlocks(params?: PaginationParams): Promise<Paginated<BlockDto>> {
  return get('/blocks', params);
}

export async function fetchBlock(heightOrHash: number | string): Promise<BlockDto> {
  return get(`/blocks/${heightOrHash}`);
}

export function fetchTransactions(params?: TransactionSearchDto): Promise<Paginated<TransactionWithHashDto>> {
  return get('/transactions', params);
}
