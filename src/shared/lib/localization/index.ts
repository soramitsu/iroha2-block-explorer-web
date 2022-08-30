
import { createI18n } from 'vue-i18n';
import * as en from './en.json';

export const i18n = createI18n({
  locale: 'en',
  messages: { en },
  globalInjection: true,
  legacy: false,
});
