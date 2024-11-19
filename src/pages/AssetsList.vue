<template>
  <BaseContentBlock
    :title="$t('assets.assets')"
    class="assets-list-page"
  >
    <BaseTable
      v-model:page="listState.page"
      v-model:page-size="listState.per_page"
      :loading="isLoading"
      :total="totalAssets"
      :items="assets"
      container-class="assets-list-page__container"
    >
      <template #header>
        <div class="assets-list-page__row">
          <span class="h-sm cell">{{ $t('name') }}</span>
          <span class="h-sm cell">{{ $t('domain') }}</span>
          <span class="h-sm cell">{{ $t('mintable') }}</span>
          <span class="h-sm cell">{{ $t('type') }}</span>
        </div>
      </template>

      <template #row="{ item }">
        <div class="assets-list-page__row">
          <BaseLink
            :to="`/assets/${encodeURIComponent(item.id.toString())}`"
            class="cell"
          >
            {{ item.id.name }}
          </BaseLink>

          <BaseLink
            :to="`/domains/${item.id.domain}`"
            class="cell"
          >
            {{ item.id.domain }}
          </BaseLink>

          <div class="cell row-text">
            {{ item.mintable }}
          </div>

          <div class="cell row-text">
            {{ item.type }}
          </div>
        </div>
      </template>

      <template #mobile-card="{ item }">
        <div class="assets-list-page__mobile-card">
          <div class="assets-list-page__mobile-row">
            <span class="h-sm assets-list-page__mobile-label">{{ $t('name') }}</span>

            <BaseLink :to="`/assets/${encodeURIComponent(item.id.toString())}`">
              {{ item.id.name }}
            </BaseLink>
          </div>

          <div class="assets-list-page__mobile-row">
            <span class="h-sm assets-list-page__mobile-label">{{ $t('domain') }}</span>

            <BaseLink :to="`/domains/${item.id.domain}`">
              {{ item.id.domain }}
            </BaseLink>
          </div>

          <div class="assets-list-page__mobile-row">
            <span class="h-sm assets-list-page__mobile-label">{{ $t('mintable') }}</span>
            <span class="row-text">{{ item.mintable }}</span>
          </div>

          <div class="assets-list-page__mobile-row">
            <span class="h-sm assets-list-page__mobile-label">{{ $t('type') }}</span>
            <span class="row-text">{{ item.type }}</span>
          </div>
        </div>
      </template>
    </BaseTable>
  </BaseContentBlock>
</template>

<script setup lang="ts">
import * as http from '@/shared/api';
import BaseLink from '@/shared/ui/components/BaseLink.vue';
import BaseTable from '@/shared/ui/components/BaseTable.vue';
import BaseContentBlock from '@/shared/ui/components/BaseContentBlock.vue';
import { computed, reactive, watch } from 'vue';
import { useParamScope } from '@vue-kakuyaku/core';
import { setupAsyncData } from '@/shared/utils/setup-async-data';

const listState = reactive({
  page: 1,
  per_page: 10,
});

watch([() => listState.per_page], () => {
  listState.page = 1;
});

const scope = useParamScope(
  () => {
    return {
      key: Object.values(listState).join('-'),
      payload: listState,
    };
  },
  ({ payload }) => setupAsyncData(() => http.fetchAssetDefinitions(payload))
);

const isLoading = computed(() => scope.value?.expose.isLoading);
const totalAssets = computed(() => scope.value?.expose.data?.pagination?.total_items ?? 0);
const assets = computed(() => scope.value?.expose.data?.items ?? []);
</script>

<style lang="scss">
@import '@/shared/ui/styles/main';

.assets-list-page {
  &__row {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
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

    @include sm {
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
