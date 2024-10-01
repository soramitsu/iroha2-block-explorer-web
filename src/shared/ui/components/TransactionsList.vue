<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useTable } from '@/shared/lib/table';
import * as http from '@/shared/api';
import { objectOmit } from '@vueuse/shared';
import {
  type filterTransactionsModel as ftm,
  TransactionStatusFilter,
  TransactionTypeFilter,
} from '@/features/filter-transactions';
import type { AccountId } from '@/shared/api/schemas';
import { useErrorHandlers } from '@/shared/ui/composables/useErrorHandlers';
import { defaultAdaptiveOptions } from '@/features/filter-transactions/adaptive-options';
import { defaultFormat } from '@/shared/lib/time';
import TransactionStatus from '@/entities/transaction/TransactionStatus.vue';
import BaseTable from '@/shared/ui/components/BaseTable.vue';
import BaseHash from '@/shared/ui/components/BaseHash.vue';
import BaseLink from '@/shared/ui/components/BaseLink.vue';
import { useWindowSize } from '@vueuse/core';

const { handleUnknownError } = useErrorHandlers();
const props = withDefaults(
  defineProps<{
    showInstructions?: boolean
    filterBy?: { kind: 'authority', id: AccountId } | { kind: 'block', block: number } | null
  }>(),
  { filterBy: null }
);

const HASH_BREAKPOINT = 1350;

const { width } = useWindowSize();

const hashType = computed(() => {
  if (props.filterBy?.kind === 'authority') return 'short';

  return width.value < HASH_BREAKPOINT ? 'short' : 'full';
});

const transactionStatus = ref<ftm.Status>(null);

const transactionsTable = useTable(http.fetchTransactions, { reversed: true });
const instructionsTable = useTable(http.fetchInstructions);

const listState = computed(() => ({
  status: transactionStatus.value,
  authority: props.filterBy?.kind === 'authority' ? props.filterBy.id.toString() : '',
  kind: transactionTab.value,
  block: props.filterBy?.kind === 'block' ? props.filterBy.block : '',
  instructions: props.showInstructions,
}));

const transactionTab = ref<ftm.TabAccountInstructions>('Transfer');

async function fetchTransactions() {
  try {
    if (!props.showInstructions) await transactionsTable.fetch(objectOmit(listState.value, ['kind']));
    else
      await instructionsTable.fetch({
        ...objectOmit(listState.value, ['status']),
        transaction_status: listState.value.status,
      });
  } catch (e) {
    handleUnknownError(e);
  }
}

watch(
  listState,
  (value, oldValue) => {
    if (oldValue && value.instructions !== oldValue?.instructions) {
      const isChanged = resetFilters();

      if (!isChanged) fetchTransactions();
    } else fetchTransactions();
  },
  { immediate: true }
);

function resetFilters() {
  const isFiltersDefault = !transactionStatus.value && transactionTab.value === 'Transfer';

  if (isFiltersDefault) return false;

  transactionStatus.value = null;
  transactionTab.value = 'Transfer';

  return true;
}
</script>

<template>
  <div
    class="transactions-table"
    :class="{ 'transactions-table_short': props.filterBy?.kind === 'authority' }"
  >
    <div class="transactions-table__filters content-row">
      <TransactionTypeFilter
        v-if="showInstructions"
        v-model="transactionTab"
        :adaptive-options="defaultAdaptiveOptions"
      />
      <TransactionStatusFilter v-model="transactionStatus" />
    </div>

    <BaseTable
      v-if="!props.showInstructions"
      :loading="transactionsTable.loading.value"
      :pagination="transactionsTable.pagination"
      :items="transactionsTable.items.value"
      container-class="transactions-table__container"
      reversed
      :pagination-breakpoint="1440"
      @next-page="transactionsTable.nextPage()"
      @prev-page="transactionsTable.prevPage()"
      @set-page="transactionsTable.setPage($event)"
      @set-size="transactionsTable.setSize($event)"
    >
      <template #row="{ item }">
        <div
          class="transactions-table__row"
          :class="{ 'transactions-table__row_short': props.filterBy?.kind === 'authority' }"
        >
          <TransactionStatus
            type="tooltip"
            class="transactions-table__icon"
            :committed="item.status === 'Committed'"
          />

          <div
            class="transactions-table__column"
            :class="{ 'transactions-table__column_short': props.filterBy?.kind === 'authority' }"
          >
            <div class="transactions-table__label">
              {{ $t('transactions.transactionID') }}
            </div>

            <BaseHash
              :hash="item.hash"
              :type="hashType"
              :link="`/transactions/${item.hash}`"
              copy
            />

            <div class="transactions-table__time">
              {{ defaultFormat(item.created_at) }}
            </div>
          </div>

          <div class="transactions-table__columns">
            <div
              v-if="props.filterBy?.kind !== 'authority'"
              class="transactions-table__column"
            >
              <div class="transactions-table__label">
                {{ $t('transactions.authority') }}
              </div>

              <BaseHash
                :hash="item.authority"
                type="short"
                :link="`/accounts/${item.authority}`"
              />
            </div>

            <div
              v-if="props.filterBy?.kind !== 'block'"
              class="transactions-table__column"
            >
              <div class="transactions-table__label">
                {{ $t('transactions.block') }}
              </div>

              <BaseLink :to="`/blocks/${item.block}`">
                {{ item.block }}
              </BaseLink>
            </div>

            <div class="transactions-table__column">
              <div class="transactions-table__label">
                {{ $t('transactions.executable') }}
              </div>

              <span class="row-text">{{ item.executable }}</span>
            </div>
          </div>
        </div>
      </template>
    </BaseTable>

    <BaseTable
      v-else
      :loading="instructionsTable.loading.value"
      :pagination="instructionsTable.pagination"
      :items="instructionsTable.items.value"
      container-class="transactions-table__container"
      :pagination-breakpoint="1440"
      @next-page="instructionsTable.nextPage()"
      @prev-page="instructionsTable.prevPage()"
      @set-page="instructionsTable.setPage($event)"
      @set-size="instructionsTable.setSize($event)"
    >
      <template #row="{ item }">
        <div class="transactions-table__row transactions-table__row_short">
          <TransactionStatus
            type="tooltip"
            class="transactions-table__icon"
            :committed="item.transaction_status === 'Committed'"
          />

          <div class="transactions-table__column transactions-table__column_short">
            <div class="transactions-table__label">
              {{ $t('transactions.transactionID') }}
            </div>

            <BaseHash
              :hash="item.transaction_hash"
              :type="hashType"
              :link="`/transactions/${item.transaction_hash}`"
              copy
            />

            <div class="transactions-table__time">
              {{ defaultFormat(item.created_at) }}
            </div>
          </div>

          <div class="transactions-table__columns">
            <div class="transactions-table__column">
              <div class="transactions-table__label">
                {{ $t('entity') }}
              </div>

              <span class="row-text">{{ Object.entries(item.payload)[0][0] }}</span>
            </div>

            <div class="transactions-table__column">
              <div class="transactions-table__label">
                {{ $t('transactions.block') }}
              </div>

              <BaseLink :to="`/blocks/${item.block}`">
                {{ item.block }}
              </BaseLink>
            </div>
          </div>
        </div>
      </template>
    </BaseTable>
  </div>
</template>

<style lang="scss">
@import '@/shared/ui/styles/main';

.transactions-table {
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

  &__row {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 80px;
    margin: size(1) 0;

    @include xxs {
      grid-template-columns: 1fr 1fr;
      margin: size(2) 0;
      grid-gap: size(2);
      display: flex;
      flex-direction: column;
    }

    @include sm {
      display: grid;
      grid-template-columns: 32px 0.8fr 1fr;
      grid-gap: size(2);
    }

    @include lg {
      grid-template-columns: 32px 1.8fr 1fr;
    }

    @include xl {
      grid-template-columns: 32px 1.2fr 1fr;
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
    @include tpg-s3;
    color: theme-color('content-quaternary');
  }

  &__time {
    @include tpg-s3;
    color: theme-color('content-primary');
    grid-column: 1 / -1;
  }

  &__columns {
    display: flex;
    gap: size(3);

    flex-direction: column;
    @include md {
      flex-direction: row;
    }
  }

  &__column {
    display: grid;
    grid-gap: size(1) size(1);
    margin-bottom: auto;

    @include xs {
      grid-template-columns: auto 1fr;
      margin: auto 0;
    }

    @include sm {
      grid-gap: size(1);
    }
  }
}
</style>
