<template>
  <BaseContentBlock title="Transactions" class="transactions-list-page">
    <div class="content-row">
      <BaseTabs v-model="activeTab" :items="tabs" />

      <BaseDropdown
        v-model="filterValue"
        :items="filterItems"
        width="180px"
        field-label="Timespan:"
      />
    </div>
  </BaseContentBlock>
</template>

<script setup lang="ts">
import BaseContentBlock from '@/components/BaseContentBlock.vue';
import BaseTabs from '@/components/BaseTabs.vue';
import BaseDropdown from '@/components/BaseDropdown.vue';
import { ref } from 'vue';

const tabs = [
  { label: 'Transactions', value: 'transactions' },
  { label: 'Transfers', value: 'transfers' },
  { label: 'Mints', value: 'mints' },
  { label: 'Burns', value: 'burns' },
  { label: 'Grants', value: 'grants' },
  { label: 'Revokes', value: 'revokes' },
];

const filterItems = [
  { label: 'Today', value: 'today' },
  { label: 'Week', value: 'week' },
  { label: 'Month', value: 'month' },
  { label: 'Year', value: 'year' },
  { label: 'All time', value: 'all-time' },
];

const activeTab = ref(tabs[0].value);
const filterValue = ref(filterItems[4].value);
</script>

<style>

</style>
