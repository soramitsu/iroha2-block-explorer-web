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
  AccountId,
  AssetId,
  AssetDefinitionId,
  DomainId,
} from './schemas';
import { peerStatus, account, asset, assetDefinition, domain, block, paginated, transaction } from './schemas';

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
  return paginated(account).parse(res);
}

export async function fetchAccount(id: AccountId): Promise<Account> {
  const res = await get(`/accounts/${id.toString()}`);
  return account.parse(res);
}

export async function fetchAssets(params?: AssetSearchParams): Promise<Paginated<Asset>> {
  const res = await get('/assets', params);
  return paginated(asset).parse(res);
}

export async function fetchAsset(id: AssetId): Promise<Asset> {
  const res = await get(`/assets/${id.toString()}`);
  return asset.parse(res);
}

export async function fetchAssetDefinitions(params?: PaginationParams): Promise<Paginated<AssetDefinition>> {
  const res = await get('/assets-definitions', params);
  return paginated(assetDefinition).parse(res);
}

export async function fetchAssetDefinition(id: AssetDefinitionId): Promise<AssetDefinition> {
  const res = await get(`/assets-definitions/${encodeURIComponent(id.toString())}`);
  return assetDefinition.parse(res);
}

export async function fetchDomains(params?: PaginationParams): Promise<Paginated<Domain>> {
  const res = await get('/domains', params);
  return paginated(domain).parse(res);
}

export async function fetchDomain(id: DomainId): Promise<Domain> {
  const res = await get(`/domains/${id}`);
  return domain.parse(res);
}

export async function fetchBlocks(params?: PaginationParams): Promise<Paginated<Block>> {
  const res = await get('/blocks', params);
  return paginated(block).parse(res);
}

export async function fetchBlock(heightOrHash: number | string): Promise<Block> {
  const res = await get(`/blocks/${heightOrHash}`);
  return block.parse(res);
}

export async function fetchPeerStatus(): Promise<PeerStatus> {
  const res = await get('/status');
  return peerStatus.parse(res);
}

export async function fetchTransactions(params?: TransactionSearchParams): Promise<Paginated<Transaction>> {
  const res = await get('/transactions', params);
  return paginated(transaction).parse(res);
}
