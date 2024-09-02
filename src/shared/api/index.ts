import type {
  Account,
  AssetDefinition,
  Asset,
  AssetSearchParams,
  Block,
  Domain,
  Paginated,
  PaginationParams,
  TransactionSearchParams,
  Transaction,
  PeerStatus,
} from '@/shared/api/dto';

interface HTTPService {
  fetchAccounts: (params?: PaginationParams) => Promise<Paginated<Account>>
  fetchAccount: (id: string) => Promise<Account>
  fetchAssets: (params?: AssetSearchParams) => Promise<Paginated<Asset>>
  fetchAsset: (id: string) => Promise<Asset>
  fetchAssetDefinitions: (params?: PaginationParams) => Promise<Paginated<AssetDefinition>>
  fetchAssetDefinition: (id: string) => Promise<AssetDefinition>
  fetchDomains: (params?: PaginationParams) => Promise<Paginated<Domain>>
  fetchDomain: (id: string) => Promise<Domain>
  fetchBlocks: (params?: PaginationParams) => Promise<Paginated<Block>>
  fetchBlock: (heightOrHash: number | string) => Promise<Block>
  fetchTransactions: (params?: TransactionSearchParams) => Promise<Paginated<Transaction>>
  fetchPeerStatus: () => Promise<PeerStatus>
}

export const http: HTTPService = await import('./http');
