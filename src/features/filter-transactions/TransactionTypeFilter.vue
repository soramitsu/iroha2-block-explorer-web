<template>
  <BaseTabs
    :value="value"
    :items="tabs"
    @update:value="v => emit('update:value', v as ftm.Tab)"
  />
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import * as ftm from './model';
import BaseTabs from '~base/BaseTabs.vue';

type Props = {
  value: ftm.Tab,
}

type Emits = {
  (e: 'update:value', value: ftm.Tab): void,
}

defineProps<Props>();
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
</script>
