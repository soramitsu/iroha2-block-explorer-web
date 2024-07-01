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

interface Props {
  modelValue: TRANSACTIONS_TABS
}

type Emits = (e: 'update:modelValue', value: TRANSACTIONS_TABS) => void;

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const model = useVModel(props, 'modelValue', emit);
</script>
