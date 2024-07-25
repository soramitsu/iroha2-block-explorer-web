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
import type { AdaptiveOptions } from '@/shared/types';
import { computed } from 'vue';
import { defaultTransactionTypeOptions, transactionTypeOptions } from './model';

interface Props {
  modelValue: ftm.TransactionTypeTabs | ftm.DefaultTransactionTypeTabs
  defaultOptions?: boolean
  adaptiveOptions?: AdaptiveOptions
}

type Emits = (e: 'update:modelValue', value: ftm.TransactionTypeTabs) => void;

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const tabs = computed(() => (props.defaultOptions ? defaultTransactionTypeOptions : transactionTypeOptions));

const model = useVModel(props, 'modelValue', emit);
</script>
