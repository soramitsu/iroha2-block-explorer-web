<script setup lang="ts">
import { defaultFormat } from '@/shared/lib/time';
import BaseTable from '@/shared/ui/components/BaseTable.vue';
import BaseHash from '@/shared/ui/components/BaseHash.vue';
import TransactionStatus from '@/entities/transaction/TransactionStatus.vue';
import BaseLink from '@/shared/ui/components/BaseLink.vue';
import type { AccountId } from '@/shared/api/schemas';
import { TransactionStatusFilter } from '@/features/filter-transactions';
import { computed, reactive, watch } from 'vue';
import { useTable } from '@/shared/lib/table';
import * as http from '@/shared/api';
import { useErrorHandlers } from '@/shared/ui/composables/useErrorHandlers';

const { handleUnknownError } = useErrorHandlers();

const props = withDefaults(
  defineProps<{
    showBlock?: boolean
    showAuthority?: boolean
    hashType: 'short' | 'full'
    filterBy: { kind: 'authority', value: AccountId } | { kind: 'block', value: number } | null
  }>(),
  { showBlock: false, showAuthority: false, filterBy: null }
);

const transactionsTable = useTable(http.fetchTransactions, { reversed: true });

const listState = reactive({
  status: null,
  authority: computed(() => props.filterBy?.kind === 'authority' && props.filterBy?.value.toString()),
  block: computed(() => props.filterBy?.kind === 'block' && props.filterBy?.value),
});

async function fetchTransactions() {
  try {
    await transactionsTable.fetch(listState);
  } catch (e) {
    handleUnknownError(e);
  }
}

watch(listState, fetchTransactions, { immediate: true });
</script>

<template>
  <div class="transactions-table">
    <div class="transactions-table-filters content-row">
      <TransactionStatusFilter v-model="listState.status" />
    </div>

    <BaseTable
      :loading="transactionsTable.loading.value"
      :pagination="transactionsTable.pagination"
      :items="transactionsTable.items.value"
      container-class="transactions-table__container"
      reversed
      :pagination-breakpoint="1441"
      @next-page="transactionsTable.nextPage()"
      @prev-page="transactionsTable.prevPage()"
      @set-page="transactionsTable.setPage($event)"
      @set-size="transactionsTable.setSize($event)"
    >
      <template #row="{ item }">
        <div class="transactions-table__row">
          <TransactionStatus
            type="tooltip"
            class="transactions-table__icon"
            :committed="item.status === 'Committed'"
          />

          <div class="transactions-table__column">
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
              v-if="props.showAuthority"
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
              v-if="props.showBlock"
              class="transactions-table__column-block"
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

  &-filters {
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

    &-block {
      display: flex;
      gap: size(1);
      align-items: center;
      width: size(10);
    }
  }
}
</style>
