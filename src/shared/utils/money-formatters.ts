import { applicationCurrency } from '@/shared/config';

export function numberFormatter(value: number | string) {
  const formatter = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 10,
  });

  return formatter.format(Number(value));
}

export function formatMoney(value: number | string) {
  return applicationCurrency.value + numberFormatter(value);
}
