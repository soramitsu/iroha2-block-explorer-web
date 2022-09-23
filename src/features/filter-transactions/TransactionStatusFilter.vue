<template>
  <BaseRadioGroup
    :value="value"
    :items="items"
    @update:value="v => emit('update:value', v as ftm.Status)"
  />
</template>

<script setup lang="ts">
import BaseRadioGroup from '~base/BaseRadioGroup.vue';
import { useI18n } from 'vue-i18n';
import * as ftm from './model';

type Props = {
  value: ftm.Status,
}

type Emits = {
  (e: 'update:value', value: ftm.Status): void,
}

defineProps<Props>();
const emit = defineEmits<Emits>();
const { t } = useI18n({ useScope: 'global' });

const items = [
  { label: t('committed'), value: 'committed' },
  { label: t('rejected'), value: 'rejected' },
];
</script>
