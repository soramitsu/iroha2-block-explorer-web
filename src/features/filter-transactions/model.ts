export type TransactionStatus = 'committed' | 'rejected' | null;
export type DefaultTransactionTypeTabs = 'all' | 'transfers' | 'mints' | 'burns' | 'grants' | 'revokes';
export type BlockTransactionTypeTabs = 'transactions' | 'transfers' | 'mints' | 'burns' | 'grants' | 'revokes';

export interface TabItem<T = string> {
  i18nKey: string
  value: T
}

export const blockTransactionTypeOptions: TabItem<BlockTransactionTypeTabs>[] = [
  { i18nKey: 'transactions', value: 'transactions' },
  { i18nKey: 'transfers', value: 'transfers' },
  { i18nKey: 'mints', value: 'mints' },
  { i18nKey: 'burns', value: 'burns' },
  { i18nKey: 'grants', value: 'grants' },
  { i18nKey: 'revokes', value: 'revokes' },
];

export const defaultTransactionTypeOptions: TabItem<DefaultTransactionTypeTabs>[] = [
  { i18nKey: 'all', value: 'all' },
  { i18nKey: 'transfers', value: 'transfers' },
  { i18nKey: 'mints', value: 'mints' },
  { i18nKey: 'burns', value: 'burns' },
  { i18nKey: 'grants', value: 'grants' },
  { i18nKey: 'revokes', value: 'revokes' },
];
