<script setup lang="ts">
import BaseTable from '@/shared/ui/components/BaseTable.vue';
import BaseContentBlock from '@/shared/ui/components/BaseContentBlock.vue';
import { reactive, ref, watch } from 'vue';
import { formatNumber, formatTimestamp } from '@/shared/ui/utils/formatters';
import type { NetworkMetrics, PeerInfo, PeerStatus } from '@/shared/api/schemas';
import BaseLoading from '@/shared/ui/components/BaseLoading.vue';
import BaseHash from '@/shared/ui/components/BaseHash.vue';
import LatestBlock from '@/entities/telemetry/LatestBlock.vue';
import { streamPeerMetrics } from '@/shared/api';
import BaseLink from '@/shared/ui/components/BaseLink.vue';
import { useAdaptiveHash } from '@/shared/ui/composables/useAdaptiveHash';
import ContextTooltip from '@/shared/ui/components/ContextTooltip.vue';

const hashType = useAdaptiveHash({ xxs: 'short' }, 'medium');

interface PeerData {
  info: null | PeerInfo
  status: null | PeerStatus
}

const metrics = ref<NetworkMetrics | null>(null);
const peers = reactive(new Map<string, PeerData>());

const { data: streamedPeerMetrics, status: streamStatus } = streamPeerMetrics();

watch(
  () => streamedPeerMetrics.value,
  () => {
    if (!streamedPeerMetrics.value) return;

    switch (streamedPeerMetrics.value.kind) {
      case 'first': {
        metrics.value = streamedPeerMetrics.value.data.network_status;

        streamedPeerMetrics.value.data.peers_info.forEach((peer) => {
          peers.set(peer.url, { ...(peers.get(peer.url) ?? { status: null }), info: peer });
        });
        streamedPeerMetrics.value.data.peers_status.forEach((peer) => {
          peers.set(peer.url, { ...(peers.get(peer.url) ?? { info: null }), status: peer });
        });
        break;
      }
      case 'peer_info': {
        peers.set(streamedPeerMetrics.value.data.url, {
          ...(peers.get(streamedPeerMetrics.value.data.url) ?? { status: null }),
          info: streamedPeerMetrics.value.data,
        });
        break;
      }
      case 'peer_status': {
        peers.set(streamedPeerMetrics.value.data.url, {
          ...(peers.get(streamedPeerMetrics.value.data.url) ?? { info: null }),
          status: streamedPeerMetrics.value.data,
        });
        break;
      }
      case 'network_status': {
        metrics.value = streamedPeerMetrics.value.data;
        break;
      }
    }
  }
);
</script>

<template>
  <div class="nodes-telemetry-page">
    <BaseLoading
      v-if="!metrics"
      class="nodes-telemetry-page_loading"
    />
    <div
      v-else-if="metrics"
      class="nodes-telemetry-page__stats"
    >
      <div class="nodes-telemetry-page__stats-stat">
        <BaseLink
          :to="`/blocks/${metrics.block}`"
          class="nodes-telemetry-page__stats-stat-value"
          custom-font
        >
          #{{ formatNumber(metrics.block) }}
        </BaseLink>
        <span class="nodes-telemetry-page__stats-stat-label">{{ $t('telemetry.bestBlock') }}</span>
      </div>
      <div class="nodes-telemetry-page__stats-stat">
        <BaseLink
          v-if="metrics.finalized_block"
          custom-font
          :to="`/blocks/${metrics.finalized_block}`"
          class="nodes-telemetry-page__stats-stat-value"
        >
          #{{ formatNumber(metrics.finalized_block) }}
        </BaseLink>
        <span v-else>Unknown</span>
        <span class="nodes-telemetry-page__stats-stat-label">{{ $t('telemetry.finalizedBlock') }}</span>
      </div>
      <div class="nodes-telemetry-page__stats-stat">
        <span class="nodes-telemetry-page__stats-stat-value">{{ Math.trunc(metrics.avg_block_time.ms) / 1000 }}s</span>
        <span class="nodes-telemetry-page__stats-stat-label">{{ $t('telemetry.averageBlockTime') }}</span>
      </div>
      <div class="nodes-telemetry-page__stats-stat">
        <span
          v-if="metrics.avg_commit_time"
          class="nodes-telemetry-page__stats-stat-value"
        >{{ Math.trunc(metrics.avg_commit_time.ms) / 1000 }}s</span>
        <span
          v-else
          class="nodes-telemetry-page__stats-stat-value"
        >-</span>
        <span class="nodes-telemetry-page__stats-stat-label">{{ $t('telemetry.averageBlockCommitTime') }}</span>
      </div>
      <div class="nodes-telemetry-page__stats-stat">
        <div class="nodes-telemetry-page__stats-stat-value nodes-telemetry-page__stats-stat-last-block">
          <div v-if="metrics.block_created_at">
            <LatestBlock :date="metrics.block_created_at" />
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
            <span class="h-sm cell">{{ $t('telemetry.publicUrl') }}</span>
            <span class="h-sm cell">{{ $t('telemetry.connectionStatus') }}</span>
            <span class="h-sm cell">{{ $t('telemetry.location') }}</span>
            <span class="h-sm cell">{{ $t('telemetry.publicKey') }}</span>
            <span class="h-sm cell">{{ $t('telemetry.blocksGossiping') }}</span>
            <span class="h-sm cell">{{ $t('telemetry.tnxsGossiping') }}</span>
            <span class="h-sm cell">{{ $t('telemetry.block') }}</span>
            <span class="h-sm cell">{{ $t('telemetry.commitTime') }}</span>
            <span class="h-sm cell">{{ $t('telemetry.avgCommitTime') }}</span>
            <span class="h-sm cell">{{ $t('telemetry.queue') }}</span>
            <span class="h-sm cell">{{ $t('telemetry.uptime') }}</span>
          </div>
        </template>

        <template #row="{ item }">
          <div
            v-if="item.info && item.info.telemetry_unsupported"
            class="nodes-telemetry-page__list-row_unsupported row-text cell"
          >
            <BaseLink :to="item.info.url">
              {{ item.info.url }}
            </BaseLink>
            - {{ $t('telemetry.peerDoesntProvideTelemetry') }}
          </div>
          <div
            v-else-if="item.info && item.status"
            class="nodes-telemetry-page__list-row"
          >
            <BaseHash
              :hash="item.info.url"
              :link="item.info.url"
              copy
              class="cell"
              type="medium"
            />

            <span
              class="row-text cell"
              :class="[
                item.info.connected
                  ? 'nodes-telemetry-page__list-row-connection-success'
                  : 'nodes-telemetry-page__list-row-connection-error',
              ]"
            >{{ item.info.connected ? $t('telemetry.connected') : $t('telemetry.disconnected') }}</span>

            <span
              class="row-text cell"
              :class="{ 'nodes-telemetry-page__list-row-value_empty': !item.info.location }"
            >{{ item.info.location?.country ?? 'Unknown' }}</span>

            <BaseHash
              v-if="item.info.config"
              :hash="item.info.config.public_key"
              type="medium"
              copy
              class="row-text-monospace cell"
            />
            <span
              v-else
              class="row-text cell"
            >Unknown</span>

            <div
              v-if="item.info.config && item.info.config.network_block_gossip_size"
              class="nodes-telemetry-page__list-row-gossip row-text-monospace cell"
            >
              <span>{{ item.info.config.network_block_gossip_size }}</span>
              <ContextTooltip
                v-if="item.info.config.network_block_gossip_period?.ms"
                :message="
                  $t('telemetry.networkGossipDetails', [
                    item.info.config.network_block_gossip_size,
                    item.info.config.network_block_gossip_period.ms,
                  ])
                "
              />
            </div>
            <span
              v-else
              class="row-text cell"
            >-</span>

            <div
              v-if="item.info.config && item.info.config.network_tx_gossip_size"
              class="nodes-telemetry-page__list-row-gossip row-text-monospace cell"
            >
              <span>{{ item.info.config.network_tx_gossip_size }}</span>
              <ContextTooltip
                v-if="item.info.config.network_tx_gossip_period?.ms"
                :message="
                  $t('telemetry.networkGossipDetails', [
                    item.info.config.network_tx_gossip_size,
                    item.info.config.network_tx_gossip_period.ms,
                  ])
                "
              />
            </div>
            <span
              v-else
              class="row-text cell"
            >-</span>

            <BaseLink
              monospace
              :to="`/blocks/${item.status.block}`"
              class="cell"
            >
              {{ formatNumber(item.status.block) }}
            </BaseLink>

            <span class="row-text-monospace cell">{{ formatTimestamp(item.status.commit_time.ms) }}</span>
            <span class="row-text-monospace cell">{{ formatTimestamp(item.status.avg_commit_time.ms) }}</span>
            <span class="row-text-monospace cell">{{ formatNumber(item.status.queue_size) }}</span>
            <span class="row-text-monospace cell">{{ formatTimestamp(item.status.uptime.ms) }}</span>
          </div>
        </template>

        <template #mobile-card="{ item }">
          <div class="nodes-telemetry-page__list-mobile-card">
            <div
              v-if="item.info?.telemetry_unsupported"
              class="row-text"
            >
              <BaseLink :to="item.info.url">
                {{ item.info.url }}
              </BaseLink>
              - {{ $t('telemetry.peerDoesntProvideTelemetry') }}
            </div>
            <div v-else-if="item.info && item.status">
              <div class="nodes-telemetry-page__list-mobile-row">
                <span class="h-sm nodes-telemetry-page__list-mobile-row-label">{{ $t('telemetry.publicUrl') }}</span>
                <BaseHash
                  :hash="item.info.url"
                  :link="item.info.url"
                  copy
                  :type="hashType"
                />
              </div>

              <div class="nodes-telemetry-page__list-mobile-row">
                <span class="h-sm nodes-telemetry-page__list-mobile-row-label">{{
                  $t('telemetry.connectionStatus')
                }}</span>
                <span
                  class="row-text"
                  :class="[
                    item.info.connected
                      ? 'nodes-telemetry-page__list-mobile-row-connection-success'
                      : 'nodes-telemetry-page__list-mobile-row-connection-error',
                  ]"
                >{{ item.info.connected ? $t('telemetry.connected') : $t('telemetry.disconnected') }}</span>
              </div>

              <div class="nodes-telemetry-page__list-mobile-row">
                <span class="h-sm nodes-telemetry-page__list-mobile-row-label">{{ $t('telemetry.location') }}</span>
                <span
                  class="row-text"
                  :class="{ 'nodes-telemetry-page__list-mobile-row-value_empty': !item.info.location }"
                >{{ item.info.location?.country ?? 'Unknown' }}</span>
              </div>

              <div class="nodes-telemetry-page__list-mobile-row">
                <span class="h-sm nodes-telemetry-page__list-mobile-row-label">{{ $t('telemetry.publicKey') }}</span>
                <BaseHash
                  v-if="item.info.config"
                  :hash="item.info.config.public_key"
                  :type="hashType"
                  copy
                  class="row-text-monospace"
                />
                <span
                  v-else
                  class="row-text"
                >Unknown</span>
              </div>

              <div class="nodes-telemetry-page__list-mobile-row row-text">
                <span class="h-sm nodes-telemetry-page__list-mobile-row-label">{{
                  $t('telemetry.blocksGossiping')
                }}</span>
                <span v-if="item.info.config">{{
                  $t('telemetry.blocksGossipStats', [
                    item.info.config.network_block_gossip_size ?? 0,
                    item.info.config.network_block_gossip_period?.ms ?? 0,
                  ])
                }}</span>
                <span v-else>Unknown</span>
              </div>

              <div class="nodes-telemetry-page__list-mobile-row row-text">
                <span class="h-sm nodes-telemetry-page__list-mobile-row-label">{{
                  $t('telemetry.tnxsGossiping')
                }}</span>
                <span v-if="item.info.config">{{
                  $t('telemetry.blocksGossipStats', [
                    item.info.config.network_tx_gossip_size ?? 0,
                    item.info.config.network_tx_gossip_period?.ms ?? 0,
                  ])
                }}</span>
                <span v-else>Unknown</span>
              </div>

              <div class="nodes-telemetry-page__list-mobile-row">
                <span class="h-sm nodes-telemetry-page__list-mobile-row-label">{{ $t('telemetry.block') }}</span>
                <BaseLink
                  monospace
                  :to="`/blocks/${item.status.block}`"
                >
                  {{ formatNumber(item.status.block) }}
                </BaseLink>
              </div>

              <div class="nodes-telemetry-page__list-mobile-row">
                <span class="h-sm nodes-telemetry-page__list-mobile-row-label">{{ $t('telemetry.commitTime') }}</span>
                <span class="row-text-monospace">{{ item.status.commit_time.ms }}ms</span>
              </div>

              <div class="nodes-telemetry-page__list-mobile-row">
                <span class="h-sm nodes-telemetry-page__list-mobile-row-label">{{
                  $t('telemetry.avgCommitTime')
                }}</span>
                <span class="row-text-monospace">{{ item.status.avg_commit_time.ms }}ms</span>
              </div>

              <div class="nodes-telemetry-page__list-mobile-row">
                <span class="h-sm nodes-telemetry-page__list-mobile-row-label">{{ $t('telemetry.queue') }}</span>
                <span class="row-text-monospace">{{ formatNumber(item.status.queue_size) }}</span>
              </div>

              <div class="nodes-telemetry-page__list-mobile-row">
                <span class="h-sm nodes-telemetry-page__list-mobile-row-label">{{ $t('telemetry.uptime') }}</span>
                <span class="row-text-monospace">{{ formatTimestamp(item.status.uptime.ms) }}</span>
              </div>
            </div>
          </div>
        </template>
      </BaseTable>
    </BaseContentBlock>
  </div>
</template>

<style lang="scss">
@use '@/shared/ui/styles/main' as *;

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
        color: theme-color('content-primary');
        @include tpg-h2-mono();

        @include sm {
          @include tpg-h1-mono();
        }

        @include lg {
          @include tpg-d1-mono();
        }
      }
      &-last-block > div {
        display: flex;
      }

      &-label {
        text-align: center;
        color: theme-color('content-quaternary');
        @include tpg-s3();

        @include lg {
          @include tpg-s4();
        }
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
      @include xl {
        grid-template-columns:
          size(28) size(16) size(14) size(36) size(12) size(12) 1fr size(10) size(10) size(10)
          size(9);
      }
      @include xxl {
        grid-template-columns: size(28) size(16) 0.8fr size(36) size(12) size(12) 1fr size(16) size(24) size(10) size(9);
      }

      &-value_empty {
        font-style: italic;
        color: theme-color('content-quaternary');
      }

      &_unsupported {
        @include lg {
          grid-template-columns: 1fr;
        }
      }

      &-gossip {
        position: relative;

        &:hover .context-tooltip {
          display: flex;
          bottom: size(3.5);
          right: size(-2);
          height: size(6);
        }
      }

      &-connection-success {
        color: theme-color('success');
      }

      &-connection-error {
        color: theme-color('error');
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
        width: size(20);
        padding: size(1);
      }

      &-value_empty {
        font-style: italic;
        color: theme-color('content-quaternary');
      }

      &-connection-success {
        color: theme-color('success');
      }

      &-connection-error {
        color: theme-color('error');
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
