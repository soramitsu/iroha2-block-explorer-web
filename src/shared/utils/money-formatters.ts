import { currencySymbol } from '@/shared/config';

export function numberFormatter(value: number | string) {
  const dividedValue = value.toString().split('.');

  const mainValue = dividedValue[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const restValue = dividedValue[1] ? '.' + dividedValue[1] : '';

  return mainValue + restValue;
}

export function formatMoney(value: number | string) {
  return currencySymbol.value + numberFormatter(value);
}
