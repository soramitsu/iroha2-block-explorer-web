import { useI18n } from 'vue-i18n';

export type TransactionStatus = 'committed' | 'rejected' | null;
export type DefaultTransactionTypeTabs = 'all' | 'transfers' | 'mints' | 'burns' | 'grants' | 'revokes';
export type BlockTransactionTypeTabs = 'transactions' | 'transfers' | 'mints' | 'burns' | 'grants' | 'revokes';

export const getBlockTransactionTypeOptions = () => {
  const { t } = useI18n();

  return [
    { label: t('transactions'), value: 'transactions' },
    { label: t('transfers'), value: 'transfers' },
    { label: t('mints'), value: 'mints' },
    { label: t('burns'), value: 'burns' },
    { label: t('grants'), value: 'grants' },
    { label: t('revokes'), value: 'revokes' },
  ];
};

export const getDefaultTransactionTypeOptions = () => {
  const { t } = useI18n();

  return [
    { label: t('all'), value: 'all' },
    { label: t('transfers'), value: 'transfers' },
    { label: t('mints'), value: 'mints' },
    { label: t('burns'), value: 'burns' },
    { label: t('grants'), value: 'grants' },
    { label: t('revokes'), value: 'revokes' },
  ];
};
