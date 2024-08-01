import { useLocalStorage } from '@vueuse/core';
import { readonly } from 'vue';

export const useApplicationLanguage = () => {
  const language = useLocalStorage('app-language', 'en');

  function setApplicationCurrency(value: string) {
    language.value = value;
  }

  return {
    language: readonly(language),
    setApplicationCurrency,
  };
};
