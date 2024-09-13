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

const router = useRouter();

const { handleUnknownError } = useErrorHandlers();

const assetDefinitionId = computed(() => {
  const id = router.currentRoute.value.params['id'];

  return AssetDefinitionIdSchema.parse(id);
});

const asset = ref<AssetDefinition | null>(null);
const isFetchingAsset = ref(false);

onMounted(async () => {
  try {
    isFetchingAsset.value = true;
    asset.value = await http.fetchAssetDefinition(assetDefinitionId.value);
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
      :title="$t('assets.assetMetrics')"
      class="asset-details__metrics"
    >
      <template #default>
        <div
          v-if="isFetchingAsset"
          class="asset-details__metrics_loading"
        >
          <BaseLoading />
        </div>
        <div v-else-if="asset">
          <div class="asset-details__metrics-data">
            <DataField
              :title="$t('name')"
              :value="assetDefinitionId.name"
            />
            <DataField
              :title="$t('type')"
              :value="asset.type"
            />
            <DataField
              :title="$t('mintable')"
              :value="asset.mintable"
            />
          </div>
          <div class="asset-details__metrics-data">
            <DataField
              :title="$t('assets.assets')"
              :value="asset.assets"
            />
            <DataField
              :title="$t('domain')"
              :hash="assetDefinitionId.domain"
              :link="`/domains/${assetDefinitionId.domain}`"
            />
            <DataField
              :title="$t('metadata')"
              :value="parseMetadata(asset.metadata)"
            />
          </div>
        </div>
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

  &__metrics {
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
        grid-template-columns: 1fr 1fr 1fr;
      }

      .base-link {
        @include tpg-s3;
      }
    }
  }
}
</style>
