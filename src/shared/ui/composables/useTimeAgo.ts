import { countTimeDifference } from '@/shared/lib/time';
import type { MaybeRefOrGetter } from 'vue';
import { reactive, ref, watch, toValue } from 'vue';
import { useIntervalFn } from '@vueuse/shared';

export type TimeAgo =
  | { precision: 'seconds', value: number }
  | { precision: 'minutes', value: number }
  | { precision: 'hours', value: number }
  | { precision: 'days', value: number };

export function useTimeAgo(
  date: MaybeRefOrGetter<Date>,
  options?: {
    refreshInterval?: number
    detailedSeconds?: boolean
  }
) {
  const now = ref(Date.now());
  const result = reactive<TimeAgo>({ precision: 'seconds', value: 0 });

  const interval = ref(options?.refreshInterval ?? 1000);
  useIntervalFn(() => {
    now.value = Date.now();
  }, interval);

  watch(
    now,
    () => {
      const { precision, value } = countTimeDifference(now.value, toValue(date), options?.detailedSeconds);

      if (precision === 'days') interval.value = 1000 * 60 * 60;
      else if (precision !== 'seconds') interval.value = 1000 * 60;

      result.precision = precision;
      result.value = value;
    },
    { immediate: true }
  );

  return result;
}
