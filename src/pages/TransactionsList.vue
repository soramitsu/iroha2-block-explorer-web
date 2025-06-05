<template>
  <BaseContentBlock
    :title="$t('transactions.transactions')"
    class="transactions-list-page"
  >
    <TransactionsTable
      :hash-type
      show-block
      show-authority
    />
  </BaseContentBlock>
</template>

<script setup lang="ts">
import BaseContentBlock from '@/shared/ui/components/BaseContentBlock.vue';
import TransactionsTable from '@/shared/ui/components/TransactionsTable.vue';
import { useAdaptiveHash } from '@/shared/ui/composables/useAdaptiveHash';

const hashType = useAdaptiveHash({ xxl: 'full', xl: 'full', lg: 'medium' });
</script>

<style lang="scss">
.transactions-list-page hr {
  display: none;
}
</style>
