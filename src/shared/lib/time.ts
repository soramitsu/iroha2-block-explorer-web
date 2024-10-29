import { format } from 'date-fns/format';
import type { TimeAgo } from '@/shared/ui/composables/useTimeAgo';
import { toZonedTime } from 'date-fns-tz';

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

export function getGMTOffset(date: Date) {
  const offset = date.getTimezoneOffset() / 60;

  if (offset <= 0) {
    return 'GMT+' + -offset;
  }

  return 'GMT-' + offset;
}

export function getLocalTime(date: Date) {
  const localDate = format(date, 'dd.MM.yyyy hh:mm:ss a ');
  const offset = getGMTOffset(date);

  return localDate + offset;
}

export function getUTCTime(date: Date) {
  const utcDate = format(toZonedTime(date, 'UTC'), 'dd.MM.yyyy hh:mm:ss a ');

  return utcDate + 'UTC';
}

export function defaultFormat(date: Date) {
  return format(date, 'dd.MM.yyyy hh:mm:ss');
}
