import axios from 'axios';
import JSONbig from 'json-bigint';

export type PaginationParams = {
  page: number,
  page_size: number,
}

const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL as string ?? '/api/v1',
  transformResponse: x => JSONbig.parse(x),
});

export async function fetchFakeData(): Promise<Paginated<unknown>> {
  return {
    data: new Array(10).fill({}),
    pagination: {
      page: 1,
      page_size: 10,
      total: 1,
    },
  };
}

export async function fetchAccounts(params?: PaginationParams): Promise<Paginated<Account>> {
  const { data } = await http.get('/accounts', { params });
  return data;
}

export async function fetchAccount(id: string): Promise<Account> {
  const { data } = await http.get(`/accounts/${id}`);
  return data;
}

export async function fetchAssets(params?: PaginationParams): Promise<Paginated<Asset>> {
  const { data } = await http.get('/assets', { params });
  return data;
}

export async function fetchAsset(definition_id: string, account_id: string): Promise<Asset> {
  const { data } = await http.get(`/assets/${definition_id}/${account_id}`);
  return data;
}

export async function fetchAssetDefinitions(params:PaginationParams): Promise<Paginated<AssetDefinition>> {
  const { data } = await http.get('/asset-definitions', { params });
  return data;
}

export async function fetchDomains(params?: PaginationParams): Promise<Paginated<Domain>> {
  const { data } = await http.get('/domains', { params });
  return data;
}

export async function fetchDomain(id: string): Promise<Domain> {
  const { data } = await http.get(`/domains/${id}`);
  return data;
};

export async function fetchPeers(): Promise<Peer[]> {
  const { data } = await http.get('/peer/peers');
  return data;
}

export async function fetchPeerStatus(): Promise<Status> {
  const { data } = await http.get('/peer/status');
  return data;
}

export async function fetchRoles(): Promise<Role[]> {
  const { data } = await http.get('/roles');
  return data;
}

export async function fetchBlocks(params?: PaginationParams): Promise<Paginated<BlockShallow>> {
  const { data } = await http.get('/blocks', { params });
  return data;
}

export async function fetchTransactions(params?: PaginationParams): Promise<Paginated<Transaction>> {
  const { data } = await http.get('/transactions', { params });
  return data;
}
