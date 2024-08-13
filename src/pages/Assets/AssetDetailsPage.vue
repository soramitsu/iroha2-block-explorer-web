<script setup lang="ts">
import { useRouter } from 'vue-router';
import { computed, onMounted, ref } from 'vue';
import { http } from '@/shared/api';
import BaseContentBlock from '@/shared/ui/components/BaseContentBlock.vue';
import { useTable } from '@/shared/lib/table';
import BaseTable from '@/shared/ui/components/BaseTable.vue';
import { type filterTransactionsModel as ftm, TransactionStatusFilter } from '@/features/filter-transactions';
import BaseHash from '@/shared/ui/components/BaseHash.vue';
import { transactionModel } from '@/entities/transaction';
import { useWindowSize } from '@vueuse/core';
import { useErrorHandlers } from '@/shared/ui/composables/useErrorHandlers';
import BaseTabs from '@/shared/ui/components/BaseTabs.vue';
import BaseLoading from '@/shared/ui/components/BaseLoading.vue';
import DataField from '@/shared/ui/components/DataField.vue';
import type { TabAssetsSort } from '@/features/filter-transactions/model';
import { sortOptions } from '@/features/filter-transactions/model';
import { elapsed } from '@/shared/lib/time';

const router = useRouter();

const { handleUnknownError } = useErrorHandlers();

const HASH_BREAKPOINT = 800;
const { width } = useWindowSize();

const hashType = computed(() => (width.value < HASH_BREAKPOINT ? 'medium' : 'full'));

const assetName = computed(() => {
  const name = router.currentRoute.value.params['id'];

  if (typeof name === 'string') return name;

  return name[0];
});

const assetDomain = computed(() => {
  const domain = router.currentRoute.value.hash;

  return domain.split('#')[1];
});

const assetId = computed(() => assetName.value + '#' + assetDomain.value);

const asset = ref<AssetDefinition | null>(null);
const isFetchingAsset = ref(false);

onMounted(async () => {
  try {
    isFetchingAsset.value = true;
    asset.value = await http.fetchAssetDefinition(encodeURIComponent(assetId.value));

    await transactionsTable.fetch();
  } catch (e) {
    handleUnknownError(e);
  } finally {
    isFetchingAsset.value = false;
  }
});

const transactionStatus = ref<ftm.Status>(null);
const transactionType = ref<TabAssetsSort>('recent');

// TODO: use transactions from asset definition payload instead
//  or replace with fetching specific transactions
const transactionsTable = useTable(transactionModel.fetchList);
</script>

<template>
  <div class="asset-details">
    <BaseContentBlock
      :title="$t('assetDetails.assetMetrics')"
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
              :value="assetName"
            />
            <DataField
              :title="$t('type')"
              :value="asset.value_type"
            />
            <DataField
              :title="$t('mintable')"
              :value="asset.mintable"
            />
            <DataField
              :title="$t('domain')"
              :hash="assetDomain"
              :link="`/domains/${assetDomain}`"
            />
          </div>
        </div>
      </template>
    </BaseContentBlock>
    <BaseContentBlock
      :title="$t('assetDetails.assetTransactions')"
      class="asset-details__transactions"
    >
      <div class="asset-details__transactions-filters content-row">
        <BaseTabs
          v-model="transactionType"
          :items="sortOptions"
          class="asset-details__transactions-filters-type"
        />
        <TransactionStatusFilter
          v-model="transactionStatus"
          class="asset-details__transactions-filters-status"
        />
      </div>

      <BaseTable
        :loading="transactionsTable.loading.value"
        :items="transactionsTable.items.value"
        container-class="asset-details__transactions-container"
        @next-page="transactionsTable.nextPage()"
        @prev-page="transactionsTable.prevPage()"
        @set-page="transactionsTable.setPage($event)"
        @set-size="transactionsTable.setSize($event)"
      >
        <template #row="{ item }">
          <div class="asset-details__transactions-row">
            <div class="asset-details__transactions-row-data">
              <BaseHash
                :type="hashType"
                :hash="item.hash"
                :link="`/transactions/${item.hash}`"
              />
              <span class="asset-details__transactions-row-data-time row-text">{{ $t('time.min', [elapsed.allMinutes(item.payload.creation_time)]) }} {{ $t('time.ago') }}</span>
            </div>
          </div>
        </template>
      </BaseTable>
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
    gap: size(1);
  }

  @include md {
    padding: 0 size(3);
    gap: size(3);
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

      @include sm {
        grid-template-columns: 1fr 1fr;
      }

      @include lg {
        grid-template-columns: 1fr 1fr 1fr 1fr;
      }

      .base-link {
        @include tpg-s3;
      }
    }
  }

  &__transactions {
    &-filters {
      border-top: 0;
      display: flex;
      gap: size(1);

      @include xxs {
        padding: size(2) 0;
        flex-direction: column;
      }

      @include sm {
        padding: 0 size(4);
        flex-direction: row;
      }
    }

    &-container {
      display: grid;
    }

    &-row {
      @include xxs {
        padding: 0 size(2);
      }

      @include md {
        padding: 0;
      }

      width: 100%;
      display: flex;

      &-data {
        &-time {
          @include tpg-s5;
        }
      }
    }
  }
}
</style>
