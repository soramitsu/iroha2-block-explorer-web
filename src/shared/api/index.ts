import type {
  PaginationParams,
  AssetSearchParams,
  TransactionSearchParams,
  AccountSearchParams,
  AssetDefinitionSearchParams,
  InstructionsSearchParams,
  DomainSearchParams,
  NFTsSearchParams,
} from '@/shared/api/schemas';
import type { AccountId, AssetDefinitionId, AssetId, NftId } from '@iroha/core/data-model';
import {
  Account,
  Paginated,
  Asset,
  AssetDefinition,
  Domain,
  Block,
  Transaction,
  DetailedTransaction,
  Instruction,
  NetworkMetrics,
  PeerInfo,
  NFT,
  PeerMetrics,
} from '@/shared/api/schemas';
import { useEventSource } from '@vueuse/core';
import { computed } from 'vue';
import { NOT_FOUND_ERROR } from '@/shared/api/consts';

const BASE_URL = window.location.origin.toString() + '/api/v1';

async function get<T>(path: string, params?: Record<string, any>): Promise<T> {
  const url = new URL(`${BASE_URL}${path}`);

  if (params) {
    Object.entries(params).forEach(([key, value]) => value && url.searchParams.set(key, String(value)));
  }

  const res = await fetch(url);

  if (!res.ok) {
    if (res.status === 404) throw new Error(NOT_FOUND_ERROR);

    throw new Error(await res.text());
  }

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

export async function fetchNFTs(params?: NFTsSearchParams): Promise<Paginated<NFT>> {
  const res = await get('/nfts', params);
  return Paginated(NFT).parse(res);
}

export async function fetchNFTById(id: NftId): Promise<NFT> {
  const res = await get(`/nfts/${encodeURIComponent(id.toString())}`);
  return NFT.parse(res);
}

export async function fetchDomains(params?: DomainSearchParams): Promise<Paginated<Domain>> {
  const res = await get('/domains', params);
  return Paginated(Domain).parse(res);
}

export async function fetchDomain(id: string): Promise<Domain> {
  const res = await get(`/domains/${id}`);
  return Domain.parse(res);
}

export async function fetchBlocks(params?: Partial<PaginationParams>): Promise<Paginated<Block>> {
  const res = await get('/blocks', params);
  return Paginated(Block).parse(res);
}

export async function fetchBlock(heightOrHash: number | string): Promise<Block> {
  const res = await get(`/blocks/${heightOrHash}`);
  return Block.parse(res);
}

export async function fetchNetworkMetrics(): Promise<NetworkMetrics> {
  const res = await get('/telemetry/network');
  return NetworkMetrics.parse(res);
}

export function streamTelemetryMetrics() {
  const { data: streamedMetrics, status } = useEventSource('/api/v1/telemetry/live', [], {
    autoReconnect: true,
  });

  return {
    data: computed(() => {
      if (!streamedMetrics.value) return null;

      return PeerMetrics.parse(JSON.parse(streamedMetrics.value));
    }),
    status,
  };
}

export async function fetchPeersInfo(): Promise<PeerInfo[]> {
  const res = await get('/telemetry/peers-info');
  return PeerInfo.array().parse(res);
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
