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
import { blockTransactionTypeOptions, defaultTransactionTypeOptions } from './model';
import type { AdaptiveOptions } from '@/shared/ui/utils/adaptive-options';

interface Props {
  modelValue: ftm.DefaultTransactionTypeTabs | ftm.BlockTransactionTypeTabs
  defaultOptions?: boolean
  adaptiveOptions?: AdaptiveOptions
}

type Emits = (e: 'update:modelValue', value: ftm.DefaultTransactionTypeTabs) => void;

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const tabs = computed(() => (props.defaultOptions ? defaultTransactionTypeOptions : blockTransactionTypeOptions));

const model = useVModel(props, 'modelValue', emit);
</script>
