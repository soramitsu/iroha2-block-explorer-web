<template>
  <BaseContentBlock
    :title="$t('latestTransactions')"
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

      <div
        v-for="(transaction, i) in transactions"
        :key="i"
        class="latest-transactions__row"
      >
        <TransactionStatus
          :committed="transaction.committed"
          type="tooltip"
          class="latest-transactions__status"
        />

        <BaseHash
          :hash="transaction.hash"
          type="medium"
          :link="'/transactions/' + transaction.hash"
          copy
        />

        <div class="latest-transactions__info">
          <div class="latest-transactions__time">
            <TimeIcon />
            <span>{{ $t('time.min', [8]) }} {{ $t('time.ago') }}</span>
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
    </template>
  </BaseContentBlock>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import BaseLink from '@/shared/ui/components/BaseLink.vue';
import { transactionModel } from '@/entities/transaction';
import TimeIcon from '@/shared/ui/icons/clock.svg';
import type { filterTransactionsModel as ftm } from '@/features/filter-transactions';
import { TransactionStatusFilter } from '@/features/filter-transactions';
import TransactionStatus from '@/entities/transaction/TransactionStatus.vue';
import BaseHash from '@/shared/ui/components/BaseHash.vue';
import BaseButton from '@/shared/ui/components/BaseButton.vue';
import BaseContentBlock from '@/shared/ui/components/BaseContentBlock.vue';
import type { Transaction } from '@/entities/transaction/model';

const status = ref<ftm.TransactionStatus>(null);
const transactions = ref<Transaction[]>([]);

transactionModel.fetchList({ page: 1, page_size: 6 }).then((res) => {
  transactions.value = res.data;
});
</script>

<style lang="scss">
@import '@/shared/ui/styles/main';

.latest-transactions {
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
