export const TRANSACTIONS_STATUS_OPTIONS = [
  { label: 'committed', value: 'committed' },
  { label: 'rejected', value: 'rejected' },
] as const;

export const TRANSACTIONS_TABS_OPTIONS = [
  { label: 'transactionType.all', value: 'all' },
  { label: 'transactionType.transfers', value: 'transfers' },
  { label: 'transactionType.mints', value: 'mints' },
  { label: 'transactionType.burns', value: 'burns' },
  { label: 'transactionType.grants', value: 'grants' },
  { label: 'transactionType.revokes', value: 'revokes' },
] as const;
