<template>
  <BaseTabs
    v-model="model"
    :items="[...TRANSACTIONS_TABS_OPTIONS]"
  />
</template>

<script setup lang="ts">
import { useVModel } from '@vueuse/core';
import BaseTabs from '@/core/components/BaseTabs.vue';
import type { TRANSACTIONS_TABS } from '@/core/types/transactions';
import { TRANSACTIONS_TABS_OPTIONS } from '@/core/consts/transactions';

const props = defineProps<{
  modelValue: TRANSACTIONS_TABS
}>();
const emit = defineEmits<{
  'update:modelValue': [value: TRANSACTIONS_TABS]
}>();

const model = useVModel(props, 'modelValue', emit);
</script>
