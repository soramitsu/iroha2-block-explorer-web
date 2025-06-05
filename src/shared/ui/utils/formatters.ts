export function formatNumber(value: number | string) {
  const formatter = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 10,
  });

  return formatter.format(Number(value));
}

export function formatMoney(value: number | string, currency: string) {
  return currency + formatNumber(value);
}

export function formatTimestamp(ms: number) {
  const seconds = Math.floor(ms / 1000);

  if (seconds >= 86400) return Math.floor(seconds / 86400) + 'd';
  else if (seconds >= 3600) return Math.floor(seconds / 3600) + 'h';
  else if (seconds >= 60) return Math.floor(seconds / 60) + 'm';
  else if (seconds >= 1) return seconds + 's';

  return ms + 'ms';
}
