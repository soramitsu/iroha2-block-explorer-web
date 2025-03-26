<script setup lang="ts">
import { computed } from 'vue';
import { useTimeAgo } from '@/shared/ui/composables/useTimeAgo';

const props = defineProps<{
  date: Date | null
}>();

const formattedLastBlock = computed(() => {
  if (!lastBlockTimestamp.value) return null;

  return (Math.floor(lastBlockTimestamp.value.value / 100) / 10).toFixed(1);
});
const lastBlockTimestamp = computed(() => {
  if (!props.date) return null;

  return useTimeAgo(props.date, {
    refreshInterval: 100,
    detailedSeconds: true,
  });
});
</script>

<template>
  <div
    class="latest-block-timespan"
    :class="{ 'latest-block-timespan_big': Number(formattedLastBlock) >= 10 }"
  >
    {{ formattedLastBlock }}
  </div>
</template>

<style lang="scss">
@import '@/shared/ui/styles/main';

.latest-block-timespan {
  @include xxs {
    width: size(4.5);
  }
  @include sm {
    width: size(6);
  }
  @include lg {
    width: size(8.5);
  }

  &_big {
    @include xxs {
      width: size(6);
    }
    @include sm {
      width: size(8);
    }
    @include lg {
      width: size(11.5);
    }
  }
}
</style>
