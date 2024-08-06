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
        default-options
      />
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
      @next-page="table.nextPage()"
      @prev-page="table.prevPage()"
      @set-page="table.setPage($event)"
      @set-size="table.setSize($event)"
    >
      <template #row="{ item }: { item: Transaction }">
        <div class="transactions-list-page__row">
          <TransactionStatus
            type="tooltip"
            class="transactions-list-page__icon"
            :committed="item.committed"
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
              {{ item.block_height }}
            </BaseLink>
          </div>
        </div>
      </template>
    </BaseTable>
  </BaseContentBlock>
</template>

<script setup lang="ts">
import { transactionModel } from '@/entities/transaction';
import { computed, ref } from 'vue';
import { useWindowSize } from '@vueuse/core';
import TransactionTypeFilter from '@/features/filter-transactions/TransactionTypeFilter.vue';
import TransactionStatusFilter from '@/features/filter-transactions/TransactionStatusFilter.vue';
import TransactionStatus from '@/entities/transaction/TransactionStatus.vue';
import { format } from '@/shared/lib/time';
import { useTable } from '@/shared/lib/table';
import BaseContentBlock from '@/shared/ui/components/BaseContentBlock.vue';
import BaseTable from '@/shared/ui/components/BaseTable.vue';
import BaseHash from '@/shared/ui/components/BaseHash.vue';
import type { filterTransactionsModel as ftm } from '@/features/filter-transactions';
import BaseLink from '@/shared/ui/components/BaseLink.vue';
import type { Transaction } from '@/entities/transaction/model';

const HASH_BREAKPOINT = 1200;

const status = ref<ftm.Status>(null);
const tab = ref<ftm.DefaultTabs>('all');

const { width } = useWindowSize();

const hashType = computed(() => (width.value < HASH_BREAKPOINT ? 'short' : 'full'));

const table = useTable(transactionModel.fetchList);
table.fetch();
</script>

<style lang="scss">
@import '@/shared/ui/styles/main';

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
    display: none; // need a mobile version of the component

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
