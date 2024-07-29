export type TransactionStatus = 'committed' | 'rejected' | null;
export type DefaultTransactionTypeTabs = 'all' | 'transfers' | 'mints' | 'burns' | 'grants' | 'revokes';
export type BlockTransactionTypeTabs = 'transactions' | 'transfers' | 'mints' | 'burns' | 'grants' | 'revokes';

export const blockTransactionTypeOptions = [
  { label: 'transactions', value: 'transactions' },
  { label: 'transfers', value: 'transfers' },
  { label: 'mints', value: 'mints' },
  { label: 'burns', value: 'burns' },
  { label: 'grants', value: 'grants' },
  { label: 'revokes', value: 'revokes' },
];

export const defaultTransactionTypeOptions = [
  { label: 'all', value: 'all' },
  { label: 'transfers', value: 'transfers' },
  { label: 'mints', value: 'mints' },
  { label: 'burns', value: 'burns' },
  { label: 'grants', value: 'grants' },
  { label: 'revokes', value: 'revokes' },
];
