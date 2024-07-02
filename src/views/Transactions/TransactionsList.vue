<template>
  <BaseContentBlock
    :title="$t('transactions')"
    class="transactions-list-page"
  >
    <div class="content-row">
      <!--      TODO: Add styles for type filter on mobile-->
      <TransactionTypeFilter
        v-model="tab"
        class="transactions-list-page__tabs"
      />
      <TransactionStatusFilter
        v-model="status"
        class="transactions-list-page__status"
      />
    </div>

    <BaseTable
      :loading="transactionsStore.isLoading"
      :pagination="table.pagination"
      :items="data"
      container-class="transactions-list-page__container"
      @next-page="table.nextPage()"
      @prev-page="table.prevPage()"
      @set-page="table.setPage($event)"
      @set-size="table.setSize($event)"
    >
      <template #row="{ item }">
        <div class="transactions-list-page__row">
          <TransactionStatus
            type="tooltip"
            class="transactions-list-page__icon"
            :committed="!item?.rejection_reason"
          />

          <div class="transactions-list-page__column">
            <div class="transactions-list-page__label">
              TxID
            </div>

            <BaseHash
              :hash="item.hash"
              :type="hashType"
              :link="'/transactions/' + item.hash"
              copy
            />

            <div class="transactions-list-page__time">
              {{ format(item.payload.creation_time) }}
            </div>
          </div>

          <div class="transactions-list-page__column">
            <div class="transactions-list-page__label">
              Block
            </div>

            <BaseLink :to="'/blocks/' + item.block_height">
              <!--    TODO: Fix when block_height will be implemented on backend-->
              {{ item.block_height ?? 0 }}
            </BaseLink>
          </div>
        </div>
      </template>
    </BaseTable>
  </BaseContentBlock>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useWindowSize, computedEager } from '@vueuse/core';
import TransactionStatus from '@/core/components/Transactions/TransactionStatus.vue';
import { format } from '@/core/utils/time';
import { useTable } from '@/core/composables/useTable';
import BaseContentBlock from '@/core/components/BaseContentBlock.vue';
import BaseTable from '@/core/components/BaseTable.vue';
import BaseHash from '@/core/components/BaseHash.vue';
import BaseLink from '@/core/components/BaseLink.vue';
import { useTransactionsStore } from '@/stores/transactions';
import { REJECTED_TRANSACTION } from '@/views/Transactions/consts';
import type { TRANSACTION_STATUS, TRANSACTIONS_TABS } from '@/core/types/transactions';
import TransactionTypeFilter from '@/core/components/Transactions/TransactionTypeFilter.vue';
import TransactionStatusFilter from '@/core/components/Transactions/TransactionStatusFilter.vue';
import { useErrorHandlers } from '@/core/composables/useErrorHandlers';

const { handleUnknownError } = useErrorHandlers();

const HASH_BREAKPOINT = 1200;

const status = ref<TRANSACTION_STATUS>(null);
const tab = ref<TRANSACTIONS_TABS>('all');

const { width } = useWindowSize();

const hashType = computedEager(() => (width.value < HASH_BREAKPOINT ? 'short' : 'full'));

const transactionsStore = useTransactionsStore();

const table = useTable(transactionsStore.fetchTransactions);

onMounted(async () => {
  try {
    await table.fetch();
  } catch (e) {
    handleUnknownError(e);
  }
});

const data = computed(() => {
  if (!status.value) return transactionsStore.transactions;

  if (status.value === REJECTED_TRANSACTION) return transactionsStore.transactions.filter((t) => t.rejection_reason);
  else return transactionsStore.transactions.filter((t) => !t.rejection_reason);
});
</script>

<style lang="scss">
@import '@/styles/main';

.transactions-list-page {
  &__row {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 80px;
    margin: size(1) 0;

    @include xs {
      grid-template-columns: 1fr 150px;
      margin: size(2) 0;
    }

    @include sm {
      grid-template-columns: 32px 1fr 150px;
      grid-gap: size(2);
    }

    @include lg {
      grid-template-columns: 32px 2fr 1fr;
    }
  }

  &__container {
    display: grid;
  }

  &__tabs {
    @include md {
      display: grid;
    }
  }

  &__status {
    margin: 0 auto;

    @include xs {
      margin: 0 0 0 auto;
    }
  }

  &__icon {
    display: none;

    @include sm {
      display: grid;
    }
  }

  &__label {
    @include tpg-s5;
    color: theme-color('content-quaternary');

    @include sm {
      @include tpg-s3;
    }
  }

  &__time {
    @include tpg-s5;
    color: theme-color('content-primary');
    grid-column: 1 / -1;

    @include sm {
      @include tpg-s3;
    }
  }

  &__column {
    display: grid;
    grid-gap: size(0.5) size(1);
    margin-bottom: auto;

    @include xs {
      grid-template-columns: auto 1fr;
      margin: auto 0;
    }

    @include sm {
      grid-gap: size(1) size(2);
    }
  }
}
</style>
