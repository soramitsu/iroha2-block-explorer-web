<template>
  <BaseContentBlock
    :title="$t('widgets.latestTransactions')"
    class="latest-transactions"
  >
    <template #header-action>
      <BaseButton line>
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
            :committed="!transaction.error"
            type="tooltip"
            class="latest-transactions__status"
          />

          <BaseHash
            :hash="transaction.hash"
            type="medium"
            :link="`/transactions/${transaction.hash}`"
            copy
          />

          <div class="latest-transactions__info">
            <div class="latest-transactions__time">
              <TimeIcon />
              <span>{{ $t('time.min', [elapsed.allMinutes(transaction.payload.created_at)]) }} {{ $t('time.ago') }}</span>
            </div>

            <BaseHash
              :hash="transaction.payload.authority"
              type="medium"
              :link="`/accounts/${transaction.payload.authority}`"
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
import { onMounted, ref, shallowRef } from 'vue';
import TimeIcon from '@/shared/ui/icons/clock.svg';
import type { filterTransactionsModel as ftm } from '@/features/filter-transactions';
import { TransactionStatusFilter } from '@/features/filter-transactions';
import TransactionStatus from '@/entities/transaction/TransactionStatus.vue';
import BaseHash from '@/shared/ui/components/BaseHash.vue';
import BaseButton from '@/shared/ui/components/BaseButton.vue';
import BaseContentBlock from '@/shared/ui/components/BaseContentBlock.vue';
import { elapsed } from '@/shared/lib/time';
import BaseLoading from '@/shared/ui/components/BaseLoading.vue';
import type { Transaction } from '@/shared/api/dto';
import { useErrorHandlers } from '@/shared/ui/composables/useErrorHandlers';
import { http } from '@/shared/api';

const status = ref<ftm.Status>(null);

const transactions = shallowRef<Transaction[]>([]);
const isLoading = ref(false);

const { handleUnknownError } = useErrorHandlers();

onMounted(async () => {
  try {
    isLoading.value = true;

    const { items } = await http.fetchTransactions();

    transactions.value = items;
  } catch (error) {
    handleUnknownError(error);
  } finally {
    isLoading.value = false;
  }
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
