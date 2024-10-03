<template>
  <BaseTabs
    v-model="model"
    :items="INSTRUCTION_OPTIONS"
    :adaptive-options="props.adaptiveOptions"
  />
</template>

<script setup lang="ts">
import type * as ftm from './model';
import { useVModel } from '@vueuse/core';
import BaseTabs from '@/shared/ui/components/BaseTabs.vue';
import { INSTRUCTION_OPTIONS } from './model';
import type { AdaptiveOptions } from '@/shared/ui/utils/adaptive-options';

interface Props {
  modelValue: ftm.TabInstructions
  adaptiveOptions?: AdaptiveOptions
}

type Emits = (e: 'update:modelValue', value: ftm.TabInstructions) => void;

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const model = useVModel(props, 'modelValue', emit);
</script>
