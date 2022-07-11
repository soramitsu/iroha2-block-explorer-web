<template>
  <BaseContentBlock :title="$t('transactions')" class="transactions-list-page">
    <div class="content-row">
      <BaseTabs v-model="activeTab" :items="tabs" />

      <BaseDropdown
        v-model="filterValue"
        :items="filterItems"
        width="180px"
        :field-label="$t('timespan') + ':'"
      />
    </div>

    <BaseInnerBlock :title="t('transfer')" accordion>
      <BaseCopyRow :name="t('token')" value="TFwh6ZG4iEHVF7pYLGv7qKXBxj2YCMSJZVSNiV">
        <a href="" class="primary-link">TFwh6ZG4iEHVF7pYLGv7qKXBxj2YCMSJZVSNiV</a>
      </BaseCopyRow>
    </BaseInnerBlock>
  </BaseContentBlock>
</template>

<script setup lang="ts">
import BaseContentBlock from '@/components/BaseContentBlock.vue';
import BaseTabs from '@/components/BaseTabs.vue';
import BaseDropdown from '@/components/BaseDropdown.vue';
import BaseInnerBlock from '@/components/BaseInnerBlock.vue';
import BaseCopyRow from '@/components/BaseCopyRow.vue';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n({ useScope: 'global' });

const tabs = [
  { label: t('transactions'), value: 'transactions' },
  { label: t('transfers'), value: 'transfers' },
  { label: t('mints'), value: 'mints' },
  { label: t('burns'), value: 'burns' },
  { label: t('grants'), value: 'grants' },
  { label: t('revokes'), value: 'revokes' },
];

const filterItems = [
  { label: t('time.today'), value: 'today' },
  { label: t('time.week'), value: 'week' },
  { label: t('time.month'), value: 'month' },
  { label: t('time.year'), value: 'year' },
  { label: t('time.allTime'), value: 'allTime' },
];

const activeTab = ref(tabs[0].value);
const filterValue = ref(filterItems[4].value);
</script>

<style>

</style>
