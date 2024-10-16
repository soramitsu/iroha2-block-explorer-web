<script setup lang="ts">
import { useTimeAgo } from '@/shared/ui/composables/useTimeAgo';
import { computed } from 'vue';

const props = defineProps<{
  value: Date
}>();

const res = useTimeAgo(props.value);

const i18nKey = computed(() => {
  if (res.precision === 'seconds') {
    if (res.value < 2) return 'time.secAgo';

    return 'time.secsAgo';
  }

  if (res.value < 2) return 'time.minAgo';

  return 'time.minsAgo';
});
</script>

<template>
  <span class="time-ago">{{ $t(i18nKey, [res.value]) }}</span>
</template>
