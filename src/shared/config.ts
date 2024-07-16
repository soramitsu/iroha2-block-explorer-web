import { i18n } from '@/shared/lib/localization';
import { ref } from 'vue';

export const menu = [
  { label: i18n.global.t('blocks'), to: '/blocks' },
  { label: i18n.global.t('assets'), to: '/assets' },
  { label: i18n.global.t('domains'), to: '/domains' },
  { label: i18n.global.t('accounts'), to: '/accounts' },
  { label: i18n.global.t('transactions'), to: '/transactions' },
];

export const langOptions = [
  { label: 'EN - English', value: 'en' },
  { label: 'FR - Français', value: 'fr' },
  { label: 'ES - Español', value: 'es' },
  { label: 'DE - Deutsch', value: 'de' },
  { label: 'RU - Русский', value: 'ru' },
  { label: 'JP - 日本', value: 'jp' },
];

export const PORTAL_ID = 'header-dropdown-portal';

export const applicationCurrency = ref('$');
