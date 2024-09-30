<template>
  <BaseContentBlock
    :title="$t('transactions.transactions')"
    class="transactions-list-page"
  >
    <TransactionsTable default-tabs />
  </BaseContentBlock>
</template>

<script setup lang="ts">
import BaseContentBlock from '@/shared/ui/components/BaseContentBlock.vue';
import TransactionsTable from '@/shared/ui/components/TransactionsTable.vue';
</script>
