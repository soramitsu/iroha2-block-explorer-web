<template>
  <BaseRadioGroup
    v-model="model"
    :items="items"
  />
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import type * as ftm from './model';
import { useVModel } from '@vueuse/core';
import BaseRadioGroup from '@/shared/ui/components/BaseRadioGroup.vue';

interface Props {
  modelValue: ftm.Status
}

type Emits = (e: 'update:modelValue', value: ftm.Status) => void;

const props = defineProps<Props>();
const emit = defineEmits<Emits>();
const { t } = useI18n({ useScope: 'global' });

const items = [
  { label: t('transactions.committed'), value: 'Committed' },
  { label: t('transactions.rejected'), value: 'Rejected' },
];

const model = useVModel(props, 'modelValue', emit);
</script>
