<template>
  <BaseContentBlock
    :title="$t('transactions.transactions')"
    class="transactions-list-page"
  >
    <div class="transactions-list-page__filters content-row">
      <TransactionTypeFilter
        v-model="transactionType"
        :adaptive-options="defaultAdaptiveOptions"
        default-options
      />
      <TransactionStatusFilter v-model="status" />
    </div>

    <BaseTable
      v-if="shouldUseTransactions"
      :loading="transactionsTable.loading.value"
      :pagination="transactionsTable.pagination"
      :items="transactionsTable.items.value"
      container-class="transactions-list-page__container"
      reversed
      @next-page="transactionsTable.nextPage()"
      @prev-page="transactionsTable.prevPage()"
      @set-page="transactionsTable.setPage($event)"
      @set-size="transactionsTable.setSize($event)"
    >
      <template #row="{ item }">
        <div class="transactions-list-page__row">
          <TransactionStatus
            type="tooltip"
            class="transactions-list-page__icon"
            :committed="item.status === 'Committed'"
          />

          <div class="transactions-list-page__column">
            <div class="transactions-list-page__label">
              {{ $t('transactions.transactionID') }}
            </div>

            <BaseHash
              :hash="item.hash"
              :type="hashType"
              :link="`/transactions/${item.hash}`"
              copy
            />

            <div class="transactions-list-page__time">
              {{ defaultFormat(item.created_at) }}
            </div>
          </div>

          <div class="transactions-list-page__column">
            <div class="transactions-list-page__label">
              {{ $t('transactions.block') }}
            </div>

            <BaseLink :to="`/blocks/${item.block}`">
              {{ item.block }}
            </BaseLink>
          </div>
        </div>
      </template>
    </BaseTable>

    <BaseTable
      v-else
      :loading="instructionsTable.loading.value"
      :pagination="instructionsTable.pagination"
      :items="instructionsTable.items.value"
      container-class="transactions-list-page__container"
      @next-page="instructionsTable.nextPage()"
      @prev-page="instructionsTable.prevPage()"
      @set-page="instructionsTable.setPage($event)"
      @set-size="instructionsTable.setSize($event)"
    >
      <template #row="{ item }">
        <div class="transactions-list-page__row">
          <TransactionStatus
            type="tooltip"
            class="transactions-list-page__icon"
            :committed="item.transaction_status === 'Committed'"
          />

          <div class="transactions-list-page__column">
            <div class="transactions-list-page__label">
              {{ $t('transactions.transactionID') }}
            </div>

            <BaseHash
              :hash="item.transaction_hash"
              :type="hashType"
              :link="`/transactions/${item.transaction_hash}`"
              copy
            />

            <div class="transactions-list-page__time">
              {{ defaultFormat(item.created_at) }}
            </div>
          </div>
        </div>
      </template>
    </BaseTable>
  </BaseContentBlock>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { reactiveOmit, useWindowSize } from '@vueuse/core';
import TransactionStatusFilter from '@/features/filter-transactions/TransactionStatusFilter.vue';
import TransactionStatus from '@/entities/transaction/TransactionStatus.vue';
import { defaultFormat } from '@/shared/lib/time';
import { useTable } from '@/shared/lib/table';
import BaseContentBlock from '@/shared/ui/components/BaseContentBlock.vue';
import BaseTable from '@/shared/ui/components/BaseTable.vue';
import BaseHash from '@/shared/ui/components/BaseHash.vue';
import type { filterTransactionsModel as ftm } from '@/features/filter-transactions';
import { TransactionTypeFilter } from '@/features/filter-transactions';
import { useErrorHandlers } from '@/shared/ui/composables/useErrorHandlers';
import * as http from '@/shared/api';
import BaseLink from '@/shared/ui/components/BaseLink.vue';
import { defaultAdaptiveOptions } from '@/features/filter-transactions/adaptive-options';

const HASH_BREAKPOINT = 1200;

const status = ref<ftm.Status>(null);

const { width } = useWindowSize();

const hashType = computed(() => (width.value < HASH_BREAKPOINT ? 'short' : 'full'));

const { handleUnknownError } = useErrorHandlers();

const transactionsTable = useTable(http.fetchTransactions, { reversed: true });
const instructionsTable = useTable(http.fetchInstructions);

const listState = computed(() => ({
  status: status.value,
  kind: transactionType.value,
}));

const transactionType = ref<ftm.TabDefaultScreen>('All');

const shouldUseTransactions = computed(() => transactionType.value === 'All');

async function fetchTransactions() {
  try {
    if (shouldUseTransactions.value) await transactionsTable.fetch(reactiveOmit(listState.value, 'kind'));
    else
      await instructionsTable.fetch({
        ...reactiveOmit(listState.value, 'status'),
        transaction_status: listState.value.status,
      });
  } catch (e) {
    handleUnknownError(e);
  }
}

watch(listState, fetchTransactions, { immediate: true });
</script>

<style lang="scss">
@import '@/shared/ui/styles/main';

.transactions-list-page {
  &__row {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 80px;
    margin: size(1) 0;

    @include xxs {
      grid-template-columns: 1fr 1fr;
      margin: size(2) 0;
      grid-gap: size(4);
    }

    @include sm {
      grid-template-columns: 32px 1fr 1fr;
      grid-gap: size(2);
    }

    @include lg {
      grid-template-columns: 32px 2fr 1fr;
    }
  }

  &__filters {
    padding: size(2) size(4);
    display: flex;
    flex-direction: column;
    gap: size(1);

    @include sm {
      flex-direction: row;
    }
  }

  &__container {
    display: grid;

    .content-row {
      padding: 0 size(4);
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
