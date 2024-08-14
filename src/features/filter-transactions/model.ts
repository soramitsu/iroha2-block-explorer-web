export type Status = 'committed' | 'rejected' | null;
export type TabDefaultScreen = 'all' | 'transfers' | 'mints' | 'burns' | 'grants' | 'revokes';
export type TabBlocksScreen = 'transactions' | 'transfers' | 'mints' | 'burns' | 'grants' | 'revokes';
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
  { i18nKey: 'transactions.transactions', value: 'transactions' },
  { i18nKey: 'transactions.transfers', value: 'transfers' },
  { i18nKey: 'transactions.mints', value: 'mints' },
  { i18nKey: 'transactions.burns', value: 'burns' },
  { i18nKey: 'transactions.grants', value: 'grants' },
  { i18nKey: 'transactions.revokes', value: 'revokes' },
];

export const defaultOptions: TabItem<TabDefaultScreen>[] = [
  { i18nKey: 'transactions.all', value: 'all' },
  { i18nKey: 'transactions.transfers', value: 'transfers' },
  { i18nKey: 'transactions.mints', value: 'mints' },
  { i18nKey: 'transactions.burns', value: 'burns' },
  { i18nKey: 'transactions.grants', value: 'grants' },
  { i18nKey: 'transactions.revokes', value: 'revokes' },
];
