export type Status = 'committed' | 'rejected' | null;
export type DefaultTabs = 'all' | 'transfers' | 'mints' | 'burns' | 'grants' | 'revokes';
export type BlockTabs = 'transactions' | 'transfers' | 'mints' | 'burns' | 'grants' | 'revokes';

export interface TabItem<T = string> {
  i18nKey: string
  value: T
}

export const blockOptions: TabItem<BlockTabs>[] = [
  { i18nKey: 'transactions', value: 'transactions' },
  { i18nKey: 'transfers', value: 'transfers' },
  { i18nKey: 'mints', value: 'mints' },
  { i18nKey: 'burns', value: 'burns' },
  { i18nKey: 'grants', value: 'grants' },
  { i18nKey: 'revokes', value: 'revokes' },
];

export const defaultOptions: TabItem<DefaultTabs>[] = [
  { i18nKey: 'all', value: 'all' },
  { i18nKey: 'transfers', value: 'transfers' },
  { i18nKey: 'mints', value: 'mints' },
  { i18nKey: 'burns', value: 'burns' },
  { i18nKey: 'grants', value: 'grants' },
  { i18nKey: 'revokes', value: 'revokes' },
];
