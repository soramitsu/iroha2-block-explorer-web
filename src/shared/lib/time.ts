import { format } from 'date-fns/format';
import { useI18n } from 'vue-i18n';

export function getTimeAgo(now: number, dateString: string | Date) {
  const { t } = useI18n();

  const date = new Date(dateString);
  const diff = now - date.getTime();

  const minutes = Math.floor(diff / 1000 / 60);
  const seconds = Math.floor((diff / 1000) % 60);
  const hours = Math.floor(minutes / 60);

  if (hours) {
    return t('time.hoursAgo', [hours, minutes - hours * 60]);
  }

  return t('time.minsAgo', [minutes, seconds]);
}

function formatXX(item: number) {
  return item < 10 ? '0' + item : item;
}

export function formatUTC(date: Date) {
  return format(date, `MMM-dd-yyyy hh:mm:ss a 'UTC'`);
}

export function defaultFormat(timestamp: Date | string) {
  const date = new Date(timestamp);
  const day = formatXX(date.getDate());
  const month = formatXX(date.getMonth() + 1);
  const year = date.getFullYear();
  const hours = formatXX(date.getHours());
  const minutes = formatXX(date.getMinutes());

  return `${day}.${month}.${year} ${hours}:${minutes}`;
}
