<script setup lang="ts">
import { useRouter } from 'vue-router';
import { computed, reactive, ref, watch } from 'vue';
import * as http from '@/shared/api';
import BaseContentBlock from '@/shared/ui/components/BaseContentBlock.vue';
import DataField from '@/shared/ui/components/DataField.vue';
import BaseTable from '@/shared/ui/components/BaseTable.vue';
import BaseLoading from '@/shared/ui/components/BaseLoading.vue';
import { AccountIdSchema } from '@/shared/api/schemas';
import { parseMetadata } from '@/shared/ui/utils/json';
import BaseTabs from '@/shared/ui/components/BaseTabs.vue';
import type { TabAccountTransactions } from '@/features/filter/transactions/model';
import { ACCOUNT_TRANSACTIONS_OPTIONS } from '@/features/filter/transactions/model';
import TransactionsTable from '@/shared/ui/components/TransactionsTable.vue';
import type { AssetId, NftId } from '@iroha/core/data-model';
import InstructionsTable from '@/shared/ui/components/InstructionsTable.vue';
import BaseLink from '@/shared/ui/components/BaseLink.vue';
import { useParamScope } from '@vue-kakuyaku/core';
import { setupAsyncData } from '@/shared/utils/setup-async-data';
import type { TabAssets } from '@/features/filter/assets/model';
import { ASSETS_OPTIONS } from '@/features/filter/assets/model';
import { useI18n } from 'vue-i18n';
import { useAdaptiveHash } from '@/shared/ui/composables/useAdaptiveHash';

const { t } = useI18n();
const router = useRouter();

const hashType = useAdaptiveHash({ xs: 'short', xxs: 'short' }, 'medium');

const accountId = computed(() => {
  const id = router.currentRoute.value.params['id'];

  return AccountIdSchema.parse(id);
});

const accountScope = useParamScope(
  () => {
    return {
      key: accountId.value.toString(),
      payload: accountId.value,
    };
  },
  ({ payload }) => setupAsyncData(() => http.fetchAccount(payload))
);

const isAccountLoading = computed(() => accountScope.value.expose.isLoading);
const account = computed(() => accountScope.value?.expose.data);

const domainsListState = reactive({
  page: 1,
  per_page: 10,
  owned_by: computed(() => accountId.value),
});

watch(
  () => domainsListState.per_page,
  () => {
    domainsListState.page = 1;
  }
);

const domainsScope = useParamScope(
  () => {
    if (!account.value?.owned_domains) return null;

    return {
      key: JSON.stringify(domainsListState),
      payload: domainsListState,
    };
  },
  ({ payload }) => setupAsyncData(() => http.fetchDomains(payload))
);

const isDomainsLoading = computed(() => !!domainsScope.value?.expose.isLoading);
const totalDomains = computed(() => domainsScope.value?.expose?.data?.pagination?.total_items ?? 0);
const domains = computed(() => domainsScope.value?.expose?.data?.items ?? []);

const assetsTab = ref<TabAssets>('assets');
const isCryptoAssetsSelected = computed(() => assetsTab.value === 'assets');

const assetsListState = reactive({
  page: 1,
  per_page: 10,
  owned_by: computed(() => accountId.value),
});

watch([() => assetsListState.per_page, () => assetsTab.value], () => {
  assetsListState.page = 1;
});

const assetsScope = useParamScope(
  () => {
    if (!isCryptoAssetsSelected.value || !account.value?.owned_assets) return null;

    return {
      key: JSON.stringify(assetsListState),
      payload: assetsListState,
    };
  },
  ({ payload }) => setupAsyncData(() => http.fetchAssets(payload))
);

const isAssetsLoading = computed(() => !!assetsScope.value?.expose.isLoading);
const totalAssets = computed(() => assetsScope.value?.expose.data?.pagination?.total_items ?? 0);
const assets = computed(() => assetsScope.value?.expose.data?.items ?? []);

const nftsScope = useParamScope(
  () => {
    if (isCryptoAssetsSelected.value || !account.value?.owned_nfts) return null;

    return {
      key: JSON.stringify(assetsListState),
      payload: assetsListState,
    };
  },
  ({ payload }) => setupAsyncData(() => http.fetchNFTs(payload))
);

const isNFTsLoading = computed(() => !!nftsScope.value?.expose.isLoading);
const totalNFTs = computed(() => nftsScope.value?.expose.data?.pagination?.total_items ?? 0);
const nfts = computed(() => nftsScope.value?.expose.data?.items ?? []);

const transactionsTab = ref<TabAccountTransactions>('transactions');
const shouldShowInstructions = computed(() => transactionsTab.value === 'instructions');

function handleAssetRowClick(id: AssetId) {
  router.push(`/assets/${encodeURIComponent(id.definition.toString())}`);
}

function handleNFTRowClick(id: NftId) {
  router.push(`/nfts/${encodeURIComponent(id.toString())}`);
}

function handleDomainRowClick(id: string) {
  router.push(`/domains/${id}`);
}

const assetsSection = computed(() => {
  if (isCryptoAssetsSelected.value)
    return {
      title: t('accounts.accountAssets'),
      isZero: !account.value?.owned_assets,
      zeroTitle: t('accounts.accountDoesntHaveAnyAssets'),
    };

  return {
    title: t('accounts.accountNFTs'),
    isZero: !account.value?.owned_nfts,
    zeroTitle: t('accounts.accountDoesntHaveAnyNFTs'),
  };
});
</script>

<template>
  <div class="account-details">
    <div class="account-details__personal">
      <BaseContentBlock
        :title="$t('accounts.accountInformation')"
        class="account-details__personal-information"
      >
        <template #default>
          <div
            v-if="isAccountLoading"
            class="account-details__personal-information_loading"
          >
            <BaseLoading />
          </div>
          <div v-else-if="account">
            <div class="account-details__personal-information-row">
              <DataField
                :title="$t('accounts.accountId')"
                :hash="accountId.toString()"
                copy
                :type="hashType"
              />

              <DataField
                :title="$t('metadata')"
                :metadata="{ display: 'short' }"
                :value="parseMetadata(account.metadata)"
              />
            </div>
          </div>
        </template>
      </BaseContentBlock>

      <BaseContentBlock
        :title="assetsSection.title"
        class="account-details__personal-owned"
      >
        <template #header-action>
          <BaseTabs
            v-model="assetsTab"
            :items="ASSETS_OPTIONS"
          />
        </template>
        <template #default>
          <span
            v-if="assetsSection.isZero"
            class="account-details__personal-owned_empty row-text"
          >{{
            assetsSection.zeroTitle
          }}</span>
          <BaseTable
            v-else-if="isCryptoAssetsSelected"
            v-model:page="assetsListState.page"
            v-model:page-size="assetsListState.per_page"
            :loading="isAssetsLoading"
            :total="totalAssets"
            :items="assets"
            container-class="account-details__personal-owned-list"
            :breakpoint="960"
            row-pointer
            @click:row="(asset) => handleAssetRowClick(asset.id)"
          >
            <template #header>
              <div class="account-details__personal-owned-list-row">
                <span class="h-sm">{{ $t('name') }}</span>
                <span class="h-sm">{{ $t('value') }}</span>
              </div>
            </template>

            <template #row="{ item }">
              <div class="account-details__personal-owned-list-row">
                <span class="row-text">{{ item.id.definition.name.value }}</span>
                <span class="row-text">{{ item.value }}</span>
              </div>
            </template>

            <template #mobile-card="{ item }">
              <div class="account-details__personal-owned-mobile-list-row">
                <div class="account-details__personal-owned-mobile-list-row-data row-text">
                  <span class="h-sm">{{ $t('name') }}</span>
                  <BaseLink :to="`/assets/${encodeURIComponent(item.id.definition.toString())}`">
                    {{ item.id.definition.name.value }}
                  </BaseLink>
                </div>

                <div class="account-details__personal-owned-mobile-list-row-data row-text">
                  <span class="h-sm">{{ $t('value') }}</span>
                  <span>{{ item.value }}</span>
                </div>
              </div>
            </template>
          </BaseTable>
          <BaseTable
            v-else
            v-model:page="assetsListState.page"
            v-model:page-size="assetsListState.per_page"
            :loading="isNFTsLoading"
            :total="totalNFTs"
            :items="nfts"
            container-class="account-details__personal-owned-nft-list"
            :breakpoint="960"
            row-pointer
            @click:row="(asset) => handleNFTRowClick(asset.id)"
          >
            <template #header>
              <div class="account-details__personal-owned-nft-list-row">
                <span class="h-sm">{{ $t('name') }}</span>
              </div>
            </template>

            <template #row="{ item }">
              <div class="account-details__personal-owned-nft-list-row">
                <span class="row-text">{{ item.id.toString() }}</span>
              </div>
            </template>

            <template #mobile-card="{ item }">
              <div class="account-details__personal-owned-nft-mobile-list-row">
                <div class="account-details__personal-owned-nft-mobile-list-row-data row-text">
                  <span class="h-sm">{{ $t('name') }}</span>
                  <BaseLink :to="`/nfts/${encodeURIComponent(item.id.toString())}`">
                    {{ item.id.toString() }}
                  </BaseLink>
                </div>
              </div>
            </template>
          </BaseTable>
        </template>
      </BaseContentBlock>

      <BaseContentBlock
        :title="$t('accounts.accountDomains')"
        class="account-details__personal-owned"
      >
        <template #default>
          <span
            v-if="!account?.owned_domains"
            class="account-details__personal-owned_empty row-text"
          >{{
            $t('accounts.accountDoesntHaveAnyDomains')
          }}</span>
          <BaseTable
            v-else
            v-model:page="domainsListState.page"
            v-model:page-size="domainsListState.per_page"
            :loading="isDomainsLoading"
            :total="totalDomains"
            :items="domains"
            container-class="account-details__personal-owned-list"
            :breakpoint="960"
            row-pointer
            @click:row="(domain) => handleDomainRowClick(domain.id)"
          >
            <template #header>
              <div class="account-details__personal-owned-list-row">
                <span class="h-sm">{{ $t('id') }}</span>
                <span class="h-sm">{{ $t('assets.assets') }}</span>
                <span class="h-sm">{{ $t('accounts.accounts') }}</span>
              </div>
            </template>

            <template #row="{ item }">
              <div class="account-details__personal-owned-list-row">
                <span class="row-text">{{ item.id }}</span>
                <span class="row-text">{{ item.assets }}</span>
                <span class="row-text">{{ item.accounts }}</span>
              </div>
            </template>

            <template #mobile-card="{ item }">
              <div class="account-details__personal-owned-mobile-list-row">
                <div class="account-details__personal-owned-mobile-list-row-data row-text">
                  <span class="h-sm">{{ $t('id') }}</span>
                  <BaseLink :to="`/domains/${item.id}`">
                    {{ item.id }}
                  </BaseLink>
                </div>

                <div class="account-details__personal-owned-mobile-list-row-data row-text">
                  <span class="h-sm">{{ $t('assets.assets') }}</span>
                  <span>{{ item.assets }}</span>
                </div>

                <div class="account-details__personal-owned-mobile-list-row-data row-text">
                  <span class="h-sm">{{ $t('accounts.accounts') }}</span>
                  <span>{{ item.accounts }}</span>
                </div>
              </div>
            </template>
          </BaseTable>
        </template>
      </BaseContentBlock>
    </div>
    <div class="account-details__transactions">
      <BaseContentBlock :title="$t('accounts.accountTransactions')">
        <template #header-action>
          <BaseTabs
            v-model="transactionsTab"
            :items="ACCOUNT_TRANSACTIONS_OPTIONS"
          />
        </template>
        <template #default>
          <div class="account-details__transactions-table account-details__transactions-table_short">
            <TransactionsTable
              v-if="!shouldShowInstructions"
              :filter-by="{ kind: 'authority', value: accountId }"
              hash-type="short"
              show-block
            />
            <InstructionsTable
              v-else
              hash-type="short"
              :filter-by="{ kind: 'authority', value: accountId }"
            />
          </div>
        </template>
      </BaseContentBlock>
    </div>
  </div>
</template>

<style lang="scss">
@use '@/shared/ui/styles/main' as *;

.account-details {
  display: flex;

  @include xxs {
    gap: size(2);
    padding: 0 size(3);
    flex-direction: column;
  }

  @include lg {
    flex-direction: row;
  }

  &__personal {
    display: flex;
    flex-direction: column;
    gap: size(2);

    @include xxs {
      width: 90vw;
    }

    @include lg {
      width: 45vw;
    }

    @include xl {
      width: size(85);
    }

    @include xxl {
      width: size(95);
    }

    &-information {
      &_loading {
        margin-top: size(1);
        display: flex;
        justify-content: center;
        align-items: center;
      }

      &-row {
        margin-top: size(2);
        padding: 0 size(2) 0 size(4);

        & > div:not(:first-child) {
          margin-top: size(2);
        }
      }
    }

    &-owned {
      .base-content-block__body:has(.account-details__personal-owned_empty) {
        padding: size(0) size(4) size(4);
      }

      .base-table > .content-row {
        display: flex;
      }

      .content-row {
        padding: 0 size(4);
      }

      hr {
        display: none;
      }

      &-list,
      &-nft-list {
        display: grid;

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
            grid-template-columns: 25vw 25vw 25vw;
          }

          @include lg {
            grid-template-columns: size(25) size(18) size(18);
          }
          @include xl {
            grid-template-columns: size(35) size(20) size(20);
          }
        }
      }

      &-nft-list-row {
        grid-template-columns: 1fr;
      }

      &-mobile-list,
      &-nft-mobile-list {
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
  }

  &__transactions {
    margin-bottom: size(2);

    .base-content-block__header {
      display: flex;

      @include xxs {
        flex-direction: column;
        gap: size(2);
        padding: size(2) size(4);
      }

      @include sm {
        flex-direction: row;
        gap: 0;
      }
    }

    @include xxs {
      width: 90vw;
    }
    @include lg {
      width: 48vw;
    }
    @include xl {
      width: size(80);
    }
    @include xxl {
      width: size(95);
    }

    hr {
      display: none;
    }

    &-table {
      &_short {
        .content-row {
          height: auto;

          @include xxs {
            width: 90vw;
          }
          @include lg {
            width: 46vw;
            height: 48px;
          }
          @include xl {
            width: auto;
          }
        }
        & > .content-row {
          height: auto;
        }

        .transactions-table__columns {
          @include sm {
            flex-direction: column;
          }
          @include md {
            flex-direction: row;
          }
          @include lg {
            flex-direction: column;
          }
        }

        .transactions-table__column {
          &-hash {
            @include sm {
              width: 30vw;
            }
            @include md {
              width: 19vw;
            }
            @include lg {
              width: size(24);
            }
          }
          &-block {
            width: size(16);
          }
        }
      }
    }
  }
}
</style>
