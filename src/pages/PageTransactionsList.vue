<template>
  <BaseContentBlock
    :title="$t('transactions.transactions')"
    class="transactions-list-page"
  >
    <div class="transactions-list-page__table">
      <div class="transactions--list-page__table-filters content-row">
        <TransactionStatusFilter v-model="listState.status" />
      </div>

      <TransactionsTable
        :table="transactionsTable"
        :hash-type="hashType"
      />
    </div>
  </BaseContentBlock>
</template>

<script setup lang="ts">
import BaseContentBlock from '@/shared/ui/components/BaseContentBlock.vue';
import TransactionsTable from '@/shared/ui/components/TransactionsTable.vue';
import { TransactionStatusFilter } from '@/features/filter-transactions';
import { useTable } from '@/shared/lib/table';
import * as http from '@/shared/api';
import { computed, reactive, watch } from 'vue';
import { useWindowSize } from '@vueuse/core';
import { useErrorHandlers } from '@/shared/ui/composables/useErrorHandlers';

const { handleUnknownError } = useErrorHandlers();

const transactionsTable = useTable(http.fetchTransactions, { reversed: true });

const listState = reactive({
  status: null,
});

async function fetchTransactions() {
  try {
    await transactionsTable.fetch(listState);
  } catch (e) {
    handleUnknownError(e);
  }
}

watch(listState, fetchTransactions, { immediate: true });

const TRANSACTIONS_HASH_BREAKPOINT = 1350;

const { width } = useWindowSize();

const hashType = computed(() => {
  return width.value < TRANSACTIONS_HASH_BREAKPOINT ? 'short' : 'full';
});
</script>

<style lang="scss">
@import '@/shared/ui/styles/main';

.transactions-list-page {
  &__table {
    &_short {
      .content-row {
        @include xxs {
          width: 90vw;
        }

        @include lg {
          width: 46vw;
          height: 48px;
        }
        @include xl {
          width: auto;
        }

        height: auto;
        min-height: 0;
      }

      & > .content-row {
        height: auto;
      }
    }

    &-filters {
      padding: size(2) size(4);
      display: flex;
      flex-direction: column;
      gap: size(1);

      @include sm {
        flex-direction: row;
      }
    }
  }
}
</style>
