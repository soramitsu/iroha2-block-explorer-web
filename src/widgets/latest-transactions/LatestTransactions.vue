<template>
  <BaseContentBlock
    :title="$t('widgets.latestTransactions')"
    class="latest-transactions"
  >
    <template #header-action>
      <BaseButton
        line
        to="/transactions"
      >
        {{ $t('viewAll') }}
      </BaseButton>
    </template>

    <template #default>
      <div class="latest-transactions__filters">
        <TransactionStatusFilter v-model="listState.status" />
      </div>

      <hr>

      <div v-if="!isLoading">
        <div
          v-for="(transaction, i) in transactions"
          :key="i"
          class="latest-transactions__row"
        >
          <TransactionStatus
            :committed="transaction.status === 'Committed'"
            type="tooltip"
            class="latest-transactions__status"
          />

          <BaseHash
            :hash="transaction.hash"
            :type="hashType"
            :link="`/transactions/${transaction.hash}`"
            copy
          />

          <div class="latest-transactions__info">
            <div class="latest-transactions__time">
              <TimeIcon />
              <TimeStamp :value="transaction.created_at" />
            </div>

            <BaseHash
              :hash="transaction.authority"
              :type="hashType"
              :link="`/accounts/${transaction.authority}`"
              class="latest-transactions__account"
            />
          </div>
        </div>
      </div>
      <BaseLoading
        v-else
        class="latest-transactions_loading"
      />
    </template>
  </BaseContentBlock>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue';
import TimeIcon from '@/shared/ui/icons/clock.svg';
import { TransactionStatusFilter } from '@/features/filter/transactions';
import TransactionStatus from '@/entities/transaction/TransactionStatus.vue';
import BaseHash from '@/shared/ui/components/BaseHash.vue';
import BaseButton from '@/shared/ui/components/BaseButton.vue';
import BaseContentBlock from '@/shared/ui/components/BaseContentBlock.vue';
import BaseLoading from '@/shared/ui/components/BaseLoading.vue';
import * as http from '@/shared/api';
import TimeStamp from '@/shared/ui/components/TimeStamp.vue';
import { useParamScope } from '@vue-kakuyaku/core';
import { setupAsyncData } from '@/shared/utils/setup-async-data';
import { useAdaptiveHash } from '@/shared/ui/composables/useAdaptiveHash';

const listState = reactive({
  per_page: 5,
  status: null,
});

async function fetchTransactions(params: typeof listState) {
  return await http.fetchTransactions({
    ...params,
    status: params.status ?? undefined,
  });
}

const scope = useParamScope(
  () => {
    return {
      key: JSON.stringify(listState),
      payload: listState,
    };
  },
  ({ payload }) => setupAsyncData(() => fetchTransactions(payload))
);

const isLoading = computed(() => scope.value?.expose.isLoading);
const transactions = computed(() => scope.value?.expose.data?.items ?? []);

const hashType = useAdaptiveHash({ lg: 'short', xxs: 'short' }, 'medium');
</script>

<style lang="scss">
@import '@/shared/ui/styles/main';

.latest-transactions {
  &_loading {
    display: flex;
    align-items: center;
    margin-top: 20px;
  }

  &__row {
    border-bottom: 1px solid theme-color('border-primary');
    display: grid;
    grid-gap: size(1);
    grid-template-columns: 32px 1fr;
    grid-template-rows: auto auto;
    justify-content: start;
    align-items: center;
    min-height: 64px;
    overflow-wrap: anywhere;

    &:hover {
      box-shadow: theme-shadow('row');
      border-color: transparent;
    }

    & > * {
      width: fit-content;
    }

    @include xxs {
      padding: size(3) size(4);
      grid-gap: size(1) size(2);
    }

    @include lg {
      grid-gap: size(1.5) size(2);
    }
  }

  &__info {
    display: grid;
    grid-gap: size(0.5) size(4);

    @include md {
      grid-template-columns: auto auto;
    }
  }

  &__filters {
    display: grid;
    justify-items: center;
    justify-content: center;
    padding: size(2);

    @include xs {
      grid-template-columns: auto auto;
      justify-items: initial;
      justify-content: end;
    }
  }

  &__time {
    user-select: none;
    cursor: default;
    position: relative;
    display: flex;
    align-items: center;

    svg {
      fill: theme-color('content-quaternary');
      width: 10px;
      height: 10px;
      margin-right: 6px;
    }

    &:hover .context-tooltip {
      display: flex;
      left: size(14);
    }
  }

  &__status {
    grid-row: 1 / -1;
  }
}
</style>
