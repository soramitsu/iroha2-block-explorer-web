import { useNow } from '@vueuse/core';
import { countTimeDifference } from '@/shared/lib/time';

export function useTimeAgo() {
  const now = useNow({ interval: 1000 });

  function getTimeAgo(date: Date) {
    const { hours, minutes, seconds } = countTimeDifference(now.value.getTime(), date);

    if (hours)
      return {
        i18nKey: 'time.hoursAgo',
        firstValue: hours,
        secondValue: minutes - hours * 60,
      };

    return {
      i18nKey: 'time.minsAgo',
      firstValue: minutes,
      secondValue: seconds,
    };
  }

  return { getTimeAgo };
}
