import type { TransactionStatus } from '@/shared/api/schemas';

export type Status = TransactionStatus | null;
export type TabDefaultScreen = 'All' | 'Transfer' | 'Mint' | 'Burn' | 'Grant' | 'Revoke';
export type TabBlocksScreen = 'Transactions' | 'Transfer' | 'Mint' | 'Burn' | 'Grant' | 'Revoke';
export type TabAssetsSort = 'recent' | 'value';

export interface TabItem<T = string> {
  i18nKey: string
  value: T
}

export const sortOptions: TabItem<TabAssetsSort>[] = [
  { i18nKey: 'sort.mostRecent', value: 'recent' },
  { i18nKey: 'sort.mostValue', value: 'value' },
];

export const blockOptions: TabItem<TabBlocksScreen>[] = [
  { i18nKey: 'transactions.transactions', value: 'Transactions' },
  { i18nKey: 'transactions.transfers', value: 'Transfer' },
  { i18nKey: 'transactions.mints', value: 'Mint' },
  { i18nKey: 'transactions.burns', value: 'Burn' },
  { i18nKey: 'transactions.grants', value: 'Grant' },
  { i18nKey: 'transactions.revokes', value: 'Revoke' },
];

export const defaultOptions: TabItem<TabDefaultScreen>[] = [
  { i18nKey: 'transactions.all', value: 'All' },
  { i18nKey: 'transactions.transfers', value: 'Transfer' },
  { i18nKey: 'transactions.mints', value: 'Mint' },
  { i18nKey: 'transactions.burns', value: 'Burn' },
  { i18nKey: 'transactions.grants', value: 'Grant' },
  { i18nKey: 'transactions.revokes', value: 'Revoke' },
];
