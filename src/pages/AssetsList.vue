<script setup lang="ts">
import * as http from '@/shared/api';
import BaseLink from '@/shared/ui/components/BaseLink.vue';
import BaseTable from '@/shared/ui/components/BaseTable.vue';
import BaseContentBlock from '@/shared/ui/components/BaseContentBlock.vue';
import { computed, reactive, ref, watch } from 'vue';
import { useParamScope } from '@vue-kakuyaku/core';
import { setupAsyncData } from '@/shared/utils/setup-async-data';
import BaseTabs from '@/shared/ui/components/BaseTabs.vue';
import type { TabAssets } from '@/features/filter/assets/model';
import { ASSETS_OPTIONS } from '@/features/filter/assets/model';
import { useI18n } from 'vue-i18n';
import BaseHash from '@/shared/ui/components/BaseHash.vue';
import { useRouter } from 'vue-router';
import { useAdaptiveHash } from '@/shared/ui/composables/useAdaptiveHash';

const { t } = useI18n();
const router = useRouter();

const hashType = useAdaptiveHash(
  {
    md: 'short',
    sm: 'medium',
    xxs: 'two-line',
    xs: 'two-line',
  },
  'full'
);

const listState = reactive({
  page: 1,
  per_page: 10,
});

const isCryptoAssetsSelected = computed(() => router.currentRoute.value.name === 'assets-list');
const assetsTab = ref<TabAssets>(isCryptoAssetsSelected.value ? 'assets' : 'nft');

watch(assetsTab, () => {
  if (assetsTab.value === 'nft') router.push('/nfts-list');
  else router.push('/assets-list');
});

const tableTitle = computed(() => {
  if (isCryptoAssetsSelected.value) return t('assets.assets');

  return t('assets.nfts');
});

const assetsScope = useParamScope(
  () => {
    if (!isCryptoAssetsSelected.value) return null;

    return {
      key: JSON.stringify(listState),
      payload: listState,
    };
  },
  ({ payload }) => setupAsyncData(() => http.fetchAssetDefinitions(payload))
);

const isAssetsLoading = computed(() => !!assetsScope.value?.expose.isLoading);
const totalAssets = computed(() => assetsScope.value?.expose.data?.pagination?.total_items ?? 0);
const assets = computed(() => assetsScope.value?.expose.data?.items ?? []);

const NFTsScope = useParamScope(
  () => {
    if (isCryptoAssetsSelected.value) return null;

    return {
      key: JSON.stringify(listState),
      payload: listState,
    };
  },
  ({ payload }) => setupAsyncData(() => http.fetchNFTs(payload))
);

const isNFTsLoading = computed(() => !!NFTsScope.value?.expose.isLoading);
const totalNFTs = computed(() => NFTsScope.value?.expose.data?.pagination?.total_items ?? 0);
const NFTs = computed(() => NFTsScope.value?.expose.data?.items ?? []);

watch([() => listState.per_page, () => assetsTab.value], () => {
  listState.page = 1;
});
</script>

<template>
  <BaseContentBlock
    :title="tableTitle"
    class="assets-list-page"
  >
    <template #header-action>
      <BaseTabs
        v-model="assetsTab"
        :items="ASSETS_OPTIONS"
      />
    </template>
    <BaseTable
      v-if="isCryptoAssetsSelected"
      v-model:page="listState.page"
      v-model:page-size="listState.per_page"
      :loading="isAssetsLoading"
      :total="totalAssets"
      :items="assets"
      container-class="assets-list-page__container"
    >
      <template #header>
        <div class="assets-list-page__row">
          <span class="h-sm cell">{{ $t('name') }}</span>
          <span class="h-sm cell">{{ $t('domain') }}</span>
          <span class="h-sm cell">{{ $t('mintable') }}</span>
        </div>
      </template>

      <template #row="{ item }">
        <div class="assets-list-page__row">
          <BaseLink
            :to="`/asset-details/${encodeURIComponent(item.id.toString())}`"
            class="cell"
          >
            {{ item.id.name.value }}
          </BaseLink>

          <BaseLink
            :to="`/domains/${item.id.domain.value}`"
            class="cell"
          >
            {{ item.id.domain.value }}
          </BaseLink>

          <div class="cell row-text">
            {{ item.mintable }}
          </div>
        </div>
      </template>

      <template #mobile-card="{ item }">
        <div class="assets-list-page__mobile-card">
          <div class="assets-list-page__mobile-row">
            <span class="h-sm assets-list-page__mobile-label">{{ $t('name') }}</span>

            <BaseLink :to="`/asset-details/${encodeURIComponent(item.id.toString())}`">
              {{ item.id.name.value }}
            </BaseLink>
          </div>

          <div class="assets-list-page__mobile-row">
            <span class="h-sm assets-list-page__mobile-label">{{ $t('domain') }}</span>

            <BaseLink :to="`/domains/${item.id.domain.value}`">
              {{ item.id.domain.value }}
            </BaseLink>
          </div>

          <div class="assets-list-page__mobile-row">
            <span class="h-sm assets-list-page__mobile-label">{{ $t('mintable') }}</span>
            <span class="row-text">{{ item.mintable }}</span>
          </div>
        </div>
      </template>
    </BaseTable>
    <BaseTable
      v-else
      v-model:page="listState.page"
      v-model:page-size="listState.per_page"
      :loading="isNFTsLoading"
      :total="totalNFTs"
      :items="NFTs"
      container-class="nfts-list-page__container"
    >
      <template #header>
        <div class="nfts-list-page__row">
          <span class="h-sm cell">{{ $t('name') }}</span>
          <span class="h-sm cell">{{ $t('assets.ownedBy') }}</span>
        </div>
      </template>

      <template #row="{ item }">
        <div class="nfts-list-page__row">
          <BaseLink
            :to="`/nft-details/${encodeURIComponent(item.id.toString())}`"
            class="cell"
          >
            {{ item.id.toString() }}
          </BaseLink>

          <BaseHash
            :hash="item.owned_by.toString()"
            :link="`/accounts/${item.owned_by}`"
            :type="hashType"
            class="cell"
            copy
          />
        </div>
      </template>

      <template #mobile-card="{ item }">
        <div class="nfts-list-page__mobile-card">
          <div class="nfts-list-page__mobile-row">
            <span class="h-sm nfts-list-page__mobile-label">{{ $t('name') }}</span>

            <BaseLink :to="`/nft-details/${encodeURIComponent(item.id.toString())}`">
              {{ item.id.toString() }}
            </BaseLink>
          </div>

          <div class="nfts-list-page__mobile-row">
            <span class="h-sm nfts-list-page__mobile-label">{{ $t('assets.ownedBy') }}</span>

            <BaseHash
              :hash="item.owned_by.toString()"
              :link="`/accounts/${item.owned_by}`"
              :type="hashType"
              copy
            />
          </div>
        </div>
      </template>
    </BaseTable>
  </BaseContentBlock>
</template>

<style lang="scss">
@import '@/shared/ui/styles/main';

.assets-list-page,
.nfts-list-page {
  &__row {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    justify-content: start;
  }

  &__mobile-card {
    padding: size(2) size(3);
  }

  &__mobile-row {
    display: flex;
    align-items: center;
  }

  &__mobile-label {
    text-align: left;
    width: size(12);
    padding: size(1);
    margin-right: size(3);
  }

  &__container {
    display: grid;
    grid-template-columns: 1fr;

    @include md {
      grid-template-columns: 1fr 1fr;
    }

    @include lg {
      grid-template-columns: 1fr;
    }
  }

  hr {
    display: none;
  }
}

.nfts-list-page__row {
  grid-template-columns: 0.25fr 1fr;
}
</style>
