import { computed, ref } from 'vue';

export const APPLICATION_CURRENCY = ['USD'] as const;
export type ApplicationCurrency = (typeof APPLICATION_CURRENCY)[number];

export const APPLICATION_CURRENCY_OPTIONS: Record<ApplicationCurrency, string> = {
  USD: '$',
} as const;

export function useApplicationCurrency() {
  const applicationCurrency = ref<ApplicationCurrency>('USD');

  function setApplicationCurrency(value: ApplicationCurrency) {
    // TODO: use local storage
    applicationCurrency.value = value;
  }

  return {
    applicationCurrency: computed(() => APPLICATION_CURRENCY_OPTIONS[applicationCurrency.value]),
    setApplicationCurrency,
  };
}
