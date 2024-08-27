import type {
  AccountDto,
  AssetDefinitionDto,
  AssetDto,
  AssetSearchDto,
  BlockDto,
  DomainDto,
  Paginated,
  PaginationParams,
  TransactionSearchDto,
  TransactionWithHashDto,
} from '@/shared/api/dto';

interface HTTPService {
  fetchAccounts: (params?: PaginationParams) => Promise<Paginated<AccountDto>>
  fetchAccount: (id: string) => Promise<AccountDto>
  fetchAssets: (params?: AssetSearchDto) => Promise<Paginated<AssetDto>>
  fetchAsset: (id: string) => Promise<AssetDto>
  fetchAssetDefinitions: (params: PaginationParams) => Promise<Paginated<AssetDefinitionDto>>
  fetchAssetDefinition: (id: string) => Promise<AssetDefinitionDto>
  fetchDomains: (params?: PaginationParams) => Promise<Paginated<DomainDto>>
  fetchDomain: (id: string) => Promise<DomainDto>
  fetchBlocks: (params?: PaginationParams) => Promise<Paginated<BlockDto>>
  fetchBlock: (heightOrHash: number | string) => Promise<BlockDto>
  fetchTransactions: (params?: TransactionSearchDto) => Promise<Paginated<TransactionWithHashDto>>
}

export const http: HTTPService = await import('./http');
