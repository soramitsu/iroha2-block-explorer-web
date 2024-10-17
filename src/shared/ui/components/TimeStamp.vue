<script setup lang="ts">
import { defaultFormat } from '@/shared/lib/time';
import ContextTooltip from '@/shared/ui/components/ContextTooltip.vue';
import { useTimeAgo } from '@/shared/ui/composables/useTimeAgo';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps<{
  value: Date
  inverted?: boolean
}>();

const { t } = useI18n();
const res = useTimeAgo(props.value);

const i18nKey = computed(() => {
  if (res.precision === 'days') {
    if (res.value < 2) return 'time.dayAgo';

    return 'time.daysAgo';
  }

  if (res.precision === 'hours') {
    if (res.value < 2) return 'time.hourAgo';

    return 'time.hoursAgo';
  }

  if (res.precision === 'seconds') {
    if (res.value < 2) return 'time.secAgo';

    return 'time.secsAgo';
  }

  if (res.value < 2) return 'time.minAgo';

  return 'time.minsAgo';
});

const dateTime = computed(() => defaultFormat(props.value));
const timeAgo = computed(() => t(i18nKey.value, [res.value]));
</script>

<template>
  <div>
    <span class="time-ago row-text">{{ props.inverted ? dateTime : timeAgo }}</span>
    <ContextTooltip :message="props.inverted ? timeAgo : dateTime" />
  </div>
</template>
