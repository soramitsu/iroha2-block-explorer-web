<script setup lang="ts">
import { computed } from 'vue';
import { useTimeAgo } from '@/shared/ui/composables/useTimeAgo';

const props = defineProps<{
  date: Date
}>();

const formattedLastBlock = computed(() => {
  return (Math.floor(lastBlockTimestamp.value / 100) / 10).toFixed(1);
});
const lastBlockTimestamp = useTimeAgo(
  computed(() => props.date),
  {
    refreshInterval: 100,
    detailedSeconds: true,
  }
);
</script>

<template>
  <div class="latest-block-timespan">
    {{ formattedLastBlock }}
  </div>
</template>
