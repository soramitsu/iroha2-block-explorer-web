import { useLocalStorage } from '@vueuse/core';
import { watchSyncEffect } from 'vue';
import { useI18n } from 'vue-i18n';

export const useApplicationLanguage = () => {
  const language = useLocalStorage('app-language', 'en');
  const { locale } = useI18n();

  function setApplicationCurrency(value: string) {
    language.value = value;
  }

  watchSyncEffect(() => {
    locale.value = language.value;
  });

  return {
    language,
    setApplicationCurrency,
  };
};
