<script setup lang="ts">
import { useRouter } from 'vue-router';
import { computed, onMounted, ref } from 'vue';
import { http } from '@/shared/api';
import BaseContentBlock from '@/shared/ui/components/BaseContentBlock.vue';
import { useTable } from '@/shared/lib/table';
import BaseTable from '@/shared/ui/components/BaseTable.vue';
import { type filterTransactionsModel as ftm, TransactionStatusFilter } from '@/features/filter-transactions';
import BaseHash from '@/shared/ui/components/BaseHash.vue';
import { transactionModel } from '@/entities/transaction';
import { useWindowSize } from '@vueuse/core';
import { useErrorHandlers } from '@/shared/ui/composables/useErrorHandlers';
import BaseLoading from '@/shared/ui/components/BaseLoading.vue';
import DataField from '@/shared/ui/components/DataField.vue';
import { format } from '@/shared/lib/time';
import TransactionStatus from '@/entities/transaction/TransactionStatus.vue';
import invariant from 'ts-invariant';

const router = useRouter();

const { handleUnknownError } = useErrorHandlers();

const TRANSACTION_HASH_BREAKPOINT = 1200;
const METRICS_HASH_BREAKPOINT = 1440;
const { width } = useWindowSize();

const transactionHashType = computed(() => (width.value < TRANSACTION_HASH_BREAKPOINT ? 'short' : 'full'));
const metricsHashType = computed(() => (width.value < METRICS_HASH_BREAKPOINT ? 'medium' : 'full'));

const blockHeightOrHash = computed(() => {
  const heightOrHash = router.currentRoute.value.params['heightOrHash'];

  invariant(typeof heightOrHash === 'string', 'Expected string or number');

  return Number(heightOrHash) || heightOrHash;
});

const block = ref<Block | null>(null);
const isFetchingBlock = ref(false);

onMounted(async () => {
  try {
    isFetchingBlock.value = true;
    block.value = await http.fetchBlock(blockHeightOrHash.value);

    await transactionsTable.fetch();
  } catch (e) {
    handleUnknownError(e);
  } finally {
    isFetchingBlock.value = false;
  }
});

const transactionStatus = ref<ftm.Status>(null);

// FIXME: this loads ALL transactions, not only related to the block
const transactionsTable = useTable(transactionModel.fetchList);
</script>

<template>
  <div class="block-details">
    <BaseContentBlock
      :title="$t('blockDetails.block', [blockHeightOrHash])"
      class="block-details__metrics"
    >
      <template #default>
        <div
          v-if="isFetchingBlock"
          class="block-details__metrics_loading"
        >
          <BaseLoading />
        </div>
        <div v-else-if="block">
          <div class="block-details__metrics-data">
            <div class="block-details__metrics-data-row">
              <DataField
                :title="$t('blockDetails.blockHash')"
                :hash="block.block_hash"
                :type="metricsHashType"
                copy
              />

              <DataField
                :title="$t('blockDetails.transactionsMerkleRootHash')"
                :hash="block.parent_block_hash"
                :type="metricsHashType"
                copy
              />
            </div>

            <div class="block-details__metrics-data-row">
              <DataField
                :title="$t('blockDetails.parentBlockHash')"
                :hash="block.parent_block_hash"
                :type="metricsHashType"
                copy
              />

              <DataField
                :title="$t('blockDetails.rejectedTransactionsMerkleRootHash')"
                :hash="block.rejected_transactions_merkle_root_hash"
                :type="metricsHashType"
                copy
              />
            </div>
          </div>
        </div>
      </template>
    </BaseContentBlock>
    <BaseContentBlock
      :title="$t('blockDetails.blockTransactions')"
      class="block-details__transactions"
    >
      <div class="block-details__transactions-filters content-row">
        <TransactionStatusFilter
          v-model="transactionStatus"
          class="block-details__transactions-filters-status"
        />
      </div>

      <BaseTable
        :loading="transactionsTable.loading.value"
        :items="transactionsTable.items.value"
        :pagination="transactionsTable.pagination"
        container-class="block-details__transactions-container"
        @next-page="transactionsTable.nextPage()"
        @prev-page="transactionsTable.prevPage()"
        @set-page="transactionsTable.setPage($event)"
        @set-size="transactionsTable.setSize($event)"
      >
        <template #row="{ item }">
          <div class="block-details__transactions-row">
            <TransactionStatus
              type="tooltip"
              class="block-details__transactions-row-icon"
              :committed="item.committed"
            />

            <div class="block-details__transactions-row-column">
              <div class="block-details__transactions-row-column-label row-text">
                {{ $t('transactions.transactionID') }}
              </div>

              <BaseHash
                :hash="item.hash"
                :type="transactionHashType"
                :link="`/transactions/${item.hash}`"
                copy
              />
            </div>

            <span class="block-details__transactions-row-column">
              <span class="block-details__transactions-row-column-time row-text">{{
                format(item.payload.creation_time)
              }}</span>
            </span>
          </div>
        </template>
      </BaseTable>
    </BaseContentBlock>
  </div>
</template>

<style lang="scss">
@import '@/shared/ui/styles/main';

.block-details {
  display: flex;
  flex-direction: column;

  @include xxs {
    padding: 0 size(2);
    gap: size(1);
  }

  @include md {
    padding: 0 size(3);
    gap: size(3);
  }

  &__metrics {
    &_loading {
      margin-top: size(1);
      display: flex;
      justify-content: center;
    }

    &-data {
      display: grid;
      margin-top: size(2);
      padding: 0 size(2) 0 size(4);
      gap: size(2);
      grid-template-columns: 1fr;

      @include md {
        grid-template-columns: 1fr 1fr;
      }

      &-row {
        display: grid;
        gap: size(2);
      }

      .base-link {
        @include tpg-s3;
      }
    }
  }

  &__transactions {
    &-filters {
      border-top: 0;
      display: flex;
      padding: size(2) size(4);
    }

    &-container {
      display: grid;

      .content-row {
        height: 48px;
        min-height: 0;
      }
    }

    &-row {
      width: 100%;
      height: 32px;
      display: grid;
      grid-gap: size(2);
      grid-template-columns: 32px 2fr 1fr;

      @include xxs {
        grid-template-columns: 1fr 1fr;
        margin: size(2) 0;
        padding: 0 size(2);
      }

      @include xs {
        grid-template-columns: 32px 1fr 1fr;
        padding: 0 size(2);
      }

      @include sm {
        padding: 0 size(1);
      }

      @include md {
        padding: 0;
      }

      @include lg {
        grid-template-columns: 32px 2fr 1fr;
        padding: 0;
      }

      &-column {
        display: flex;
        justify-content: left;
        align-items: center;

        & > div {
          margin-right: 3vw;
        }
      }

      &-icon {
        display: none;

        @include xs {
          display: grid;
        }
      }
    }
  }
}
</style>
