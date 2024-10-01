<template>
  <BaseTabs
    v-model="model"
    :items="tabs"
    :adaptive-options="props.adaptiveOptions"
  />
</template>

<script setup lang="ts">
import type * as ftm from './model';
import { useVModel } from '@vueuse/core';
import BaseTabs from '@/shared/ui/components/BaseTabs.vue';
import { computed } from 'vue';
import { ACCOUNT_INSTRUCTIONS_OPTIONS, INSTRUCTION_OPTIONS } from './model';
import type { AdaptiveOptions } from '@/shared/ui/utils/adaptive-options';

interface Props {
  modelValue: ftm.TabAccountInstructions | ftm.TabInstructions
  defaultOptions?: boolean
  adaptiveOptions?: AdaptiveOptions
  instructions?: boolean
}

type Emits = (e: 'update:modelValue', value: ftm.TabAccountInstructions | ftm.TabInstructions) => void;

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const tabs = computed(() => {
  if (props.instructions) return INSTRUCTION_OPTIONS;

  return ACCOUNT_INSTRUCTIONS_OPTIONS;
});

const model = useVModel(props, 'modelValue', emit);
</script>
