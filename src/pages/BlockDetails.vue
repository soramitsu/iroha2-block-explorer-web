<script setup lang="ts">
import { useRouter } from 'vue-router';
import { computed, reactive, ref, watch } from 'vue';
import * as http from '@/shared/api';
import BaseContentBlock from '@/shared/ui/components/BaseContentBlock.vue';
import { useWindowSize } from '@vueuse/core';
import { useErrorHandlers } from '@/shared/ui/composables/useErrorHandlers';
import BaseLoading from '@/shared/ui/components/BaseLoading.vue';
import DataField from '@/shared/ui/components/DataField.vue';
import { defaultFormat } from '@/shared/lib/time';
import ArrowIcon from '@soramitsu-ui/icons/icomoon/arrows-chevron-left-rounded-24.svg';
import invariant from 'tiny-invariant';
import type { Block } from '@/shared/api/schemas';
import TransactionsTable from '@/shared/ui/components/TransactionsTable.vue';
import { TransactionStatusFilter } from '@/features/filter-transactions';
import { useTable } from '@/shared/lib/table';

const router = useRouter();

const { handleUnknownError } = useErrorHandlers();

const METRICS_HASH_BREAKPOINT = 1440;
const { width } = useWindowSize();

const metricsHashType = computed(() => (width.value < METRICS_HASH_BREAKPOINT ? 'medium' : 'full'));

const blockHeightOrHash = computed(() => {
  const heightOrHash = router.currentRoute.value.params['heightOrHash'];

  invariant(typeof heightOrHash === 'string', 'Expected string or number');

  return Number(heightOrHash) || heightOrHash;
});

const block = ref<Block | null>(null);
const isFetchingBlock = ref(false);
const isNextBlockExists = ref(false);
const isPreviousBlockExists = ref(false);

const listState = reactive({
  status: null,
  block: computed(() => block.value?.height),
});

watch(
  () => blockHeightOrHash.value,
  async () => {
    try {
      isFetchingBlock.value = true;
      block.value = await http.fetchBlock(blockHeightOrHash.value);

      // listState.block = block.value.height;
      const { blocks } = await http.fetchPeerStatus();

      isNextBlockExists.value = block.value.height < blocks;
      isPreviousBlockExists.value = block.value.height > 1;
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

  router.push({ name: 'blocks-details', params: { heightOrHash: block.value.height - 1 } });
}

function handleNextBlockClick() {
  if (!block.value) return;

  router.push({ name: 'blocks-details', params: { heightOrHash: block.value.height + 1 } });
}

const transactionsTable = useTable(http.fetchTransactions, { reversed: true });

async function fetchTransactions() {
  try {
    await transactionsTable.fetch(listState);
  } catch (e) {
    handleUnknownError(e);
  }
}

watch(listState, fetchTransactions);

const TRANSACTIONS_HASH_BREAKPOINT = 1350;

const hashType = computed(() => (width.value < TRANSACTIONS_HASH_BREAKPOINT ? 'short' : 'full'));
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
          {{ $t('blocks.block', [block?.height]) }}
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
                v-if="block.prev_block_hash"
                :title="$t('blocks.parentBlockHash')"
                :hash="block.prev_block_hash"
                :type="metricsHashType"
                :link="`/blocks/${block.prev_block_hash}`"
                copy
              />

              <DataField
                :title="$t('blocks.createdAt')"
                :value="defaultFormat(block.created_at)"
                copy
              />

              <DataField
                :title="$t('blocks.totalTransactions')"
                :value="block.transactions_total"
                copy
              />

              <DataField
                :title="$t('blocks.rejectedTransactions')"
                :value="block.transactions_rejected"
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
      <template #default>
        <div class="block-details__transactions-table">
          <div class="block-details__transactions-table__filters content-row">
            <TransactionStatusFilter v-model="listState.status" />
          </div>

          <TransactionsTable
            v-if="block"
            show-authority
            :table="transactionsTable"
            :filter-by="{ kind: 'block', block: block.height }"
            :hash-type="hashType"
          />
        </div>
      </template>
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
      margin-top: size(2);
      padding: 0 size(2) 0 size(4);

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
    &-table {
      &__filters {
        padding: size(2) size(4);
        display: flex;
        flex-direction: column;
        gap: size(1);

        @include sm {
          flex-direction: row;
        }
      }
    }
  }
}
</style>
