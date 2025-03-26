<script setup lang="ts">
import * as http from '@/shared/api';
import BaseTable from '@/shared/ui/components/BaseTable.vue';
import BaseContentBlock from '@/shared/ui/components/BaseContentBlock.vue';
import { computed, onUnmounted, ref, shallowRef } from 'vue';
import { numberFormatter } from '@/shared/ui/utils/formatters';
import { useTimeAgo } from '@/shared/ui/composables/useTimeAgo';
import type { NetworkMetrics, Peer } from '@/shared/api/schemas';
import { useErrorHandlers } from '@/shared/ui/composables/useErrorHandlers';
import BaseLoading from '@/shared/ui/components/BaseLoading.vue';
import { useIntervalFn } from '@vueuse/shared';
import { useAsyncState } from '@vueuse/core';

const { handleUnknownError } = useErrorHandlers();

const metrics = ref<NetworkMetrics | null>(null);
const peers = shallowRef<(Peer | null)[]>([]);

const { isLoading, execute } = useAsyncState(fetchMetrics, null);

async function fetchMetrics() {
  try {
    const [networkMetrics, peersInfo, peersMetrics] = await Promise.all([
      http.fetchNetworkMetrics(),
      http.fetchPeersInfo(),
      http.fetchPeersMetrics(),
    ]);

    metrics.value = networkMetrics;
    peers.value = peersInfo.map((p) => {
      const data = peersMetrics.find((i) => i.peer === p.public_key);

      if (!data) return null;

      return {
        ...p,
        ...data,
      };
    });
  } catch (e) {
    handleUnknownError(e);
  }
}

const { pause } = useIntervalFn(execute, 15000, {
  immediateCallback: true,
});

onUnmounted(pause);

const formattedLastBlock = computed(() => {
  return (Math.floor(lastBlockTimestamp.value / 100) / 10).toFixed(1);
});
const lastBlockTimestamp = useTimeAgo(
  computed(() => metrics.value?.latest_block_created_at ?? new Date()),
  {
    refreshInterval: 100,
    detailedSeconds: true,
  }
);

function formatTimeSpan(date1: Date | null, date2: Date | null) {
  if (!date1 || !date2) return '-';

  return (date1.getTime() - date2.getTime()) / 1000 + 's';
}
</script>

<template>
  <div class="nodes-telemetry-page">
    <BaseLoading
      v-if="isLoading"
      class="nodes-telemetry-page_loading"
    />
    <div
      v-else-if="metrics"
      class="nodes-telemetry-page__stats"
    >
      <div class="nodes-telemetry-page__stats-stat">
        <span class="nodes-telemetry-page__stats-stat-value">#{{ numberFormatter(metrics.latest_block) }}</span>
        <span class="nodes-telemetry-page__stats-stat-label">{{ $t('telemetry.bestBlock') }}</span>
      </div>
      <div class="nodes-telemetry-page__stats-stat">
        <span class="nodes-telemetry-page__stats-stat-value">#{{ numberFormatter(metrics.finalized_block) }}</span>
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
        <span class="nodes-telemetry-page__stats-stat-value nodes-telemetry-page__stats-stat-last-block">
          <span
            class="nodes-telemetry-page__stats-stat-last-block-timespan"
            :class="{ 'nodes-telemetry-page__stats-stat-last-block-timespan_big': Number(formattedLastBlock) >= 10 }"
          >{{ formattedLastBlock }}</span>
          <span>s</span>
        </span>
        <span class="nodes-telemetry-page__stats-stat-label">{{ $t('telemetry.lastBlock') }}</span>
      </div>
    </div>
    <BaseContentBlock
      :title="$t('telemetry.nodes')"
      class="nodes-telemetry-page__list"
    >
      <BaseTable
        disable-pagination
        :loading="isLoading"
        :items="peers"
        container-class="nodes-telemetry-page__list-container"
        :breakpoint="1440"
      >
        <template #header>
          <div class="nodes-telemetry-page__list-row">
            <span class="h-sm cell">{{ $t('telemetry.block') }}</span>
            <span class="h-sm cell">{{ $t('telemetry.blockPropagationTime') }}</span>
            <span class="h-sm cell">{{ $t('telemetry.txnsInQueue') }}</span>
            <span class="h-sm cell">{{ $t('telemetry.location') }}</span>
          </div>
        </template>

        <template #row="{ item }">
          <div class="nodes-telemetry-page__list-row">
            <span class="row-text cell">{{ numberFormatter(item.block) }}</span>
            <span class="row-text cell">{{ formatTimeSpan(item.block_arrived_at, item.block_created_at) }}</span>
            <span class="row-text cell">{{ numberFormatter(item.queue_size) }}</span>
            <span
              class="row-text cell"
              :class="{ 'nodes-telemetry-page__list-row-value_empty': !item.location }"
            >{{
              item.location ?? 'Unknown'
            }}</span>
          </div>
        </template>

        <template #mobile-card="{ item }">
          <div class="nodes-telemetry-page__list-mobile-card">
            <div class="nodes-telemetry-page__list-mobile-row">
              <span class="h-sm nodes-telemetry-page__list-mobile-row-label">{{ $t('telemetry.block') }}</span>
              <span class="row-text">{{ numberFormatter(item.block) }}</span>
            </div>

            <div class="nodes-telemetry-page__list-mobile-row">
              <span class="h-sm nodes-telemetry-page__list-mobile-row-label">{{
                $t('telemetry.blockPropagationTime')
              }}</span>
              <span class="row-text">{{ formatTimeSpan(item.block_arrived_at, item.block_created_at) }}</span>
            </div>

            <div class="nodes-telemetry-page__list-mobile-row">
              <span class="h-sm nodes-telemetry-page__list-mobile-row-label">{{ $t('telemetry.txnsInQueue') }}</span>
              <span class="row-text">{{ numberFormatter(item.queue_size) }}</span>
            </div>

            <div class="nodes-telemetry-page__list-mobile-row">
              <span class="h-sm nodes-telemetry-page__list-mobile-row-label">{{ $t('telemetry.location') }}</span>
              <span
                class="row-text"
                :class="{ 'nodes-telemetry-page__list-mobile-row-value_empty': !item.location }"
              >{{
                item.location ?? 'Unknown'
              }}</span>
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
        @include tpg-h2();

        @include sm {
          @include tpg-h1();
        }

        @include lg {
          @include tpg-d1();
        }
        color: theme-color('content-primary');
      }
      &-last-block {
        width: 100%;
        @include sm {
          width: size(17.5);
        }
        @include lg {
          width: size(24.5);
        }
        @include xl {
          width: 75%;
        }
        @include xxl {
          width: 66%;
        }

        &-timespan {
          @include xxs {
            width: size(4.5);
          }
          @include sm {
            width: size(6);
          }
          @include lg {
            width: size(8.5);
          }

          &_big {
            @include xxs {
              width: size(6);
            }
            @include sm {
              width: size(8);
            }
            @include lg {
              width: size(11.5);
            }
          }
        }
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
          width: size(13);
        }
        @include sm {
          width: size(31);
        }
        @include xl {
          width: 100%;
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
        grid-template-columns: repeat(4, 1fr);
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
