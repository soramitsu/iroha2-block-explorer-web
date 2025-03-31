<script setup lang="ts">
import * as http from '@/shared/api';
import BaseTable from '@/shared/ui/components/BaseTable.vue';
import BaseContentBlock from '@/shared/ui/components/BaseContentBlock.vue';
import { computed, reactive, watch } from 'vue';
import { formatNumber } from '@/shared/ui/utils/formatters';
import type { PeerInfo } from '@/shared/api/schemas';
import type { PeerMetrics } from '@/shared/api/schemas';
import { useErrorHandlers } from '@/shared/ui/composables/useErrorHandlers';
import BaseLoading from '@/shared/ui/components/BaseLoading.vue';
import { useIntervalFn } from '@vueuse/shared';
import { useAsyncState, useWindowSize } from '@vueuse/core';
import BaseHash from '@/shared/ui/components/BaseHash.vue';
import { LG_WINDOW_SIZE, MD_WINDOW_SIZE, SM_WINDOW_SIZE, XS_WINDOW_SIZE } from '@/shared/ui/consts';
import LatestBlock from '@/entities/telemetry/LatestBlock.vue';
import { streamPeerMetrics } from '@/shared/api';
import invariant from 'tiny-invariant';

const { handleUnknownError } = useErrorHandlers();

const { width } = useWindowSize();

const hashType = computed(() => {
  if (width.value >= LG_WINDOW_SIZE) return 'medium';

  if (width.value >= MD_WINDOW_SIZE) return 'short';

  if (width.value >= SM_WINDOW_SIZE) return 'medium';

  if (width.value >= XS_WINDOW_SIZE) return 'short';

  return 'short';
});

interface PeerData {
  metrics: null | PeerMetrics
  info: null | PeerInfo
}

const peers = reactive(new Map<string, PeerData>());

const {
  isLoading: isMetricsLoading,
  state: metrics,
  execute: getNetworkMetrics,
} = useAsyncState(http.fetchNetworkMetrics, null, {
  immediate: false,
  onError: handleUnknownError,
  resetOnExecute: false,
});
const { execute: getPeersInfo } = useAsyncState(http.fetchPeersInfo, null, {
  immediate: false,
  onError: handleUnknownError,
  onSuccess: (data) => {
    invariant(data, 'Expected peer info, received:' + data);

    data.forEach((i) => {
      peers.set(i.public_key, { ...(peers.get(i.public_key) ?? { metrics: null }), info: i });
    });
  },
});

const { data: streamedPeerMetrics, status: streamStatus } = streamPeerMetrics();

watch(
  () => streamedPeerMetrics.value,
  () => {
    if (!streamedPeerMetrics.value) return;

    const peer = peers.get(streamedPeerMetrics.value.peer);
    peers.set(streamedPeerMetrics.value.peer, { info: peer?.info ?? null, metrics: streamedPeerMetrics.value });
  }
);

useIntervalFn(getNetworkMetrics, 15000, {
  immediateCallback: true,
});
useIntervalFn(getPeersInfo, 30000, {
  immediateCallback: true,
});

function formatTimeSpan(date1: Date | null, date2: Date | null) {
  if (!date1 || !date2) return '-';

  return (date1.getTime() - date2.getTime()) / 1000 + 's';
}
</script>

<template>
  <div class="nodes-telemetry-page">
    <BaseLoading
      v-if="isMetricsLoading && !metrics"
      class="nodes-telemetry-page_loading"
    />
    <div
      v-else-if="metrics"
      class="nodes-telemetry-page__stats"
    >
      <div class="nodes-telemetry-page__stats-stat">
        <span class="nodes-telemetry-page__stats-stat-value">#{{ formatNumber(metrics.latest_block) }}</span>
        <span class="nodes-telemetry-page__stats-stat-label">{{ $t('telemetry.bestBlock') }}</span>
      </div>
      <div class="nodes-telemetry-page__stats-stat">
        <span class="nodes-telemetry-page__stats-stat-value">#{{ formatNumber(metrics.finalized_block) }}</span>
        <span class="nodes-telemetry-page__stats-stat-label">{{ $t('telemetry.finalizedBlock') }}</span>
      </div>
      <div class="nodes-telemetry-page__stats-stat">
        <span class="nodes-telemetry-page__stats-stat-value">{{ Math.trunc(metrics.average_commit_time_ms) / 1000 }}s</span>
        <span class="nodes-telemetry-page__stats-stat-label">{{ $t('telemetry.averageBlockTime') }}</span>
      </div>
      <div class="nodes-telemetry-page__stats-stat">
        <span class="nodes-telemetry-page__stats-stat-value">{{ Math.trunc(metrics.average_block_time_ms) / 1000 }}s</span>
        <span class="nodes-telemetry-page__stats-stat-label">{{ $t('telemetry.averageBlockCommitTime') }}</span>
      </div>
      <div class="nodes-telemetry-page__stats-stat">
        <div class="nodes-telemetry-page__stats-stat-value nodes-telemetry-page__stats-stat-last-block">
          <div v-if="metrics.latest_block_created_at">
            <LatestBlock :date="metrics.latest_block_created_at" />
            <span>s</span>
          </div>
          <div v-else>
            Unknown
          </div>
        </div>
        <span class="nodes-telemetry-page__stats-stat-label">{{ $t('telemetry.lastBlock') }}</span>
      </div>
    </div>
    <BaseContentBlock
      :title="$t('telemetry.nodes')"
      class="nodes-telemetry-page__list"
    >
      <BaseTable
        disable-pagination
        :loading="streamStatus === 'CONNECTING'"
        :items="Array.from(peers.values())"
        container-class="nodes-telemetry-page__list-container"
        :breakpoint="1440"
      >
        <template #header>
          <div class="nodes-telemetry-page__list-row">
            <span class="h-sm cell">{{ $t('telemetry.publicKey') }}</span>
            <span class="h-sm cell">{{ $t('telemetry.publicUrl') }}</span>
            <span class="h-sm cell">{{ $t('telemetry.block') }}</span>
            <span class="h-sm cell">{{ $t('telemetry.blockPropagationTime') }}</span>
            <span class="h-sm cell">{{ $t('telemetry.txnsInQueue') }}</span>
            <span class="h-sm cell">{{ $t('telemetry.location') }}</span>
          </div>
        </template>

        <template #row="{ item }">
          <div
            v-if="item.metrics && item.info"
            class="nodes-telemetry-page__list-row"
          >
            <BaseHash
              :hash="item.info.public_key"
              type="medium"
              copy
              class="row-text cell"
            />
            <BaseHash
              v-if="item.info.public_url"
              :hash="item.info.public_url"
              :link="item.info.public_url"
              copy
              class="cell"
              type="medium"
            />
            <div
              v-else
              class="row-text cell"
            >
              -
            </div>
            <span class="row-text cell">{{ formatNumber(item.metrics.block) }}</span>
            <span class="row-text cell">{{
              formatTimeSpan(item.metrics.block_arrived_at, item.metrics.block_created_at)
            }}</span>
            <span class="row-text cell">{{ formatNumber(item.metrics.queue_size) }}</span>
            <span
              class="row-text cell"
              :class="{ 'nodes-telemetry-page__list-row-value_empty': !item.info.location }"
            >{{ item.info.location ?? 'Unknown' }}</span>
          </div>
        </template>

        <template #mobile-card="{ item }">
          <div
            v-if="item.metrics && item.info"
            class="nodes-telemetry-page__list-mobile-card"
          >
            <div class="nodes-telemetry-page__list-mobile-row">
              <span class="h-sm nodes-telemetry-page__list-mobile-row-label">{{ $t('telemetry.publicKey') }}</span>
              <BaseHash
                :hash="item.info.public_key"
                :type="hashType"
                copy
                class="row-text"
              />
            </div>

            <div class="nodes-telemetry-page__list-mobile-row">
              <span class="h-sm nodes-telemetry-page__list-mobile-row-label">{{ $t('telemetry.publicUrl') }}</span>
              <BaseHash
                v-if="item.info.public_url"
                :hash="item.info.public_url"
                :link="item.info.public_url"
                copy
                :type="hashType"
              />
              <div
                v-else
                class="row-text"
              >
                -
              </div>
            </div>

            <div class="nodes-telemetry-page__list-mobile-row">
              <span class="h-sm nodes-telemetry-page__list-mobile-row-label">{{ $t('telemetry.block') }}</span>
              <span class="row-text">{{ formatNumber(item.metrics.block) }}</span>
            </div>

            <div class="nodes-telemetry-page__list-mobile-row">
              <span class="h-sm nodes-telemetry-page__list-mobile-row-label">{{
                $t('telemetry.blockPropagationTime')
              }}</span>
              <span class="row-text">{{
                formatTimeSpan(item.metrics.block_arrived_at, item.metrics.block_created_at)
              }}</span>
            </div>

            <div class="nodes-telemetry-page__list-mobile-row">
              <span class="h-sm nodes-telemetry-page__list-mobile-row-label">{{ $t('telemetry.txnsInQueue') }}</span>
              <span class="row-text">{{ formatNumber(item.metrics.queue_size) }}</span>
            </div>

            <div class="nodes-telemetry-page__list-mobile-row">
              <span class="h-sm nodes-telemetry-page__list-mobile-row-label">{{ $t('telemetry.location') }}</span>
              <span
                class="row-text"
                :class="{ 'nodes-telemetry-page__list-mobile-row-value_empty': !item.info.location }"
              >{{ item.info.location ?? 'Unknown' }}</span>
            </div>
          </div>
        </template>
      </BaseTable>
    </BaseContentBlock>
  </div>
</template>

<style lang="scss">
@import '@/shared/ui/styles/main';

.nodes-telemetry-page {
  display: flex;
  justify-items: center;
  flex-direction: column;

  &_loading {
    height: size(16);
  }

  &__stats {
    width: 100%;
    margin-top: size(2);
    margin-bottom: size(4);
    display: grid;

    @include xxs {
      grid-template-columns: 1fr 1fr;
      justify-content: center;
      gap: size(2);
    }
    @include xl {
      height: size(10);
      grid-template-columns: repeat(5, 1fr);
    }

    &-stat {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: size(1);

      &-value {
        display: flex;
        justify-content: center;
        width: 100%;
        @include tpg-h2-mono();

        @include sm {
          @include tpg-h1-mono();
        }

        @include lg {
          @include tpg-d1-mono();
        }
        color: theme-color('content-primary');
      }
      &-last-block > div {
        display: flex;
      }

      &-label {
        text-align: center;
        @include tpg-s3();

        @include lg {
          @include tpg-s4();
        }
        color: theme-color('content-quaternary');
      }

      &:last-child {
        @include xxs {
          grid-column: 1 / -1;
          justify-self: center;
        }
        @include xl {
          grid-column: 5;
          justify-self: stretch;
        }
      }
    }
  }

  &__list {
    &-row {
      width: 100%;
      display: grid;
      align-items: center;

      @include lg {
        grid-template-columns: 1fr 1fr 0.5fr 0.75fr 0.5fr 0.5fr;
      }

      &-value_empty {
        font-style: italic;
        color: theme-color('content-quaternary');
      }
    }

    &-mobile-card {
      padding: size(2) size(3);
    }

    &-mobile-row {
      display: flex;
      align-items: center;

      &-label {
        text-align: left;
        width: size(24);
        padding: size(1);
        margin-right: size(2);
      }

      &-value_empty {
        font-style: italic;
        color: theme-color('content-quaternary');
      }
    }

    &-container {
      display: grid;
      grid-template-columns: 1fr;

      @include md {
        grid-template-columns: 1fr 1fr;
      }

      @include xl {
        grid-template-columns: 1fr;
      }
    }

    hr {
      display: none;
    }
  }
}
</style>
