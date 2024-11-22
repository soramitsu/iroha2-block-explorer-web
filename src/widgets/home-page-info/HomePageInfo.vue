<template>
  <div class="home-page-info">
    <div class="home-page-info__search">
      <SearchField
        size="lg"
        :placeholder="$t('homePage.searchPlaceholder')"
        large
      />
    </div>

    <div class="home-page-info__grid">
      <div
        v-for="(item, i) in firstSection"
        :key="i"
        class="home-page-info__item"
      >
        <BaseLoading
          v-if="isLoading"
          class="home-page-info__item-loading"
        />

        <span
          v-else
          class="home-page-info__item-value"
        >
          {{ item.value }}
        </span>

        <span class="home-page-info__item-label">
          {{ $t(item.i18nKey) }}
        </span>
      </div>
    </div>

    <div class="home-page-info__grid">
      <div
        v-for="(item, i) in secondSection"
        :key="i"
        class="home-page-info__item"
      >
        <BaseLoading
          v-if="isLoading"
          class="home-page-info__item-loading"
        />

        <span
          v-else
          class="home-page-info__item-value"
        >
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
import { computed } from 'vue';
import * as http from '@/shared/api';
import BaseLoading from '@/shared/ui/components/BaseLoading.vue';
import { setupAsyncData } from '@/shared/utils/setup-async-data';

const firstSection = computed(() => {
  return [
    { value: data?.accounts ?? 0, i18nKey: 'homePage.totalAccounts' },
    { value: data?.assets ?? 0, i18nKey: 'homePage.totalAssets' },
    { value: data?.domains ?? 0, i18nKey: 'homePage.totalDomains' },
  ];
});

const secondSection = computed(() => {
  return [
    { value: data?.blocks ?? 0, i18nKey: 'homePage.totalBlocks' },
    { value: data?.transactions ?? 0, i18nKey: 'homePage.totalTransactions' },
    { value: data?.nodes ?? 1, i18nKey: 'homePage.totalNodes' },
  ];
});

const { isLoading, data } = setupAsyncData(async () => {
  const [assets, accounts, domains, { peers, blocks, txs_accepted, txs_rejected }] = await Promise.all([
    http.fetchAssets(),
    http.fetchAccounts(),
    http.fetchDomains(),
    http.fetchPeerStatus(),
  ]);

  return {
    assets: assets.pagination.total_items,
    accounts: accounts.pagination.total_items,
    domains: domains.pagination.total_items,
    nodes: peers + 1,
    transactions: txs_accepted + txs_rejected,
    blocks,
  };
});
</script>

<style lang="scss">
@import '@/shared/ui/styles/main';

.home-page-info {
  background: theme-color('surface-variant');
  width: 100%;
  height: auto;
  display: grid;
  justify-items: center;
  margin-top: 0;
  z-index: 1;

  @include xs {
    margin-top: size(3);
    margin-top: size(0); // #SEARCH: remove when functionality is ready
  }

  @include md {
    margin-top: size(10);
    margin-top: size(4); // #SEARCH: remove when functionality is ready
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
    gap: size(4);

    @include xs {
      gap: size(8);
    }

    @include sm {
      gap: size(12);
    }

    @include md {
      width: $home-content-width-tablet;
      padding: size(2) 0;
    }

    @include lg {
      width: $home-content-width;
    }
  }

  &__item {
    display: flex;
    flex-direction: column;
    align-items: center;

    &-loading {
      margin-bottom: size(1);
    }

    &-value {
      @include tpg-h3;
      color: theme-color('content-on-surface-variant');

      @include xs {
        @include tpg-h1;
      }

      @include md {
        @include tpg-d2;
      }

      @include lg {
        @include tpg-d1;
      }
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
