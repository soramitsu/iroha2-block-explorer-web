<template>
  <BaseContentBlock
    :title="$t('transactions.transactions')"
    class="transactions-list-page"
  >
    <TransactionsList />
  </BaseContentBlock>
</template>

<script setup lang="ts">
import BaseContentBlock from '@/shared/ui/components/BaseContentBlock.vue';
import TransactionsList from '@/shared/ui/components/TransactionsList.vue';
</script>
