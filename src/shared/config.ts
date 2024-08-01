import { useI18n } from 'vue-i18n';

export const getMenu = () => {
  const { t } = useI18n();

  return [
    { label: t('blocks'), to: '/blocks' },
    { label: t('assets'), to: '/assets' },
    { label: t('domains'), to: '/domains' },
    { label: t('accounts'), to: '/accounts' },
    { label: t('transactions'), to: '/transactions' },
  ];
};

export const langOptions = [
  { label: 'EN - English', value: 'en' },
  { label: 'FR - Français', value: 'fr' },
  { label: 'ES - Español', value: 'es' },
  { label: 'DE - Deutsch', value: 'de' },
  { label: 'RU - Русский', value: 'ru' },
  { label: 'JP - 日本', value: 'jp' },
];

export const PORTAL_ID = 'header-dropdown-portal';
