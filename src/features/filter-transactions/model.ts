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
  { i18nKey: 'transactions', value: 'transactions' },
  { i18nKey: 'transfers', value: 'transfers' },
  { i18nKey: 'mints', value: 'mints' },
  { i18nKey: 'burns', value: 'burns' },
  { i18nKey: 'grants', value: 'grants' },
  { i18nKey: 'revokes', value: 'revokes' },
];

export const defaultOptions: TabItem<TabDefaultScreen>[] = [
  { i18nKey: 'all', value: 'all' },
  { i18nKey: 'transfers', value: 'transfers' },
  { i18nKey: 'mints', value: 'mints' },
  { i18nKey: 'burns', value: 'burns' },
  { i18nKey: 'grants', value: 'grants' },
  { i18nKey: 'revokes', value: 'revokes' },
];
