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
        <TransactionStatusFilter v-model="status" />
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
              <span>{{ getTimeAgo(now.getTime(), transaction.created_at) }}</span>
              <Tooltip :message="defaultFormat(transaction.created_at)" />
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
import { computed, onMounted, ref, shallowRef } from 'vue';
import TimeIcon from '@/shared/ui/icons/clock.svg';
import type { filterTransactionsModel as ftm } from '@/features/filter-transactions';
import { TransactionStatusFilter } from '@/features/filter-transactions';
import TransactionStatus from '@/entities/transaction/TransactionStatus.vue';
import BaseHash from '@/shared/ui/components/BaseHash.vue';
import BaseButton from '@/shared/ui/components/BaseButton.vue';
import BaseContentBlock from '@/shared/ui/components/BaseContentBlock.vue';
import { defaultFormat, getTimeAgo } from '@/shared/lib/time';
import BaseLoading from '@/shared/ui/components/BaseLoading.vue';
import type { Transaction } from '@/shared/api/schemas';
import { useErrorHandlers } from '@/shared/ui/composables/useErrorHandlers';
import * as http from '@/shared/api';
import { useNow, useWindowSize } from '@vueuse/core';
import Tooltip from '@/shared/ui/components/ContextTooltip.vue';
import { LG_WINDOW_SIZE, XS_WINDOW_SIZE } from '@/shared/ui/consts';

const now = useNow({ interval: 1000 });

const status = ref<ftm.Status>(null);

const transactions = shallowRef<Transaction[]>([]);
const isLoading = ref(false);

const { handleUnknownError } = useErrorHandlers();

onMounted(async () => {
  try {
    isLoading.value = true;

    const { items } = await http.fetchTransactions({ per_page: 5 });

    transactions.value = items;
  } catch (error) {
    handleUnknownError(error);
  } finally {
    isLoading.value = false;
  }
});

const HASH_BREAKPOINT = 1300;

const { width } = useWindowSize();

const hashType = computed(() => {
  if (width.value > HASH_BREAKPOINT) return 'medium';

  if (width.value > LG_WINDOW_SIZE) return 'short';

  if (width.value > XS_WINDOW_SIZE) return 'medium';

  return 'short';
});
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
    grid-gap: size(0.5) size(2);

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
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    cursor: default;
    position: relative;
    color: theme-color('content-primary');
    @include tpg-s3;

    svg {
      fill: theme-color('content-quaternary');
      width: 10px;
      height: 10px;
      margin-right: 6px;
    }

    &:hover .context-tooltip {
      display: flex;
      left: size(21);
    }
  }

  &__status {
    grid-row: 1 / -1;
  }
}
</style>
