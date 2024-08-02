import { useLocalStorage } from '@vueuse/core';
import { watch } from 'vue';
import { useI18n } from 'vue-i18n';

export const useApplicationLanguage = () => {
  const language = useLocalStorage('app-language', 'en');
  const { locale } = useI18n();

  function setApplicationCurrency(value: string) {
    language.value = value;
  }

  watch(language, () => {
    locale.value = language.value;
  });

  return {
    language,
    setApplicationCurrency,
  };
};
