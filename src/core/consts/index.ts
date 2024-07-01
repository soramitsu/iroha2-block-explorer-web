export const MENU = [
  { label: 'blocks', to: '/blocks' },
  { label: 'assets', to: '/assets' },
  { label: 'domains', to: '/domains' },
  { label: 'accounts', to: '/accounts' },
  { label: 'transactions', to: '/transactions' },
] as const;

export const LANG_OPTIONS = [
  { label: 'EN - English', value: 'en' },
  { label: 'FR - Français', value: 'fr' },
  { label: 'ES - Español', value: 'es' },
  { label: 'DE - Deutsch', value: 'de' },
  { label: 'RU - Русский', value: 'ru' },
  { label: 'JP - 日本', value: 'jp' },
] as const;

// TODO: Research what stats should be displayed due to different layouts
export const APPLICATION_STATS = [
  { value: '5.599s', label: 'homePage.averageBlockTime' },
  { value: '654', label: 'homePage.validators' },
  { value: '68', label: 'homePage.nodes' },
  { value: '12,658', label: 'homePage.accounts' },
  { value: '12345', label: 'homePage.domains' },
  { value: '12,658', label: 'homePage.assets' },
] as const;

export const PORTAL_ID = 'header-dropdown-portal';
