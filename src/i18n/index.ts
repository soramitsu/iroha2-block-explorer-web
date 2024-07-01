import type { I18n, I18nOptions, Locale } from 'vue-i18n';
import { createI18n } from 'vue-i18n';
import { isRef } from 'vue';

let i18n: I18n | undefined;

export const SUPPORT_LOCALES = ['en', 'fr', 'es', 'de', 'ru', 'jp'] as const;

export function setupI18n(options: I18nOptions = { locale: 'en' }) {
  i18n = createI18n<false>({ ...options, legacy: false });
  setI18nLanguage(options.locale ?? '');

  return i18n;
}

export function setI18nLanguage(locale: Locale) {
  if (i18n && isRef(i18n.global.locale)) {
    i18n.global.locale.value = locale;
  }
}
