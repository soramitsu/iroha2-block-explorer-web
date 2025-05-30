<script setup lang="ts">
import { useRouter } from 'vue-router';
import { computed, reactive, ref, watch } from 'vue';
import * as http from '@/shared/api';
import BaseContentBlock from '@/shared/ui/components/BaseContentBlock.vue';
import DataField from '@/shared/ui/components/DataField.vue';
import BaseTable from '@/shared/ui/components/BaseTable.vue';
import BaseHash from '@/shared/ui/components/BaseHash.vue';
import BaseLoading from '@/shared/ui/components/BaseLoading.vue';
import type { AccountId, AssetDefinitionId, NftId } from '@iroha/core/data-model';
import { parseMetadata } from '@/shared/ui/utils/json';
import BaseLink from '@/shared/ui/components/BaseLink.vue';
import { useParamScope } from '@vue-kakuyaku/core';
import { setupAsyncData } from '@/shared/utils/setup-async-data';
import invariant from 'tiny-invariant';
import type { TabAssets } from '@/features/filter/assets/model';
import { ASSETS_OPTIONS } from '@/features/filter/assets/model';
import { useI18n } from 'vue-i18n';
import BaseTabs from '@/shared/ui/components/BaseTabs.vue';
import { useAdaptiveHash } from '@/shared/ui/composables/useAdaptiveHash';
import { SUCCESSFUL_FETCHING_STATUS } from '@/shared/api/consts';

const { t } = useI18n();
const router = useRouter();

const accountHashType = useAdaptiveHash({ xs: 'short', xxs: 'short' }, 'medium');
const domainAccountsHashType = useAdaptiveHash({ sm: 'short', xs: 'two-line', xxs: 'two-line' }, 'medium');

const domainId = computed(() => {
  const id = router.currentRoute.value.params['id'];

  invariant(typeof id === 'string', 'Expected string');

  return id;
});

const domainScope = useParamScope(domainId, (value) => setupAsyncData(() => http.fetchDomain(value)));

const isDomainLoading = computed(() => domainScope.value.expose.isLoading);
const domain = computed(() =>
  domainScope.value?.expose.data?.status === SUCCESSFUL_FETCHING_STATUS ? domainScope.value.expose.data.data : undefined
);
const domainAssets = computed(() => domain.value?.assets ?? 0);
const domainNFTs = computed(() => domain.value?.nfts ?? 0);
const domainAccounts = computed(() => domain.value?.accounts ?? 0);

const assetsTab = ref<TabAssets>('assets');
const isCryptoAssetsSelected = computed(() => assetsTab.value === 'assets');

const assetsListState = reactive({
  page: 1,
  per_page: 10,
  domain: domainId.value,
});

watch([() => assetsListState.per_page, () => assetsTab.value], () => {
  assetsListState.page = 1;
});

const assetsListScope = useParamScope(
  () => {
    if (!isCryptoAssetsSelected.value || !domainAssets.value) return null;

    return {
      key: JSON.stringify(assetsListState),
      payload: assetsListState,
    };
  },
  ({ payload }) => setupAsyncData(() => http.fetchAssetDefinitions(payload))
);

const isAssetsListLoading = computed(() => !!assetsListScope.value?.expose.isLoading);
const assets = computed(() =>
  assetsListScope.value?.expose.data?.status === SUCCESSFUL_FETCHING_STATUS
    ? assetsListScope.value.expose.data.data.items
    : []
);

const NFTsListScope = useParamScope(
  () => {
    if (isCryptoAssetsSelected.value || !domainNFTs.value) return null;

    return {
      key: JSON.stringify(assetsListState),
      payload: assetsListState,
    };
  },
  ({ payload }) => setupAsyncData(() => http.fetchNFTs(payload))
);

const isNFTsListLoading = computed(() => !!NFTsListScope.value?.expose.isLoading);
const NFTs = computed(() =>
  NFTsListScope.value?.expose.data?.status === SUCCESSFUL_FETCHING_STATUS
    ? NFTsListScope.value.expose.data.data.items
    : []
);

const accountsListState = reactive({
  page: 1,
  per_page: 10,
  domain: domainId.value,
});

watch(
  () => accountsListState.per_page,
  () => {
    accountsListState.page = 1;
  }
);

const accountsListScope = useParamScope(
  () => {
    if (!domainAccounts.value) return null;

    return {
      key: JSON.stringify(accountsListState),
      payload: accountsListState,
    };
  },
  ({ payload }) => setupAsyncData(() => http.fetchAccounts(payload))
);

const isAccountsListLoading = computed(() => !!accountsListScope.value?.expose.isLoading);
const accounts = computed(() =>
  accountsListScope.value?.expose.data?.status === SUCCESSFUL_FETCHING_STATUS
    ? accountsListScope.value.expose.data.data.items
    : []
);

function handleAssetRowClick(id: AssetDefinitionId) {
  router.push(`/assets/${encodeURIComponent(id.toString())}`);
}

function handleNFTRowClick(id: NftId) {
  router.push(`/nfts/${encodeURIComponent(id.toString())}`);
}

function handleAccountRowClick(id: AccountId) {
  router.push(`/accounts/${id}`);
}

const domainAssetsSection = computed(() => {
  if (isCryptoAssetsSelected.value)
    return {
      title: t('domains.domainAssets'),
      isZero: !domainAssets.value,
      zeroTitle: t('domains.domainDoesntHaveAnyAssets'),
    };

  return {
    title: t('domains.domainNFTs'),
    isZero: !domainNFTs.value,
    zeroTitle: t('domains.domainDoesntHaveAnyNFTs'),
  };
});
</script>

<template>
  <div class="domain-details">
    <div class="domain-details__native">
      <BaseContentBlock
        :title="$t('domain')"
        class="domain-details__native-information"
      >
        <template #default>
          <div
            v-if="isDomainLoading"
            class="domain-details__native-information_loading"
          >
            <BaseLoading />
          </div>
          <div v-else-if="domain">
            <div class="domain-details__native-information-row">
              <DataField
                :title="$t('domains.domainId')"
                :hash="domainId"
              />

              <DataField
                :title="$t('domains.ownedBy')"
                :hash="domain.owned_by.toString()"
                copy
                :link="`/accounts/${domain.owned_by}`"
                :type="accountHashType"
              />

              <DataField
                :title="$t('metadata')"
                :value="parseMetadata(domain.metadata)"
                :metadata="{ display: 'short' }"
              />
            </div>
          </div>
        </template>
      </BaseContentBlock>

      <BaseContentBlock
        :title="domainAssetsSection.title"
        class="domain-details__native-assets"
      >
        <template #header-action>
          <BaseTabs
            v-model="assetsTab"
            :items="ASSETS_OPTIONS"
          />
        </template>
        <template #default>
          <span
            v-if="domainAssetsSection.isZero"
            class="domain-details__native-assets_empty row-text"
          >
            {{ domainAssetsSection.zeroTitle }}
          </span>
          <BaseTable
            v-else-if="isCryptoAssetsSelected"
            v-model:page="assetsListState.page"
            v-model:page-size="assetsListState.per_page"
            :loading="isAssetsListLoading"
            :total="domainAssets"
            :items="assets"
            container-class="domain-details__native-assets-list"
            :breakpoint="960"
            row-pointer
            @click:row="(asset) => handleAssetRowClick(asset.id)"
          >
            <template #header>
              <div class="domain-details__native-assets-list-row">
                <span class="h-sm">{{ $t('name') }}</span>
                <span class="h-sm">{{ $t('mintable') }}</span>
              </div>
            </template>

            <template #row="{ item }">
              <div class="domain-details__native-assets-list-row">
                <span class="row-text">{{ item.id.name.value }}</span>
                <span class="row-text">{{ item.mintable }}</span>
              </div>
            </template>

            <template #mobile-card="{ item }">
              <div class="domain-details__native-assets-mobile-list-row">
                <div class="domain-details__native-assets-mobile-list-row-data row-text">
                  <span class="h-sm">{{ $t('name') }}</span>
                  <BaseLink :to="`/assets/${encodeURIComponent(item.id.toString())}`">
                    {{ item.id.name.value }}
                  </BaseLink>
                </div>

                <div class="domain-details__native-assets-mobile-list-row-data row-text">
                  <span class="h-sm">{{ $t('mintable') }}</span>
                  <span>{{ item.mintable }}</span>
                </div>
              </div>
            </template>
          </BaseTable>
          <BaseTable
            v-else
            v-model:page="assetsListState.page"
            v-model:page-size="assetsListState.per_page"
            :loading="isNFTsListLoading"
            :total="domainNFTs"
            :items="NFTs"
            container-class="domain-details__native-assets-list"
            :breakpoint="960"
            row-pointer
            @click:row="(asset) => handleNFTRowClick(asset.id)"
          >
            <template #header>
              <div class="domain-details__native-nfts-list-row">
                <span class="h-sm">{{ $t('name') }}</span>
              </div>
            </template>

            <template #row="{ item }">
              <div class="domain-details__native-nfts-list-row">
                <span class="row-text">{{ item.id.name.value }}</span>
              </div>
            </template>

            <template #mobile-card="{ item }">
              <div class="domain-details__native-nfts-mobile-list-row">
                <div class="domain-details__native-nfts-mobile-list-row-data row-text">
                  <span class="h-sm">{{ $t('name') }}</span>
                  <BaseLink :to="`/nfts/${encodeURIComponent(item.id.toString())}`">
                    {{ item.id.name.value }}
                  </BaseLink>
                </div>
              </div>
            </template>
          </BaseTable>
        </template>
      </BaseContentBlock>
    </div>

    <div class="domain-details__accounts">
      <BaseContentBlock :title="$t('domains.domainAccounts')">
        <template #default>
          <span
            v-if="!domainAccounts"
            class="domain-details__accounts_empty row-text"
          >
            {{ $t('domains.domainDoesntHaveAnyAccounts') }}
          </span>
          <BaseTable
            v-else
            v-model:page="accountsListState.page"
            v-model:page-size="accountsListState.per_page"
            :loading="isAccountsListLoading"
            :total="domainAccounts"
            :items="accounts"
            container-class="domain-details__accounts-container"
            :breakpoint="960"
            row-pointer
            @click:row="(account) => handleAccountRowClick(account.id)"
          >
            <template #header>
              <div class="domain-details__accounts-row">
                <span class="h-sm">{{ $t('accounts.accountId') }}</span>
              </div>
            </template>

            <template #row="{ item }">
              <div class="domain-details__accounts-row">
                <BaseHash
                  :hash="item.id.toString()"
                  :link="`/accounts/${item.id}`"
                  :type="domainAccountsHashType"
                  copy
                />
              </div>
            </template>

            <template #mobile-card="{ item }">
              <div class="domain-details__accounts-mobile-card">
                <div class="domain-details__accounts-mobile-row">
                  <span class="h-sm domain-details__accounts-mobile-label">{{ $t('accounts.accountId') }}</span>
                  <BaseHash
                    :hash="item.id.toString()"
                    :link="`/accounts/${item.id}`"
                    :type="domainAccountsHashType"
                    copy
                  />
                </div>
              </div>
            </template>
          </BaseTable>
        </template>
      </BaseContentBlock>
    </div>
  </div>
</template>

<style lang="scss">
@use '@/shared/ui/styles/main' as *;

.domain-details {
  display: flex;

  @include xxs {
    gap: size(2);
    padding: 0 size(3);
    flex-direction: column;
  }

  @include lg {
    flex-direction: row;
  }

  &__native {
    display: flex;
    flex-direction: column;

    @include xxs {
      width: 85vw;
    }

    @include lg {
      width: 60%;
    }

    @include xl {
      width: calc(size(45) + 20vw);
    }
    @include xxl {
      width: calc(size(70) + 10vw);
    }
    &-information {
      margin-bottom: size(2);

      &_loading {
        margin-top: size(1);
        display: flex;
        justify-content: center;
        align-items: center;
      }

      &-row {
        margin-top: size(2);
        padding: 0 size(2) 0 size(4);

        display: flex;
        flex-direction: column;
        gap: size(2);
      }
    }

    &-assets {
      .base-content-block__body:has(.domain-details__native-assets_empty) {
        padding: size(0) size(4) size(4);
      }

      .base-table > .content-row {
        display: flex;
      }

      .content-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        padding: 0 size(4);
      }

      hr {
        display: none;
      }
    }

    &-assets-list,
    &-nfts-list {
      display: grid;

      @include sm {
        .base-table__mobile-card:nth-last-child(2) {
          border-bottom: 1px solid theme-color('border-primary');
        }
      }

      @include xxs {
        grid-template-columns: 1fr;
      }

      @include sm {
        grid-template-columns: 1fr 1fr;
      }

      @include md {
        grid-template-columns: 1fr;
      }

      &-row {
        display: grid;

        @include md {
          grid-template-columns: size(35) size(20);
        }
      }
    }

    &-nfts-list {
      grid-template-columns: 1fr;
    }

    &-assets-mobile-list,
    &-nfts-mobile-list {
      &-row {
        display: flex;
        flex-direction: column;
        padding: size(2) size(4);
        @include xxs {
          width: 100%;
        }
        @include sm {
          width: 45vw;
        }

        &-data {
          display: flex;
          align-items: center;
          margin-top: size(2);

          span:first-child {
            width: size(10);
          }
        }
      }
    }
  }

  &__accounts {
    .base-content-block__body:has(.domain-details__accounts_empty) {
      padding: size(0) size(4) size(4);
    }

    hr {
      display: none;
    }

    @include xxs {
      width: 85vw;
    }

    @include lg {
      width: 60%;
    }
    @include xl {
      width: calc(size(45) + 20vw);
    }
    @include xxl {
      width: calc(size(60) + 10vw);
    }

    .content-row {
      padding: 0 size(4);
    }

    &-row {
      width: 100%;
    }

    &-mobile-card {
      padding: size(2) size(4);
    }

    &-mobile-row {
      display: flex;
      align-items: center;

      .base-hash {
        word-break: break-all;
      }
    }

    &-mobile-label {
      width: size(12);
    }
  }
}
</style>
