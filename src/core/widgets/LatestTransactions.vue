<template>
  <BaseContentBlock
    :title="$t('latestTransactions')"
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

      <div v-if="!transactionsStore.isLoading">
        <div
          v-for="(transaction, index) in data"
          :key="index"
          class="latest-transactions__row"
        >
          <TransactionStatus
            :committed="!transaction?.rejection_reason"
            type="tooltip"
            class="latest-transactions__status"
          />

          <BaseHash
            :hash="transaction.hash"
            type="full"
            :link="'/transactions/' + transaction.hash"
            copy
          />

          <div class="latest-transactions__info">
            <div class="latest-transactions__time">
              <TimeIcon />
              <span>{{ $t('time.min', [getTimeDifference(transaction.payload.creation_time)]) }} {{ $t('time.ago') }}</span>
            </div>

            <BaseLink
              :to="`/accounts/${transaction.payload.account_id}`"
              monospace
              class="latest-transactions__account"
            >
              {{ transaction.payload.account_id }}
            </BaseLink>
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
import { computed, onMounted, ref } from 'vue';
import BaseLink from '@/core/components/BaseLink.vue';
import TimeIcon from '@/core/assets/clock.svg';
import TransactionStatus from '@/core/components/Transactions/TransactionStatus.vue';
import BaseHash from '@/core/components/BaseHash.vue';
import BaseButton from '@/core/components/BaseButton.vue';
import BaseContentBlock from '@/core/components/BaseContentBlock.vue';
import { useTransactionsStore } from '@/stores/transactions';
import BaseLoading from '@/core/components/BaseLoading.vue';
import { REJECTED_TRANSACTION } from '@/views/Transactions/consts';
import type { TRANSACTION_STATUS } from '@/core/types/transactions';
import TransactionStatusFilter from '@/core/components/Transactions/TransactionStatusFilter.vue';
import { getTimeDifference } from '@/core/utils/time';
import { useErrorHandlers } from '@/core/composables/useErrorHandlers';

const { handleUnknownError } = useErrorHandlers();

const transactionsStore = useTransactionsStore();

const params = {
  page: 1,
  page_size: 6,
};

onMounted(async () => {
  try {
    await transactionsStore.fetchTransactions(params);
  } catch (e) {
    handleUnknownError(e);
  }
});

const data = computed(() => {
  if (!status.value) return transactionsStore.transactions;

  if (status.value === REJECTED_TRANSACTION) return transactionsStore.transactions.filter((t) => t.rejection_reason);
  else return transactionsStore.transactions.filter((t) => !t.rejection_reason);
});

const status = ref<TRANSACTION_STATUS>(null);
</script>

<style lang="scss">
@import '@/styles/main';

.latest-transactions {
  &_loading {
    display: flex;
    align-items: center;
    margin-top: 20px;
  }

  &__row {
    padding: size(1);
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

    @include xs {
      padding: size(1) size(2);
      grid-gap: size(1) size(2);
    }

    @include sm {
      padding: size(2);
    }

    @include lg {
      grid-gap: size(1.5) size(2);
      padding: size(3) size(4);
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
    color: theme-color('content-primary');
    @include tpg-s3;

    svg {
      fill: theme-color('content-quaternary');
      width: 10px;
      height: 10px;
      margin-right: 6px;
    }
  }

  &__status {
    grid-row: 1 / -1;
  }
}
</style>
