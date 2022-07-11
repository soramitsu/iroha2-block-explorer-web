
import { createI18n } from 'vue-i18n';
import * as en from './locales/en.json';

export default createI18n({
  locale: 'en',
  messages: { en },
  globalInjection: true,
  legacy: false,
});
