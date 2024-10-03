<script setup lang="ts">
import { useRouter } from 'vue-router';
import { computed, reactive, ref, watch } from 'vue';
import * as http from '@/shared/api';
import BaseContentBlock from '@/shared/ui/components/BaseContentBlock.vue';
import { useWindowSize } from '@vueuse/core';
import { useErrorHandlers } from '@/shared/ui/composables/useErrorHandlers';
import BaseLoading from '@/shared/ui/components/BaseLoading.vue';
import DataField from '@/shared/ui/components/DataField.vue';
import invariant from 'tiny-invariant';
import TimeIcon from '@/shared/ui/icons/clock.svg';
import { TransactionStatus } from '@/entities/transaction';
import { formatUTC } from '@/shared/lib/time';
import type { DetailedTransaction } from '@/shared/api/schemas';
import { useTable } from '@/shared/lib/table';
import { parseMetadata } from '@/shared/ui/utils/json';
import { instructionsAdaptiveOptions } from '@/features/filter-transactions/adaptive-options';
import { type filterTransactionsModel as ftm, InstructionTypeFilter } from '@/features/filter-transactions';
import InstructionsTable from '@/shared/ui/components/InstructionsTable.vue';

const router = useRouter();

const { handleUnknownError } = useErrorHandlers();

const HASH_BREAKPOINT = 1100;
const TRANSACTION_HASH_BREAKPOINT = 1200;
const SIGNATURE_HASH_BREAKPOINT = 1400;
const { width } = useWindowSize();

const transactionHashType = computed(() => (width.value < TRANSACTION_HASH_BREAKPOINT ? 'medium' : 'full'));
const signatureHashType = computed(() => (width.value < SIGNATURE_HASH_BREAKPOINT ? 'medium' : 'full'));
const hashType = computed(() => (width.value < HASH_BREAKPOINT ? 'medium' : 'full'));

const transactionHash = computed(() => {
  const hash = router.currentRoute.value.params['hash'];

  invariant(typeof hash === 'string', 'Expected string');

  return hash;
});

const transaction = ref<DetailedTransaction | null>(null);
const isFetchingTransaction = ref(false);
const instructionsTable = useTable(http.fetchInstructions);

watch(
  () => transactionHash.value,
  async () => {
    try {
      isFetchingTransaction.value = true;
      const res = await Promise.all([http.fetchTransaction(transactionHash.value)]);
      transaction.value = res[0];
    } catch (e) {
      handleUnknownError(e);
    } finally {
      isFetchingTransaction.value = false;
    }
  },
  { immediate: true }
);

const listState = reactive({
  kind: '' as ftm.TabInstructions,
  transaction_hash: transactionHash.value,
});

async function fetchInstructions() {
  try {
    await instructionsTable.fetch(listState);
  } catch (e) {
    handleUnknownError(e);
  }
}

watch(listState, fetchInstructions, { immediate: true });
</script>

<template>
  <div class="transaction-details">
    <BaseContentBlock
      class="transaction-details__metrics"
      :title="$t('transactions.transactionDetails')"
    >
      <template #default>
        <div
          v-if="isFetchingTransaction"
          class="transaction-details__info_loading"
        >
          <BaseLoading />
        </div>
        <div v-else-if="transaction">
          <div class="transaction-details__info">
            <div class="transaction-details__info-row">
              <DataField
                :title="$t('transactions.transactionHash')"
                :hash="transaction.hash"
                :type="transactionHashType"
                copy
              />

              <div class="transaction-details__info-row-time">
                <span class="h-sm">{{ $t('transactions.timestamp') }}</span>
                <div class="transaction-details__info-row-time-date row-text">
                  <TimeIcon />
                  <span>{{ formatUTC(transaction.created_at) }}</span>
                </div>
              </div>
            </div>
            <div class="transaction-details__info-row">
              <div class="transaction-details__info-row-status">
                <span class="h-sm">{{ $t('transactions.status') }}</span>
                <TransactionStatus
                  :committed="transaction.status === 'Committed'"
                  type="label"
                />
              </div>

              <DataField
                v-if="transaction.rejection_reason"
                :title="$t('transactions.rejectedReason')"
                :value="transaction.rejection_reason"
              />
            </div>
            <div class="transaction-details__info-row">
              <DataField
                :title="$t('accounts.accountId')"
                :hash="transaction.authority"
                :type="hashType"
                :link="`/accounts/${transaction.authority}`"
                copy
              />

              <DataField
                :title="$t('transactions.nonce')"
                :value="transaction.nonce"
              />
            </div>
            <div class="transaction-details__info-row">
              <DataField
                :title="$t('transactions.block')"
                :value="transaction.block"
                :link="`/blocks/${transaction.block}`"
              />

              <DataField
                :title="$t('transactions.metadata')"
                :value="parseMetadata(transaction.metadata)"
              />
            </div>
            <div class="transaction-details__info-row">
              <DataField
                :title="$t('transactions.signature')"
                :hash="transaction.signature"
                :type="signatureHashType"
              />
            </div>
          </div>
        </div>
      </template>
    </BaseContentBlock>
    <BaseContentBlock
      class="transaction-details__transactions"
      :title="$t('transactions.executable')"
    >
      <template #default>
        <div
          v-if="transaction && transaction.executable === 'Wasm'"
          class="transaction-details__transactions-wasm"
        >
          <span class="row-text">{{ $t('transactions.transactionContainsWasm') }}</span>
        </div>
        <div v-else>
          <div class="transaction-details__transactions-filters content-row">
            <InstructionTypeFilter
              v-model="listState.kind"
              :adaptive-options="instructionsAdaptiveOptions"
            />
          </div>
          <InstructionsTable
            :table="instructionsTable"
            :all-types="!listState.kind"
          />
        </div>
      </template>
    </BaseContentBlock>
  </div>
</template>

<style lang="scss">
@import '@/shared/ui/styles/main';

.transaction-details {
  display: flex;
  flex-direction: column;

  @include xxs {
    padding: 0 size(2);
    gap: size(2);
  }

  @include md {
    padding: 0 size(3);
  }

  &__info {
    &_loading {
      margin-top: size(1);
      display: flex;
      justify-content: center;
    }

    &-row {
      margin-top: size(2);

      display: flex;
      padding: 0 size(2) 0 size(4);

      @include xxs {
        flex-direction: column;
        justify-content: left;
        gap: size(2);
      }

      @include md {
        flex-direction: row;
        align-items: center;
        gap: size(8);
      }

      &-time {
        display: flex;
        flex-direction: column;
        gap: size(1);

        &-date {
          gap: size(1);
          display: flex;

          svg {
            width: 16px;
            height: 16px;
          }
        }
      }

      &-status {
        display: flex;
        flex-direction: column;
        gap: size(1);
      }
    }
  }

  &__transactions {
    &-filters {
      padding: 0 size(2) 0 size(4);
    }

    & > hr {
      display: none;
    }

    &-wasm {
      padding: 0 size(4);
    }
  }
}
</style>
