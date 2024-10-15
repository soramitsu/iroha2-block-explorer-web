<script setup lang="ts">
import { useRouter } from 'vue-router';
import { computed, onMounted, ref } from 'vue';
import * as http from '@/shared/api';
import BaseContentBlock from '@/shared/ui/components/BaseContentBlock.vue';
import { useErrorHandlers } from '@/shared/ui/composables/useErrorHandlers';
import BaseLoading from '@/shared/ui/components/BaseLoading.vue';
import DataField from '@/shared/ui/components/DataField.vue';
import type { AssetDefinition } from '@/shared/api/schemas';
import { AssetDefinitionIdSchema } from '@/shared/api/schemas';
import { parseMetadata } from '@/shared/ui/utils/json';
import { useWindowSize } from '@vueuse/core';
import { XS_WINDOW_SIZE } from '@/shared/ui/consts';
import { useTable } from '@/shared/lib/table';
import BaseLink from '@/shared/ui/components/BaseLink.vue';
import BaseTable from '@/shared/ui/components/BaseTable.vue';

const router = useRouter();

const HASH_BREAKPOINT = 1000;

const { width } = useWindowSize();

const hashType = computed(() => {
  if (width.value > HASH_BREAKPOINT) return 'full';

  if (width.value > XS_WINDOW_SIZE) return 'medium';

  return 'short';
});

const { handleUnknownError } = useErrorHandlers();

const assetDefinitionId = computed(() => {
  const id = router.currentRoute.value.params['id'];

  return AssetDefinitionIdSchema.parse(id);
});

const asset = ref<AssetDefinition | null>(null);
const isFetchingAsset = ref(false);

const assetsTable = useTable(http.fetchAssets);

onMounted(async () => {
  try {
    isFetchingAsset.value = true;
    asset.value = await http.fetchAssetDefinition(assetDefinitionId.value);

    if (asset.value.assets) {
      await assetsTable.fetch({ definition: asset.value.id.toString() });
    }
  } catch (e) {
    handleUnknownError(e);
  } finally {
    isFetchingAsset.value = false;
  }
});
</script>

<template>
  <div class="asset-details">
    <BaseContentBlock
      :title="$t('assets.asset', [assetDefinitionId.name])"
      class="asset-details__information"
    >
      <template #default>
        <div
          v-if="isFetchingAsset"
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
              :hash="assetDefinitionId.domain"
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
      :title="$t('assets.assetInstances')"
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
          :loading="assetsTable.loading.value"
          :items="assetsTable.items.value"
          container-class="asset-details__assets-table-list"
          :breakpoint="960"
          :pagination="assetsTable.pagination"
          @next-page="assetsTable.nextPage()"
          @prev-page="assetsTable.prevPage()"
          @set-page="assetsTable.setPage($event)"
          @set-size="assetsTable.setSize($event)"
        >
          <template #header>
            <div class="asset-details__assets-table-list-row">
              <span class="h-sm">{{ $t('name') }}</span>
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

      .base-link {
        @include tpg-s3;
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
      }
    }

    &-mobile-list {
      &-row {
        padding: size(2) size(4);
        @include xxs {
          width: 100%;
        }
        @include sm {
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
              width: size(16);
            }
            @include xs {
              width: size(20);
            }
            @include sm {
              width: size(16);
            }
          }
        }
      }
    }
  }
}
</style>
