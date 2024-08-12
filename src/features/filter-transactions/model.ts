export type Status = 'committed' | 'rejected' | null;
export type TabDefaultScreen = 'all' | 'transfers' | 'mints' | 'burns' | 'grants' | 'revokes';
export type TabBlocksScreen = 'transactions' | 'transfers' | 'mints' | 'burns' | 'grants' | 'revokes';

export interface TabItem<T = string> {
  i18nKey: string
  value: T
}

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
