<template>
  <BaseRadioGroup
    v-model="model"
    :items="[...TRANSACTIONS_STATUS_OPTIONS]"
  />
</template>

<script setup lang="ts">
import { useVModel } from '@vueuse/core';
import BaseRadioGroup from '@/core/components/BaseRadioGroup.vue';
import type { TRANSACTION_STATUS } from '@/core/types/transactions';
import { TRANSACTIONS_STATUS_OPTIONS } from '@/core/consts/transactions';

const emit = defineEmits<{
  'update:modelValue': [value: TRANSACTION_STATUS]
}>();

const props = defineProps<{ modelValue: TRANSACTION_STATUS }>();

const model = useVModel(props, 'modelValue', emit);
</script>
