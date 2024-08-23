<script setup lang="ts">
import { useRouter } from 'vue-router';
import { computed, onMounted, ref } from 'vue';
import { http } from '@/shared/api';
import BaseContentBlock from '@/shared/ui/components/BaseContentBlock.vue';
import { useTable } from '@/shared/lib/table';
import BaseTable from '@/shared/ui/components/BaseTable.vue';
import { type filterTransactionsModel as ftm, TransactionStatusFilter } from '@/features/filter-transactions';
import BaseHash from '@/shared/ui/components/BaseHash.vue';
import { useWindowSize } from '@vueuse/core';
import { useErrorHandlers } from '@/shared/ui/composables/useErrorHandlers';
import BaseLoading from '@/shared/ui/components/BaseLoading.vue';
import DataField from '@/shared/ui/components/DataField.vue';
import { elapsed } from '@/shared/lib/time';
import invariant from 'tiny-invariant';
import type { AssetDefinitionDto } from '@/shared/api/dto';
import { assetDefinitionSchema, transactionSchema } from '@/shared/api/dto';
import { ZodError } from 'zod';
import TransactionStatus from '@/entities/transaction/TransactionStatus.vue';

const router = useRouter();

const { handleUnknownError, handleZodError } = useErrorHandlers();

const HASH_BREAKPOINT = 800;
const { width } = useWindowSize();

const hashType = computed(() => (width.value < HASH_BREAKPOINT ? 'medium' : 'full'));

const assetName = computed(() => {
  const name = router.currentRoute.value.params['id'];

  invariant(typeof name === 'string', 'Expected string');

  return name;
});

const assetDomain = computed(() => {
  const str = router.currentRoute.value.hash;

  const domain = str.split('#')[1];

  if (domain) return domain;

  return str.split('@')[1];
});

const assetId = computed(() => assetName.value + '#' + assetDomain.value);

const asset = ref<AssetDefinitionDto | null>(null);
const isFetchingAsset = ref(false);

onMounted(async () => {
  try {
    isFetchingAsset.value = true;
    asset.value = await http.fetchAssetDefinition(encodeURIComponent(assetId.value));

    assetDefinitionSchema.parse(asset.value);

    await transactionsTable.fetch();

    transactionSchema.array().parse(transactionsTable.items.value);
  } catch (e) {
    if (e instanceof ZodError) handleZodError(e);
    else handleUnknownError(e);
  } finally {
    isFetchingAsset.value = false;
  }
});

const transactionStatus = ref<ftm.Status>(null);

// FIXME: this loads ALL transactions, not only related to the asset
const transactionsTable = useTable(http.fetchTransactions);

const transactions = computed(() => {
  if (transactionStatus.value === 'committed') return transactionsTable.items.value.filter((t) => !t.error);
  else if (transactionStatus.value === 'rejected') return transactionsTable.items.value.filter((t) => t.error);

  return transactionsTable.items.value;
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
              :value="assetName"
            />
            <DataField
              :title="$t('type')"
              :value="asset.type.kind"
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
      :title="$t('assets.assetTransactions')"
      class="asset-details__transactions"
    >
      <div class="asset-details__transactions-filters content-row">
        <TransactionStatusFilter
          v-model="transactionStatus"
          class="asset-details__transactions-filters-status"
        />
      </div>

      <BaseTable
        :loading="transactionsTable.loading.value"
        :items="transactions"
        container-class="asset-details__transactions-container"
        @next-page="transactionsTable.nextPage()"
        @prev-page="transactionsTable.prevPage()"
        @set-page="transactionsTable.setPage($event)"
        @set-size="transactionsTable.setSize($event)"
      >
        <template #row="{ item }">
          <div class="asset-details__transactions-row">
            <TransactionStatus
              type="tooltip"
              class="asset-details__transactions-row-icon"
              :committed="!item.error"
            />

            <div class="asset-details__transactions-row-data">
              <BaseHash
                :type="hashType"
                :hash="item.hash"
                :link="`/transactions/${item.hash}`"
              />
              <span class="asset-details__transactions-row-data-time row-text">{{ $t('time.min', [elapsed.allMinutes(item.payload.created_at)]) }} {{ $t('time.ago') }}</span>
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
      padding: size(2) size(4);
    }

    &-container {
      display: grid;
      .content-row:last-child {
        border-bottom: 1px solid theme-color('border-primary');
      }
    }

    &-row {
      @include xxs {
        padding: 0 size(2);
      }

      width: 100%;
      display: flex;

      &-data {
        &-time {
          @include tpg-s5;
        }
      }

      &-icon {
        display: none;
        margin-right: size(2);

        @include xs {
          display: grid;
        }
      }
    }
  }
}
</style>
