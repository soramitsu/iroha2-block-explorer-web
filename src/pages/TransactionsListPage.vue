<template>
  <BaseContentBlock :title="$t('transactions')" class="transactions-list-page">
    <div class="content-row">
      <BaseTabs v-model:value="activeTab" :items="tabs" />

      <BaseRadioGroup v-model:value="radioValue" :items="radioItems" />
    </div>

    <BaseInnerBlock :title="t('transfer')" accordion>
      <BaseCopyRow :name="t('token')" value="TFwh6ZG4iEHVF7pYLGv7qKXBxj2YCMSJZVSNiV">
        <a href="" class="primary-link">TFwh6ZG4iEHVF7pYLGv7qKXBxj2YCMSJZVSNiV</a>
      </BaseCopyRow>
    </BaseInnerBlock>
  </BaseContentBlock>
</template>

<script setup lang="ts">
import BaseContentBlock from '~base/BaseContentBlock.vue';
import BaseTabs from '~base/BaseTabs.vue';
import BaseRadioGroup from '~base/BaseRadioGroup.vue';
import BaseInnerBlock from '~base/BaseInnerBlock.vue';
import BaseCopyRow from '~base/BaseCopyRow.vue';
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

const radioItems = [
  { label: t('time.today'), value: 'committed' },
  { label: t('time.week'), value: 'rejected' },
];

const activeTab = ref(tabs[0].value);
const radioValue = ref<string|null>(null);
</script>

<style>

</style>
