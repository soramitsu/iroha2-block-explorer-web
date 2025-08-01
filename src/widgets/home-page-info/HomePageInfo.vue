<template>
  <div class="home-page-info">
    <div class="home-page-info__search">
      <SearchField
        size="lg"
        :placeholder="$t('homePage.searchPlaceholder')"
        large
      />
    </div>

    <BaseLoading
      v-if="isMetricsLoading"
      class="home-page-info_loading"
    />

    <div
      v-if="!isMetricsLoading"
      class="home-page-info__grid"
    >
      <div
        v-for="(item, i) in firstSection"
        :key="i"
        class="home-page-info__item"
      >
        <span class="home-page-info__item-value">
          {{ item.value }}
        </span>

        <span class="home-page-info__item-label">
          {{ $t(item.i18nKey) }}
        </span>
      </div>
    </div>

    <div
      v-if="!isMetricsLoading"
      class="home-page-info__grid"
    >
      <div
        v-for="(item, i) in secondSection"
        :key="i"
        class="home-page-info__item"
      >
        <span class="home-page-info__item-value">
          {{ item.value }}
        </span>

        <span class="home-page-info__item-label">
          {{ $t(item.i18nKey) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { SearchField } from '@/features/search';
import { computed, ref, watch } from 'vue';
import BaseLoading from '@/shared/ui/components/BaseLoading.vue';
import type { NetworkMetrics } from '@/shared/api/schemas';
import { streamTelemetryMetrics } from '@/shared/api';

const firstSection = computed(() => {
  return [
    { value: metrics.value?.accounts ?? 0, i18nKey: 'homePage.totalAccounts' },
    { value: metrics.value?.assets ?? 0, i18nKey: 'homePage.totalAssets' },
    { value: metrics.value?.domains ?? 0, i18nKey: 'homePage.totalDomains' },
  ];
});

const secondSection = computed(() => {
  return [
    { value: metrics.value?.block ?? 0, i18nKey: 'homePage.totalBlocks' },
    {
      value: metrics.value ? metrics.value.transactions_accepted + metrics.value.transactions_rejected : 0,
      i18nKey: 'homePage.totalTransactions',
    },
    { value: metrics.value ? metrics.value.peers : 1, i18nKey: 'homePage.totalNodes' },
  ];
});

const metrics = ref<NetworkMetrics | null>(null);

const { data: streamedMetrics, status: streamStatus } = streamTelemetryMetrics();
const isMetricsLoading = computed(() => streamStatus.value === 'CONNECTING');

watch(
  () => streamedMetrics.value,
  () => {
    if (!streamedMetrics.value) return;

    switch (streamedMetrics.value.kind) {
      case 'first': {
        metrics.value = streamedMetrics.value.network_status;
        break;
      }
      case 'network_status': {
        metrics.value = streamedMetrics.value;
        break;
      }
    }
  }
);
</script>

<style lang="scss">
@use '@/shared/ui/styles/main' as *;

.home-page-info {
  height: 160px;
  background: theme-color('surface-variant');
  width: 100%;
  display: grid;
  justify-items: center;
  margin-top: 0;
  z-index: 1;

  @include xs {
    margin-top: size(3);
    margin-top: size(0); // #SEARCH: remove when functionality is ready
  }

  @include sm {
    height: 210px;
  }

  @include md {
    margin-top: size(10);
    margin-top: size(4); // #SEARCH: remove when functionality is ready
  }

  &_loading {
    margin-top: 60px;

    @include sm {
      margin-top: 85px;
    }
  }

  &__search {
    display: none; // #SEARCH: remove when functionality is ready

    position: relative;
    margin-top: size(-3);
    width: 100%;
    padding: 0 size(2);

    @include xs {
      margin-top: size(-4);
    }

    @include md {
      margin-top: size(-5.5);
      padding: 0 size(9);
      width: $home-content-width-tablet;
    }

    @include lg {
      padding: 0 size(12);
      width: $home-content-width;
    }
  }

  &__grid {
    display: flex;
    justify-content: center;
    width: 100%;
    padding: size(2) 0 size(1) 0;

    @include md {
      padding: size(2) 0;
    }
  }

  &__item {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 33%;

    &-value {
      @include tpg-h2;
      color: theme-color('content-on-surface-variant');
      height: size(3.5);

      @include xs {
        height: size(4);
        @include tpg-h2;
      }
      @include sm {
        @include tpg-h1;
        height: size(5.5);
      }
      @include md {
        @include tpg-d2;
      }
      @include lg {
        height: size(7);
        @include tpg-d1;
      }
    }

    @include md {
      width: 25%;
    }
    @include xl {
      width: 20%;
    }
    @include xxl {
      width: 18%;
    }

    &-label {
      @include tpg-s5;
      color: theme-color('content-quaternary');
      text-align: center;

      @include xs {
        @include tpg-s4;
      }
    }
  }
}
</style>
