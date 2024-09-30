import type {
  PaginationParams,
  AccountId,
  AssetSearchParams,
  AssetId,
  AssetDefinitionId,
  DomainId,
  TransactionSearchParams,
  AccountSearchParams,
  AssetDefinitionSearchParams,
  InstructionsSearchParams,
} from '@/shared/api/schemas';
import {
  Account,
  Paginated,
  Asset,
  AssetDefinition,
  Domain,
  Block,
  PeerStatus,
  Transaction,
  DetailedTransaction,
  Instruction,
} from '@/shared/api/schemas';

const BASE_URL = window.location.toString() + 'api/v1';

async function get<T>(path: string, params?: Record<string, any>): Promise<T> {
  const url = new URL(`${BASE_URL}${path}`);

  if (params) {
    Object.entries(params).forEach(([key, value]) => value && url.searchParams.set(key, String(value)));
  }

  const res = await fetch(url);
  return res.json();
}

export async function fetchAccounts(params?: AccountSearchParams): Promise<Paginated<Account>> {
  const res = await get('/accounts', params);
  return Paginated(Account).parse(res);
}

export async function fetchAccount(id: AccountId): Promise<Account> {
  const res = await get(`/accounts/${id}`);
  return Account.parse(res);
}

export async function fetchAssets(params?: AssetSearchParams): Promise<Paginated<Asset>> {
  const res = await get('/assets', params);
  return Paginated(Asset).parse(res);
}

export async function fetchAsset(id: AssetId): Promise<Asset> {
  const res = await get(`/assets/${id}`);
  return Asset.parse(res);
}

export async function fetchAssetDefinitions(params?: AssetDefinitionSearchParams): Promise<Paginated<AssetDefinition>> {
  const res = await get('/assets-definitions', params);
  return Paginated(AssetDefinition).parse(res);
}

export async function fetchAssetDefinition(id: AssetDefinitionId): Promise<AssetDefinition> {
  const res = await get(`/assets-definitions/${encodeURIComponent(id.toString())}`);
  return AssetDefinition.parse(res);
}

export async function fetchDomains(params?: PaginationParams): Promise<Paginated<Domain>> {
  const res = await get('/domains', params);
  return Paginated(Domain).parse(res);
}

export async function fetchDomain(id: DomainId): Promise<Domain> {
  const res = await get(`/domains/${id}`);
  return Domain.parse(res);
}

export async function fetchBlocks(params?: PaginationParams): Promise<Paginated<Block>> {
  const res = await get('/blocks', params);
  return Paginated(Block).parse(res);
}

export async function fetchBlock(heightOrHash: number | string): Promise<Block> {
  const res = await get(`/blocks/${heightOrHash}`);
  return Block.parse(res);
}

export async function fetchPeerStatus(): Promise<PeerStatus> {
  const res = await get('/status');
  return PeerStatus.parse(res);
}

export async function fetchTransactions(params?: TransactionSearchParams): Promise<Paginated<Transaction>> {
  const res = await get('/transactions', params);
  return Paginated(Transaction).parse(res);
}

export async function fetchTransaction(hash: string): Promise<DetailedTransaction> {
  const res = await get(`/transactions/${hash}`);
  return DetailedTransaction.parse(res);
}

export async function fetchInstructions(params?: InstructionsSearchParams): Promise<Paginated<Instruction>> {
  const res = await get('/instructions', params);
  return Paginated(Instruction).parse(res);
}
