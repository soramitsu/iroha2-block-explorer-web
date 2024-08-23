<script setup lang="ts">
import { useRouter } from 'vue-router';
import { computed, ref, watch } from 'vue';
import { http } from '@/shared/api';
import BaseContentBlock from '@/shared/ui/components/BaseContentBlock.vue';
import BaseTable from '@/shared/ui/components/BaseTable.vue';
import { type filterTransactionsModel as ftm, TransactionStatusFilter } from '@/features/filter-transactions';
import BaseHash from '@/shared/ui/components/BaseHash.vue';
import { useWindowSize } from '@vueuse/core';
import { useErrorHandlers } from '@/shared/ui/composables/useErrorHandlers';
import BaseLoading from '@/shared/ui/components/BaseLoading.vue';
import DataField from '@/shared/ui/components/DataField.vue';
import { format } from '@/shared/lib/time';
import TransactionStatus from '@/entities/transaction/TransactionStatus.vue';
import ArrowIcon from '@soramitsu-ui/icons/icomoon/arrows-chevron-left-rounded-24.svg';
import invariant from 'tiny-invariant';
import type { BlockDto } from '@/shared/api/dto';
import { blockSchema } from '@/shared/api/dto';

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

const block = ref<BlockDto | null>(null);
const isFetchingBlock = ref(false);
const isNextBlockExists = ref(false);
const isPreviousBlockExists = ref(false);

watch(
  () => blockHeightOrHash.value,
  async () => {
    try {
      isFetchingBlock.value = true;
      block.value = await http.fetchBlock(blockHeightOrHash.value);

      blockSchema.parse(block.value);
      // TODO: replace with fetching peer status when backend is ready
      const blocks = 30;

      isNextBlockExists.value = block.value.header.height < blocks;
      isPreviousBlockExists.value = block.value.header.height > 1;
    } catch (e) {
      handleUnknownError(e);
    } finally {
      isFetchingBlock.value = false;
    }
  },
  { immediate: true }
);

function handlePreviousBlockClick() {
  if (!block.value) return;

  router.push({ name: 'blocks-details', params: { heightOrHash: block.value.header.height - 1 } });
}

function handleNextBlockClick() {
  if (!block.value) return;

  router.push({ name: 'blocks-details', params: { heightOrHash: block.value.header.height + 1 } });
}

const transactionStatus = ref<ftm.Status>(null);

const transactions = computed(() => {
  if (!block.value) return [];

  if (transactionStatus.value === 'committed') return block.value.transactions.filter((t) => !t.error);
  else if (transactionStatus.value === 'rejected') return block.value.transactions.filter((t) => t.error);

  return block.value.transactions;
});
</script>

<template>
  <div class="block-details">
    <BaseContentBlock class="block-details__metrics">
      <template #header>
        <div
          v-if="!isFetchingBlock"
          class="block-details__metrics-header"
        >
          <ArrowIcon
            v-if="isPreviousBlockExists"
            data-testid="prevBlock"
            @click="handlePreviousBlockClick"
          />
          {{ $t('blocks.block', [block?.header.height]) }}
          <ArrowIcon
            v-if="isNextBlockExists"
            data-testid="nextBlock"
            @click="handleNextBlockClick"
          />
        </div>
      </template>
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
                :title="$t('blocks.blockHash')"
                :hash="block.hash"
                :type="metricsHashType"
                copy
              />

              <DataField
                v-if="block.header.prev_block_hash"
                :title="$t('blocks.parentBlockHash')"
                :hash="block.header.prev_block_hash"
                :type="metricsHashType"
                :link="`/blocks/${block.header.prev_block_hash}`"
                copy
              />

              <DataField
                :title="$t('blocks.createdAt')"
                :value="format(block.header.created_at)"
                copy
              />
            </div>
          </div>
        </div>
      </template>
    </BaseContentBlock>
    <BaseContentBlock
      :title="$t('blocks.blockTransactions')"
      class="block-details__transactions"
    >
      <div class="block-details__transactions-filters content-row">
        <TransactionStatusFilter
          v-model="transactionStatus"
          class="block-details__transactions-filters-status"
        />
      </div>

      <!--      TODO: Add pagination when backend is ready-->
      <BaseTable
        v-if="block"
        :loading="isFetchingBlock"
        :items="transactions"
        container-class="block-details__transactions-container"
      >
        <template #row="{ item }">
          <div class="block-details__transactions-row">
            <TransactionStatus
              type="tooltip"
              class="block-details__transactions-row-icon"
              :committed="!item.error"
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
                format(item.payload.created_at)
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
    gap: size(2);
  }

  @include md {
    padding: 0 size(3);
  }

  &__metrics {
    .base-content-block__header {
      &:has([data-testid='prevBlock']) {
        padding: 0 size(3);
      }

      padding: 0 size(4);
    }

    &-header {
      display: flex;
      align-items: center;
      color: theme-color('content-primary');
      @include tpg-h2();

      svg {
        cursor: pointer;
        height: size(4);
        width: size(4);
        fill: theme-color('content-quaternary');
      }

      [data-testid='nextBlock'] {
        transform: scaleX(-1);
      }
    }

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
        padding: 0 size(4);
        height: 48px;
        min-height: 0;

        &:last-child {
          border-bottom: 1px solid theme-color('border-primary');
        }
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
        padding: 0;
      }

      @include xs {
        grid-template-columns: 32px 1fr 1fr;
      }

      @include lg {
        grid-template-columns: 32px 2fr 1fr;
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
