<template>
  <BaseContentBlock
    :title="$t('transactions.transactions')"
    class="transactions-list-page"
  >
    <div class="content-row">
      <TransactionStatusFilter
        v-model="status"
        class="transactions-list-page__status"
      />
    </div>

    <BaseTable
      :loading="table.loading.value"
      :pagination="table.pagination"
      :items="table.items.value"
      container-class="transactions-list-page__container"
      sticky
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
            :committed="!item.error"
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
              {{ format(item.created_at) }}
            </div>
          </div>

          <div class="transactions-list-page__column">
            <div class="transactions-list-page__label">
              {{ $t('transactions.block') }}
            </div>

            <BaseHash
              :link="`/blocks/${item.block_hash}`"
              :hash="item.block_hash"
              type="short"
            />
          </div>
        </div>
      </template>
    </BaseTable>
  </BaseContentBlock>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useWindowSize } from '@vueuse/core';
import TransactionStatusFilter from '@/features/filter-transactions/TransactionStatusFilter.vue';
import TransactionStatus from '@/entities/transaction/TransactionStatus.vue';
import { format } from '@/shared/lib/time';
import { useTable } from '@/shared/lib/table';
import BaseContentBlock from '@/shared/ui/components/BaseContentBlock.vue';
import BaseTable from '@/shared/ui/components/BaseTable.vue';
import BaseHash from '@/shared/ui/components/BaseHash.vue';
import type { filterTransactionsModel as ftm } from '@/features/filter-transactions';
import { useErrorHandlers } from '@/shared/ui/composables/useErrorHandlers';
import { ZodError } from 'zod';
import { http } from '@/shared/api';

const HASH_BREAKPOINT = 1200;

const status = ref<ftm.Status>(null);

const { width } = useWindowSize();

const hashType = computed(() => (width.value < HASH_BREAKPOINT ? 'short' : 'full'));

const table = useTable(http.fetchTransactions, { sticky: true });
const { handleUnknownError, handleZodError } = useErrorHandlers();

onMounted(async () => {
  try {
    await table.fetch();
  } catch (e) {
    if (e instanceof ZodError) handleZodError(e);
    else handleUnknownError(e);
  }
});
</script>

<style lang="scss">
@import '@/shared/ui/styles/main';

.transactions-list-page {
  .content-row {
    padding: 0 size(4);
  }

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

  &__container {
    display: grid;
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
