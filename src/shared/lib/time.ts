import { format } from 'date-fns/format';
import type { TimeAgo } from '@/shared/ui/composables/useTimeAgo';

export function countTimeDifference(now: number, dateString: string | Date): TimeAgo {
  const date = new Date(dateString);
  const diff = now - date.getTime();

  const minutes = Math.floor(diff / 1000 / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days) {
    return {
      precision: 'days',
      value: days,
    };
  } else if (hours) {
    return {
      precision: 'hours',
      value: hours,
    };
  } else if (minutes < 1) {
    return {
      precision: 'seconds',
      value: Math.floor((diff / 1000) % 60),
    };
  }

  return {
    precision: 'minutes',
    value: minutes,
  };
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
