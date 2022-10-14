<template>
  <BaseRadioGroup
    v-model="model"
    :items="items"
  />
</template>

<script setup lang="ts">
import BaseRadioGroup from '~base/BaseRadioGroup.vue';
import { useI18n } from 'vue-i18n';
import * as ftm from './model';
import { useVModel } from '@vueuse/core';

type Props = {
  modelValue: ftm.Status,
}

type Emits = {
  (e: 'update:modelValue', value: ftm.Status): void,
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();
const { t } = useI18n({ useScope: 'global' });

const items = [
  { label: t('committed'), value: 'committed' },
  { label: t('rejected'), value: 'rejected' },
];

const model = useVModel(props, 'modelValue', emit);
</script>
