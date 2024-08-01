import { computed } from 'vue';
import { useLocalStorage } from '@vueuse/core';

export const APPLICATION_CURRENCY = ['USD'] as const;
export type ApplicationCurrency = (typeof APPLICATION_CURRENCY)[number];

export const APPLICATION_CURRENCY_OPTIONS: Record<ApplicationCurrency, string> = {
  USD: '$',
} as const;

export function useApplicationCurrency() {
  const applicationCurrency = useLocalStorage<ApplicationCurrency>('app-currency', 'USD');

  function setApplicationCurrency(value: ApplicationCurrency) {
    applicationCurrency.value = value;
  }

  return {
    applicationCurrency: computed(() => APPLICATION_CURRENCY_OPTIONS[applicationCurrency.value]),
    setApplicationCurrency,
  };
}
