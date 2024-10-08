<template>
  <BaseContentBlock
    :title="$t('transactions.transactions')"
    class="transactions-list-page"
  >
    <TransactionsTable
      :hash-type="hashType"
      show-block
      show-authority
    />
  </BaseContentBlock>
</template>

<script setup lang="ts">
import BaseContentBlock from '@/shared/ui/components/BaseContentBlock.vue';
import TransactionsTable from '@/shared/ui/components/TransactionsTable.vue';
import { computed } from 'vue';
import { useWindowSize } from '@vueuse/core';

const TRANSACTIONS_HASH_BREAKPOINT = 1350;

const { width } = useWindowSize();

const hashType = computed(() => {
  return width.value < TRANSACTIONS_HASH_BREAKPOINT ? 'short' : 'full';
});
</script>
