<template>
  <BaseContentBlock title="Transactions" class="transactions-list-page">
    <BaseTabs v-model="activeTab" :items="tabs" />
  </BaseContentBlock>
</template>

<script setup lang="ts">
import BaseContentBlock from '@/components/BaseContentBlock.vue';
import BaseTabs from '@/components/BaseTabs.vue';
import { ref } from 'vue';

const tabs = [
  { label: 'Transactions', value: 'transactions' },
  { label: 'Transfers', value: 'transfers' },
  { label: 'Mints', value: 'mints' },
  { label: 'Burns', value: 'burns' },
  { label: 'Grants', value: 'grants' },
  { label: 'Revokes', value: 'revokes' },
];

const activeTab = ref(tabs[0].value);
</script>

<style>

</style>
