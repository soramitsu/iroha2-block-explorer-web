<script setup lang="ts">
import { useRouter } from 'vue-router';
import { computed } from 'vue';
import * as http from '@/shared/api';
import BaseContentBlock from '@/shared/ui/components/BaseContentBlock.vue';
import { useWindowSize } from '@vueuse/core';
import BaseLoading from '@/shared/ui/components/BaseLoading.vue';
import DataField from '@/shared/ui/components/DataField.vue';
import { getLocalTime, getUTCTime } from '@/shared/lib/time';
import ArrowIcon from '@soramitsu-ui/icons/icomoon/arrows-chevron-left-rounded-24.svg';
import invariant from 'tiny-invariant';
import TransactionsTable from '@/shared/ui/components/TransactionsTable.vue';
import { useParamScope } from '@vue-kakuyaku/core';
import { setupAsyncData } from '@/shared/utils/setup-async-data';

const router = useRouter();

const METRICS_HASH_BREAKPOINT = 800;
const { width } = useWindowSize();

const metricsHashType = computed(() => (width.value < METRICS_HASH_BREAKPOINT ? 'medium' : 'full'));

const blockHeightOrHash = computed(() => {
  const heightOrHash = router.currentRoute.value.params['heightOrHash'];

  invariant(typeof heightOrHash === 'string', 'Expected string or number');

  return Number(heightOrHash) || heightOrHash;
});

const blockScope = useParamScope(blockHeightOrHash, (value) => setupAsyncData(() => http.fetchBlock(value)));

const isBlockLoading = computed(() => blockScope.value.expose.isLoading);
const block = computed(() => blockScope.value?.expose.data);
const isBlockEmpty = computed(() => !block.value?.transactions_hash);

const networkMetrics = useParamScope(blockHeightOrHash, () => setupAsyncData(http.fetchNetworkMetrics));

const totalBlocks = computed(() => networkMetrics.value.expose.data?.latest_block ?? 0);
const isNextBlockExists = computed(() => block.value && block.value.height < totalBlocks.value);
const isPreviousBlockExists = computed(() => block.value && block.value.height > 1);

function handlePreviousBlockClick() {
  if (!block.value) return;

  router.push({ name: 'blocks-details', params: { heightOrHash: block.value.height - 1 } });
}

function handleNextBlockClick() {
  if (!block.value) return;

  router.push({ name: 'blocks-details', params: { heightOrHash: block.value.height + 1 } });
}

const TRANSACTIONS_HASH_BREAKPOINT = 1440;

const hashType = computed(() => (width.value < TRANSACTIONS_HASH_BREAKPOINT ? 'short' : 'full'));
</script>

<template>
  <div class="block-details">
    <BaseContentBlock class="block-details__metrics">
      <template #header>
        <div
          v-if="!isBlockLoading"
          class="block-details__metrics-header"
        >
          <ArrowIcon
            v-if="isPreviousBlockExists"
            role="button"
            tabindex="0"
            data-testid="prevBlock"
            @click="handlePreviousBlockClick"
            @keydown.enter.space="handlePreviousBlockClick"
          />
          <span class="block-details__metrics-header-block">{{ $t('blocks.block', [block?.height]) }}</span>
          <ArrowIcon
            v-if="isNextBlockExists"
            role="button"
            tabindex="0"
            data-testid="nextBlock"
            @click="handleNextBlockClick"
            @keydown.enter.space="handleNextBlockClick"
          />
        </div>
      </template>
      <template #default>
        <div
          v-if="isBlockLoading"
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
                class="block-details__metrics-data-row-date"
                :title="$t('blocks.createdAt')"
                :value="getLocalTime(block.created_at)"
                copy
                :tooltip="getUTCTime(block.created_at)"
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

              <DataField
                :title="$t('blocks.merkleRootHash')"
                :value="block.transactions_hash"
                :type="metricsHashType"
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
        <TransactionsTable
          v-if="block && !isBlockEmpty"
          show-authority
          :filter-by="{ kind: 'block', value: block.height }"
          :hash-type
        />
        <span
          v-else-if="!isBlockLoading && isBlockEmpty"
          class="block-details__transactions_empty row-text"
        >{{
          $t('blocks.thisBlockIsEmpty')
        }}</span>
      </template>
    </BaseContentBlock>
  </div>
</template>

<style lang="scss">
@use '@/shared/ui/styles/main' as *;

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

      &-block {
        user-select: none;
        cursor: default;
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

        &-date .context-tooltip {
          left: size(31);
        }
      }

      .base-link {
        @include tpg-s3;
      }
    }
  }

  &__transactions hr {
    display: none;
  }

  &__transactions_empty {
    margin-left: size(4);
  }
}
</style>
