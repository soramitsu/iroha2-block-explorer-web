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
import { computed } from 'vue';
import { useWindowSize } from '@vueuse/core';
import { LG_WINDOW_SIZE, XL_WINDOW_SIZE } from '@/shared/ui/consts';

const { width } = useWindowSize();

const hashType = computed(() => {
  if (width.value >= XL_WINDOW_SIZE) return 'full';

  if (width.value >= LG_WINDOW_SIZE) return 'medium';

  return 'short';
});
</script>

<style lang="scss">
.transactions-list-page hr {
  display: none;
}
</style>
