<script setup lang="ts">
import { defaultFormat } from '@/shared/lib/time';
import BaseTable from '@/shared/ui/components/BaseTable.vue';
import BaseHash from '@/shared/ui/components/BaseHash.vue';
import TransactionStatus from '@/entities/transaction/TransactionStatus.vue';
import BaseLink from '@/shared/ui/components/BaseLink.vue';
import type { AccountId, TransactionSearchParams } from '@/shared/api/schemas';
import { TransactionStatusFilter } from '@/features/filter-transactions';
import { computed, reactive, watch } from 'vue';
import * as http from '@/shared/api';
import { useParamScope } from '@vue-kakuyaku/core';
import { setupAsyncData } from '@/shared/utils/setup-async-data';

const props = withDefaults(
  defineProps<{
    showBlock?: boolean
    showAuthority?: boolean
    hashType: 'short' | 'medium' | 'full'
    filterBy?: { kind: 'authority', value: AccountId } | { kind: 'block', value: number } | null
  }>(),
  { showBlock: false, showAuthority: false, filterBy: null }
);

const listState = reactive({
  status: null,
  authority: computed(() => (props.filterBy?.kind === 'authority' ? props.filterBy.value : undefined)),
  block: computed(() => (props.filterBy?.kind === 'block' ? props.filterBy?.value : 0)),
  page: 0,
  per_page: 10,
});

const searchParams = computed<TransactionSearchParams>(() => {
  return {
    ...listState,
    status: listState.status ?? undefined,
  };
});

watch([() => listState.per_page, () => listState.status], () => {
  listState.page = 0;
});

const scope = useParamScope(
  () => {
    return {
      key: JSON.stringify(searchParams.value),
      payload: searchParams.value,
    };
  },
  ({ payload }) => setupAsyncData(() => http.fetchTransactions(payload))
);

const isLoading = computed(() => scope.value?.expose.isLoading);
const transactions = computed(() => scope.value?.expose.data?.items ?? []);
const payloadPagination = computed(() => scope.value.expose.data?.pagination);
</script>

<template>
  <div class="transactions-table">
    <div class="transactions-table-filters content-row">
      <TransactionStatusFilter v-model="listState.status" />
    </div>

    <BaseTable
      v-model:page="listState.page"
      v-model:page-size="listState.per_page"
      :loading="isLoading"
      :items="transactions"
      :total="payloadPagination?.total_items"
      :payload-pagination
      container-class="transactions-table__container"
      reversed
      :pagination-breakpoint="1441"
    >
      <template #row="{ item }">
        <div class="transactions-table__row">
          <TransactionStatus
            type="tooltip"
            class="transactions-table__icon"
            :committed="item.status === 'Committed'"
          />

          <div class="transactions-table__column transactions-table__column-hash">
            <div class="transactions-table__label">
              {{ $t('transactions.transactionID') }}
            </div>

            <BaseHash
              :hash="item.hash"
              :type="hashType"
              :link="`/transactions/${item.hash}`"
              copy
            />

            <time
              :datetime="item.created_at.toISOString()"
              class="transactions-table__time"
            >
              {{ defaultFormat(item.created_at) }}
            </time>
          </div>

          <div class="transactions-table__columns">
            <div
              v-if="props.showAuthority"
              class="transactions-table__column transactions-table__column-authority"
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
      align-items: center;
    }

    @include md {
      grid-template-columns: 32px 0.3fr 1fr;
    }

    @include lg {
      grid-template-columns: 32px 0.5fr 1fr;
    }

    @include xl {
      grid-template-columns: 32px 0.9fr 1fr;
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
    gap: size(2);

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

    &-hash {
      @include sm {
        width: 30vw;
      }
      @include md {
        width: 19vw;
      }
      @include lg {
        width: 25vw;
      }
      @include xl {
        width: size(82);
      }
    }

    &-authority {
      width: size(36);
    }

    &-block {
      display: flex;
      gap: size(1);
      align-items: center;

      @include xxs {
        width: size(16);
      }
      @include md {
        width: size(14);
      }
    }
  }
}
</style>
