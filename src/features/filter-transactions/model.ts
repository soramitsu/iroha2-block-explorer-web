export type TransactionStatus = 'committed' | 'rejected' | null;
export type TransactionTypeTabs = 'all' | 'transfers' | 'mints' | 'burns' | 'grants' | 'revokes';
export type DefaultTransactionTypeTabs = 'transactions' | 'transfers' | 'mints' | 'burns' | 'grants' | 'revokes';

export const defaultTransactionTypeOptions = [
  { label: 'transactions', value: 'transactions' },
  { label: 'transfers', value: 'transfers' },
  { label: 'mints', value: 'mints' },
  { label: 'burns', value: 'burns' },
  { label: 'grants', value: 'grants' },
  { label: 'revokes', value: 'revokes' },
];

export const transactionTypeOptions = [
  { label: 'all', value: 'all' },
  { label: 'transfers', value: 'transfers' },
  { label: 'mints', value: 'mints' },
  { label: 'burns', value: 'burns' },
  { label: 'grants', value: 'grants' },
  { label: 'revokes', value: 'revokes' },
];
