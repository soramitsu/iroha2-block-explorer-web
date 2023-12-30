interface HTTPService {
  fetchAccounts(params?: PaginationParams): Promise<Paginated<Account>>;
  fetchAccount(id: string): Promise<Account>;
  fetchAssets(params?: PaginationParams): Promise<Paginated<Asset>>;
  fetchAsset(definition_id: string, account_id: string): Promise<Asset>;
  fetchAssetDefinitions(params:PaginationParams): Promise<Paginated<AssetDefinition>>;
  fetchDomains(params?: PaginationParams): Promise<Paginated<Domain>>;
  fetchDomain(id: string): Promise<Domain>;
  fetchPeers(): Promise<Peer[]>;
  fetchPeerStatus(): Promise<Status>;
  fetchRoles(): Promise<Role[]>;
  fetchBlocks(params?: PaginationParams): Promise<Paginated<BlockShallow>>;
  fetchBlocksDetails(height_or_hash: number): Promise<Block>;
  fetchTransactions(params?: PaginationParams): Promise<Paginated<TransactionDto>>;
}

export const http: HTTPService = import.meta.env.VITE_FAKE_API_ENABLED === 'TRUE'
  ? await import('./fake-http')
  : await import('./http');
