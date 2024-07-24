<template>
  <BaseTabs
    v-model="model"
    :items="tabs"
  />
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import type * as ftm from './model';
import { useVModel } from '@vueuse/core';
import BaseTabs from '@/shared/ui/components/BaseTabs.vue';

interface Props {
  modelValue: ftm.Tab
}

type Emits = (e: 'update:modelValue', value: ftm.Tab) => void;

const props = defineProps<Props>();
const emit = defineEmits<Emits>();
const { t } = useI18n({ useScope: 'global' });

const tabs = [
  { label: t('all'), value: 'all' },
  { label: t('transfers'), value: 'transfers' },
  { label: t('mints'), value: 'mints' },
  { label: t('burns'), value: 'burns' },
  { label: t('grants'), value: 'grants' },
  { label: t('revokes'), value: 'revokes' },
];

const model = useVModel(props, 'modelValue', emit);
</script>
