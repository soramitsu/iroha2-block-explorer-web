<script setup lang="ts">
import { defaultFormat } from '@/shared/lib/time';
import Tooltip from '@/shared/ui/components/ContextTooltip.vue';
import TimeAgo from '@/shared/ui/components/TimeAgo.vue';

const props = defineProps<{
  value: Date
}>();
</script>

<template>
  <TimeAgo :value />
  <Tooltip :message="defaultFormat(props.value)" />
</template>
