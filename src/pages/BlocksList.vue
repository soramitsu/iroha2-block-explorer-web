<template>
  <BaseContentBlock
    :title="$t('blocks.blocks')"
    class="blocks-list-page"
  >
    <BaseTable
      v-model:page="listState.page"
      v-model:page-size="listState.per_page"
      :loading="isLoading"
      :total="payloadPagination?.total_items"
      :payload-pagination
      :items="blocks"
      container-class="blocks-list-page__container"
      reversed
    >
      <template #header>
        <div class="blocks-list-page__row">
          <span class="h-sm cell" />
          <span class="h-sm cell">{{ $t('blocks.height') }}</span>
          <span class="h-sm cell">{{ $t('blocks.age') }}</span>
          <span class="h-sm cell">{{ $t('blocks.hash') }}</span>
          <span class="h-sm cell">{{ $t('transactions.transactions') }}</span>
        </div>
      </template>

      <template #row="{ item }">
        <div class="blocks-list-page__row">
          <span class="row-text">{{ item.transactions_hash ? '◉' : 'O' }}</span>
          <BaseLink
            :to="`/blocks/${item.height}`"
            class="cell"
            monospace
          >
            {{ item.height }}
          </BaseLink>

          <div class="blocks-list-page__row-time cell">
            <TimeStamp
              :value="item.created_at"
              inverted
            />
          </div>

          <BaseHash
            :hash="item.hash"
            :link="`/blocks/${item.hash}`"
            :type="hashType"
            copy
            class="cell"
          />

          <div class="cell row-text-monospace">
            {{ $t('blocks.totalAndRejectedTransactions', [item.transactions_total, item.transactions_rejected]) }}
          </div>
        </div>
      </template>

      <template #mobile-card="{ item }">
        <div class="blocks-list-page__mobile-card">
          <span
            class="row-text"
            :style="{ 'margin-left': '8px' }"
          >{{ item.transactions_hash ? '◉' : 'O' }}</span>
          <div class="blocks-list-page__mobile-row">
            <span class="h-sm blocks-list-page__mobile-label">{{ $t('blocks.height') }}</span>

            <BaseLink :to="`/blocks/${item.height}`">
              {{ item.height }}
            </BaseLink>
          </div>

          <div class="blocks-list-page__mobile-row">
            <span class="h-sm blocks-list-page__mobile-label">{{ $t('blocks.age') }}</span>
            <TimeStamp
              class="blocks-list-page__mobile-row-time"
              :value="item.created_at"
              inverted
            />
          </div>

          <div class="blocks-list-page__mobile-row">
            <span class="h-sm blocks-list-page__mobile-label">{{ $t('blocks.hash') }}</span>

            <BaseHash
              :hash="item.hash"
              :link="`/blocks/${item.height}`"
              :type="hashType"
              copy
            />
          </div>

          <div class="blocks-list-page__mobile-row">
            <span class="h-sm blocks-list-page__mobile-label">{{ $t('transactions.transactions') }}</span>
            <span class="row-text-monospace">{{
              $t('blocks.totalAndRejectedTransactions', [item.transactions_total, item.transactions_rejected])
            }}</span>
          </div>
        </div>
      </template>
    </BaseTable>
  </BaseContentBlock>
</template>

<script setup lang="ts">
import BaseLink from '@/shared/ui/components/BaseLink.vue';
import * as http from '@/shared/api';
import BaseHash from '@/shared/ui/components/BaseHash.vue';
import BaseTable from '@/shared/ui/components/BaseTable.vue';
import BaseContentBlock from '@/shared/ui/components/BaseContentBlock.vue';
import { computed, reactive, watch } from 'vue';
import TimeStamp from '@/shared/ui/components/TimeStamp.vue';
import { useParamScope } from '@vue-kakuyaku/core';
import { setupAsyncData } from '@/shared/utils/setup-async-data';
import { useAdaptiveHash } from '@/shared/ui/composables/useAdaptiveHash';
import { SUCCESSFUL_FETCHING_STATUS } from '@/shared/api/consts';

const hashType = useAdaptiveHash({ xxl: 'full', xl: 'full', xxs: 'short' }, 'medium');

const listState = reactive({
  page: 0,
  per_page: 10,
});

watch(
  () => listState.per_page,
  () => {
    listState.page = 0;
  }
);

const scope = useParamScope(
  () => {
    return {
      key: JSON.stringify(listState),
      payload: listState,
    };
  },
  ({ payload }) => setupAsyncData(() => http.fetchBlocks(payload))
);

const isLoading = computed(() => scope.value?.expose.isLoading);
const payloadPagination = computed(() =>
  scope.value?.expose.data?.status === SUCCESSFUL_FETCHING_STATUS ? scope.value.expose.data.data.pagination : undefined
);
const blocks = computed(() =>
  scope.value?.expose.data?.status === SUCCESSFUL_FETCHING_STATUS ? scope.value.expose.data.data.items : []
);
</script>

<style lang="scss">
@use '@/shared/ui/styles/main' as *;

.blocks-list-page {
  &__row {
    width: 100%;
    display: grid;
    justify-content: start;
    @include lg {
      grid-template-columns: 20px 130px 260px 300px 1fr;
    }
    @include xl {
      grid-template-columns: 20px 130px 260px 640px 1fr;
    }

    &-time {
      position: relative;

      &:hover .context-tooltip {
        display: flex;
        bottom: size(3);
        left: size(8);
      }
    }
  }

  &__mobile-card {
    padding: size(2) 0 size(2) size(3);
  }

  &__mobile-row {
    display: flex;
    align-items: center;

    &-time {
      position: relative;

      @include sm {
        width: 58%;
      }

      &:hover .context-tooltip {
        display: flex;
        bottom: size(3);
        left: size(6);
      }
    }
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
</style>
