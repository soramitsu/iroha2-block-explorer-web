import { i18n } from '@/shared/lib/localization';

export type TransactionStatus = 'committed' | 'rejected' | null;
export type DefaultTransactionTypeTabs = 'all' | 'transfers' | 'mints' | 'burns' | 'grants' | 'revokes';
export type BlockTransactionTypeTabs = 'transactions' | 'transfers' | 'mints' | 'burns' | 'grants' | 'revokes';

export const blockTransactionTypeOptions = [
  { label: i18n.global.t('transactions'), value: 'transactions' },
  { label: i18n.global.t('transfers'), value: 'transfers' },
  { label: i18n.global.t('mints'), value: 'mints' },
  { label: i18n.global.t('burns'), value: 'burns' },
  { label: i18n.global.t('grants'), value: 'grants' },
  { label: i18n.global.t('revokes'), value: 'revokes' },
];

export const defaultTransactionTypeOptions = [
  { label: i18n.global.t('all'), value: 'all' },
  { label: i18n.global.t('transfers'), value: 'transfers' },
  { label: i18n.global.t('mints'), value: 'mints' },
  { label: i18n.global.t('burns'), value: 'burns' },
  { label: i18n.global.t('grants'), value: 'grants' },
  { label: i18n.global.t('revokes'), value: 'revokes' },
];
