import { computed, reactive } from 'vue';
import { useErrorHandlers } from '@/shared/ui/composables/useErrorHandlers';
import { useErrorRetry, useTask, wheneverRejected } from '@vue-kakuyaku/core';

export function setupAsyncData<K>(
  fn: () => Promise<K>,
  options?: {
    interval?: number
    immediate?: boolean
  }
) {
  const { handleUnknownError } = useErrorHandlers();

  const { state, run } = useTask(() => fn(), { immediate: options?.immediate ?? true });

  useErrorRetry(state, run, { interval: options?.interval ?? 5000 });

  wheneverRejected(state, (err) => {
    handleUnknownError(err);
  });

  return reactive({
    isLoading: computed(() => state.pending),
    data: computed<K | undefined>(() => state.fulfilled?.value),
  });
}
