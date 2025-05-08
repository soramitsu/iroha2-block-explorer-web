export const menu = [
  { i18nKey: 'blocks.blocks', to: '/blocks', names: ['blocks-list', 'blocks-details'] },
  {
    i18nKey: 'assets.assetsAndNFT',
    to: '/assets',
    names: ['assets', 'asset-details', 'nfts', 'nft-details'],
  },
  { i18nKey: 'domains.domains', to: '/domains', names: ['domains-list', 'domain-details'] },
  { i18nKey: 'accounts.accounts', to: '/accounts', names: ['accounts-list', 'account-details'] },
  { i18nKey: 'transactions.transactions', to: '/transactions', names: ['transactions-list', 'transaction-details'] },
  // FIXME: uncomment when backend ready
  // { i18nKey: 'telemetry.telemetry', to: '/telemetry' },
];

export const langOptions = [
  { label: 'EN - English', value: 'en' },
  { label: 'FR - Français', value: 'fr' },
  { label: 'ES - Español', value: 'es' },
  { label: 'DE - Deutsch', value: 'de' },
  { label: 'RU - Русский', value: 'ru' },
  { label: 'JP - 日本', value: 'jp' },
];
