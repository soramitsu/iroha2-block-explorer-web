import { makeAccount } from './mock-factories/account';
import { makeAsset, makeAssetDefinition } from './mock-factories/asset';
import { makeBlock, makeBlockShallow } from './mock-factories/block';
import { makeDomain } from './mock-factories/domain';
import { transactionList } from './mock-factories/transaction';
import { list, pagination } from './mock-factories/utils';

const accounts = list(makeAccount, 200);
const assets = list(makeAsset, 200);
const assetDefinitions = list(makeAssetDefinition, 100);
const domains = list(makeDomain, 50);
const blockShallows = list(makeBlockShallow, 50);
const transactions = transactionList(400);

export async function fetchAccounts(params?: PaginationParams): Promise<Paginated<Account>> {
  return pagination(accounts, params);
}

export async function fetchAccount(id: string): Promise<Account> {
  return makeAccount(id);
}

export async function fetchAssets(params?: PaginationParams): Promise<Paginated<Asset>> {
  return pagination(assets, params);
}

export async function fetchAsset(definition_id: string, account_id: string): Promise<Asset> {
  return makeAsset(account_id, definition_id);
}

export async function fetchAssetDefinitions(params: PaginationParams): Promise<Paginated<AssetDefinition>> {
  return pagination(assetDefinitions, params);
}

export async function fetchAssetDefinition(id: string): Promise<AssetDefinition> {
  return assetDefinitions[0];
}

export async function fetchDomains(params?: PaginationParams): Promise<Paginated<Domain>> {
  return pagination(domains, params);
}

export async function fetchDomain(id: string): Promise<Domain> {
  return makeDomain(id);
}

export async function fetchPeers(): Promise<Peer[]> {
  return [];
}

export async function fetchPeerStatus(): Promise<Status> {
  return {
    peers: '0',
    blocks: '0',
    txs: '0',
    uptime: {
      secs: '0',
      nanos: '0',
    },
  };
}

export async function fetchRoles(): Promise<Role[]> {
  return [];
}

export async function fetchBlocks(params?: PaginationParams): Promise<Paginated<BlockShallow>> {
  return pagination(blockShallows, params);
}

export async function fetchBlock(heightOrHash: number | string): Promise<Block> {
  return makeBlock(heightOrHash);
}

export async function fetchTransactions(params?: PaginationParams): Promise<Paginated<TransactionDto>> {
  return pagination(transactions, params);
}
