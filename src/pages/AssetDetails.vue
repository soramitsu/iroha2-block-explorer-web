<script setup lang="ts">
import { useRouter } from 'vue-router';
import { computed, reactive, watch } from 'vue';
import * as http from '@/shared/api';
import BaseContentBlock from '@/shared/ui/components/BaseContentBlock.vue';
import BaseLoading from '@/shared/ui/components/BaseLoading.vue';
import DataField from '@/shared/ui/components/DataField.vue';
import { AssetDefinitionIdSchema } from '@/shared/api/schemas';
import { parseMetadata } from '@/shared/ui/utils/json';
import { useWindowSize } from '@vueuse/core';
import { LG_WINDOW_SIZE, MD_WINDOW_SIZE, SM_WINDOW_SIZE, XS_WINDOW_SIZE } from '@/shared/ui/consts';
import BaseLink from '@/shared/ui/components/BaseLink.vue';
import BaseTable from '@/shared/ui/components/BaseTable.vue';
import BaseHash from '@/shared/ui/components/BaseHash.vue';
import { useParamScope } from '@vue-kakuyaku/core';
import { handleParamScope } from '@/shared/api/handle-param-scope';

const router = useRouter();

const HASH_BREAKPOINT = 1000;

const { width } = useWindowSize();

const hashType = computed(() => {
  if (width.value > HASH_BREAKPOINT) return 'full';

  if (width.value > XS_WINDOW_SIZE) return 'medium';

  return 'short';
});

const accountIdType = computed(() => {
  if (width.value >= LG_WINDOW_SIZE) return 'medium';

  if (width.value >= MD_WINDOW_SIZE) return 'short';

  if (width.value >= SM_WINDOW_SIZE) return 'medium';

  if (width.value >= XS_WINDOW_SIZE) return 'short';

  return 'two-line';
});

const assetDefinitionId = computed(() => {
  const id = router.currentRoute.value.params['id'];

  return AssetDefinitionIdSchema.parse(id);
});

const assetScope = useParamScope(
  () => {
    return {
      key: assetDefinitionId.value.toString(),
      payload: assetDefinitionId.value,
    };
  },
  ({ payload }) => handleParamScope(payload, http.fetchAssetDefinition)
);

const isAssetLoading = computed(() => assetScope.value.expose.isLoading);
const asset = computed(() => {
  const res = assetScope.value?.expose.data;

  if (!res) return null;

  return res;
});

const listState = reactive({
  page: 1,
  per_page: 10,
});

watch(
  () => [listState.per_page],
  () => {
    listState.page = 1;
  }
);

const assetsListScope = useParamScope(
  () => {
    return {
      key: asset.value?.assets ? Object.values(listState).join('-') : '',
      payload: listState,
    };
  },
  ({ payload }) => handleParamScope(payload, http.fetchAssets)
);

const isLoadingAssets = computed(() => assetsListScope.value?.expose.isLoading);
const totalAssets = computed(() => assetsListScope.value?.expose.data?.pagination?.total_items ?? 0);
const assets = computed(() => assetsListScope.value?.expose.data?.items ?? []);
</script>

<template>
  <div class="asset-details">
    <BaseContentBlock
      :title="$t('assets.asset', [assetDefinitionId.name])"
      class="asset-details__information"
    >
      <template #default>
        <div
          v-if="isAssetLoading"
          class="asset-details__information_loading"
        >
          <BaseLoading />
        </div>
        <div v-else-if="asset">
          <div class="asset-details__information-data">
            <DataField
              :title="$t('assets.ownedBy')"
              :hash="asset.owned_by.toString()"
              copy
              :link="`/accounts/${asset.owned_by}`"
              :type="hashType"
            />
          </div>
          <div class="asset-details__information-data">
            <DataField
              :title="$t('domain')"
              :value="assetDefinitionId.domain"
              :link="`/domains/${assetDefinitionId.domain}`"
            />
            <DataField
              :title="$t('type')"
              :value="asset.type"
            />
            <DataField
              :title="$t('mintable')"
              :value="asset.mintable"
            />
            <DataField
              :title="$t('metadata')"
              metadata
              :value="parseMetadata(asset.metadata)"
            />
          </div>
        </div>
      </template>
    </BaseContentBlock>

    <BaseContentBlock
      :title="$t('assets.assetHolders')"
      class="asset-details__assets-table"
    >
      <template #default>
        <span
          v-if="!asset?.assets"
          class="asset-details__assets-table_empty row-text"
        >{{
          $t('assets.assetDoesntContainAnyInstances')
        }}</span>
        <BaseTable
          v-else
          v-model:page="listState.page"
          v-model:page-size="listState.per_page"
          :loading="isLoadingAssets"
          :total="totalAssets"
          :items="assets"
          container-class="asset-details__assets-table-list"
          :breakpoint="1200"
        >
          <template #header>
            <div class="asset-details__assets-table-list-row">
              <span class="h-sm">{{ $t('name') }}</span>
              <span class="h-sm">{{ $t('domain') }}</span>
              <span class="h-sm">{{ $t('accountId') }}</span>
              <span class="h-sm">{{ $t('type') }}</span>
              <span class="h-sm">{{ $t('value') }}</span>
            </div>
          </template>

          <template #row="{ item }">
            <div class="asset-details__assets-table-list-row">
              <div class="asset-details__assets-table-list-row-data row-text">
                <BaseLink :to="`/assets/${encodeURIComponent(item.id.definition.toString())}`">
                  {{ item.id.definition.name }}
                </BaseLink>
              </div>

              <div class="asset-details__assets-table-list-row-data row-text">
                <BaseLink :to="`/domains/${item.id.definition.domain}`">
                  {{ item.id.definition.domain }}
                </BaseLink>
              </div>

              <div class="asset-details__assets-table-list-row-data row-text">
                <BaseHash
                  :type="accountIdType"
                  :hash="item.id.account.toString()"
                  :link="`/accounts/${item.id.account.toString()}`"
                  copy
                />
              </div>

              <div class="asset-details__assets-table-list-row-data row-text">
                <span>{{ item.value.kind }}</span>
              </div>

              <div class="asset-details__assets-table-list-row-data row-text">
                <template v-if="item.value.kind === 'Store'">
                  🔑: {{ Object.keys(item.value.metadata).length }}
                </template>
                <template v-else>
                  {{ item.value.value }}
                </template>
              </div>
            </div>
          </template>

          <template #mobile-card="{ item }">
            <div class="asset-details__assets-table-mobile-list-row">
              <div class="asset-details__assets-table-mobile-list-row-data row-text">
                <span class="h-sm">{{ $t('name') }}</span>
                <BaseLink :to="`/assets/${encodeURIComponent(item.id.definition.toString())}`">
                  {{ item.id.definition.name }}
                </BaseLink>
              </div>

              <div class="asset-details__assets-table-mobile-list-row-data row-text">
                <span class="h-sm">{{ $t('domain') }}</span>
                <BaseLink :to="`/domains/${item.id.definition.domain}`">
                  {{ item.id.definition.domain }}
                </BaseLink>
              </div>

              <div class="asset-details__assets-table-mobile-list-row-data row-text">
                <span class="h-sm">{{ $t('accountId') }}</span>
                <BaseHash
                  :type="accountIdType"
                  :hash="item.id.account.toString()"
                  :link="`/accounts/${item.id.account.toString()}`"
                  copy
                />
              </div>

              <div class="asset-details__assets-table-mobile-list-row-data row-text">
                <span class="h-sm">{{ $t('type') }}</span>
                <span>{{ item.value.kind }}</span>
              </div>

              <div class="asset-details__assets-table-mobile-list-row-data row-text">
                <span class="h-sm">{{ $t('value') }}</span>
                <template v-if="item.value.kind === 'Store'">
                  🔑: {{ Object.keys(item.value.metadata).length }}
                </template>
                <template v-else>
                  {{ item.value.value }}
                </template>
              </div>
            </div>
          </template>
        </BaseTable>
      </template>
    </BaseContentBlock>
  </div>
</template>

<style lang="scss">
@import '@/shared/ui/styles/main';

.asset-details {
  display: flex;
  flex-direction: column;

  @include xxs {
    padding: 0 size(2);
    gap: size(2);
  }

  @include md {
    padding: 0 size(3);
  }

  &__information {
    &_loading {
      margin-top: size(1);
      display: flex;
      justify-content: center;
    }

    &-data {
      display: grid;
      margin-top: size(2);
      padding: 0 size(2) 0 size(4);
      gap: size(2);
      grid-template-columns: 1fr;

      @include xxs {
        grid-template-columns: 1fr;
      }

      @include sm {
        grid-template-columns: 1fr 1fr 1fr 1fr;
      }
    }
  }

  &__assets-table {
    .base-content-block__body:has(.asset-details__assets-table_empty) {
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

    &-list {
      display: grid;

      @include xxs {
        grid-template-columns: 1fr;
      }

      @include md {
        grid-template-columns: 1fr 1fr;
      }

      @include lg {
        grid-template-columns: 1fr;
      }

      &-row {
        display: grid;

        @include lg {
          grid-template-columns: 15vw 15vw 32vw 15vw 10vw;
        }

        @include xl {
          grid-template-columns: 10vw 15vw 30vw 10vw 10vw;
        }
      }
    }

    .base-table__mobile-card {
      @include xxs {
        border-right: none;
      }
      @include md {
        border: 1px solid theme-color('border-primary');
      }
    }

    &-mobile-list {
      &-row {
        padding: size(2) size(4);
        @include xxs {
          width: 100%;
        }
        @include sm {
          width: 90vw;
        }
        @include md {
          width: 45vw;
        }
        display: flex;
        flex-direction: column;

        &-data {
          display: flex;
          align-items: center;
          margin-top: size(2);

          span:first-child {
            @include xxs {
              width: size(14);
            }
            @include xs {
              width: size(16);
            }
            @include sm {
              width: size(14);
            }
          }
        }
      }
    }
  }
}
</style>
