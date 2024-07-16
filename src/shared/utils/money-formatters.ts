import { applicationCurrency } from '@/shared/config';

export function numberFormatter(value: number | string) {
  const dividedValue = value.toString().split('.');

  const commaRegExp = new RegExp(/\B(?=(\d{3})+(?!\d))/g);

  const mainValue = dividedValue[0].replace(commaRegExp, ',');
  const restValue = dividedValue[1] ? '.' + dividedValue[1] : '';

  return mainValue + restValue;
}

export function formatMoney(value: number | string) {
  return applicationCurrency.value + numberFormatter(value);
}
