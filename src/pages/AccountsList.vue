<template>
  <BaseContentBlock
    :title="$t('accounts.accounts')"
    class="accounts-list-page"
  >
    <BaseTable
      v-model:page="listState.page"
      v-model:page-size="listState.per_page"
      :loading="isLoading"
      :total="totalAccounts"
      :items="accounts"
      container-class="accounts-list-page__container"
      row-pointer
      @click:row="(account) => handleRowClick(account.id)"
    >
      <template #header>
        <div class="accounts-list-page__row">
          <span class="h-sm cell">{{ $t('accounts.address') }}</span>
          <span class="h-sm">{{ $t('domains.domains') }}</span>
          <span class="h-sm">{{ $t('assets.assets') }}</span>
        </div>
      </template>

      <template #row="{ item }">
        <div class="accounts-list-page__row">
          <BaseHash
            :hash="item.id.toString()"
            :link="`/accounts/${item.id}`"
            :type="hashType"
            copy
            class="cell"
          />

          <span class="row-text-monospace">{{ item.owned_domains }}</span>
          <span class="row-text-monospace">{{ item.owned_assets + item.owned_nfts }}</span>
        </div>
      </template>

      <template #mobile-card="{ item }">
        <div class="accounts-list-page__mobile-card">
          <div class="accounts-list-page__mobile-row">
            <span class="h-sm accounts-list-page__mobile-row-label">{{ $t('accounts.address') }}</span>
            <BaseHash
              :hash="item.id.toString()"
              :link="`/accounts/${item.id}`"
              :type="hashType"
              class="accounts-list-page__mobile-row-id"
              copy
            />
          </div>

          <div class="accounts-list-page__mobile-row">
            <span class="h-sm accounts-list-page__mobile-row-label">{{ $t('domains.domains') }}</span>
            <span class="row-text-monospace">{{ item.owned_domains }}</span>
          </div>

          <div class="accounts-list-page__mobile-row">
            <span class="h-sm accounts-list-page__mobile-row-label">{{ $t('assets.assets') }}</span>
            <span class="row-text-monospace">{{ item.owned_assets + item.owned_nfts }}</span>
          </div>
        </div>
      </template>
    </BaseTable>
  </BaseContentBlock>
</template>

<script setup lang="ts">
import * as http from '@/shared/api';
import BaseHash from '@/shared/ui/components/BaseHash.vue';
import BaseTable from '@/shared/ui/components/BaseTable.vue';
import BaseContentBlock from '@/shared/ui/components/BaseContentBlock.vue';
import { computed, reactive, watch } from 'vue';
import { useParamScope } from '@vue-kakuyaku/core';
import { setupAsyncData } from '@/shared/utils/setup-async-data';
import type { AccountId } from '@iroha/core/data-model';
import { useRouter } from 'vue-router';
import { useAdaptiveHash } from '@/shared/ui/composables/useAdaptiveHash';
import { SUCCESSFUL_FETCHING_STATUS } from '@/shared/api/consts';

const router = useRouter();

const hashType = useAdaptiveHash({ xxl: 'full', xl: 'full', xs: 'two-line', xxs: 'two-line' }, 'medium');

const listState = reactive({
  page: 1,
  per_page: 10,
});

watch(
  () => listState.per_page,
  () => {
    listState.page = 1;
  }
);

const scope = useParamScope(
  () => {
    return {
      key: JSON.stringify(listState),
      payload: listState,
    };
  },
  ({ payload }) => setupAsyncData(() => http.fetchAccounts(payload))
);

const isLoading = computed(() => scope.value?.expose.isLoading);
const totalAccounts = computed(() =>
  scope.value.expose.data?.status === SUCCESSFUL_FETCHING_STATUS
    ? scope.value.expose.data.data.pagination.total_items
    : 0
);
const accounts = computed(() =>
  scope.value.expose.data?.status === SUCCESSFUL_FETCHING_STATUS ? scope.value.expose.data.data.items : []
);

function handleRowClick(id: AccountId) {
  router.push(`/accounts/${id}`);
}
</script>

<style lang="scss">
@use '@/shared/ui/styles/main' as *;

.accounts-list-page {
  &__row {
    width: 100%;
    display: grid;
    grid-template-columns: 2.5fr 0.5fr 0.5fr;
  }

  &__mobile-card {
    padding: size(2) size(4);
  }

  &__mobile-row {
    display: flex;
    align-items: center;

    &-label {
      text-align: left;
      width: size(12);
      padding: size(1);
      margin-right: size(1);
    }

    &-id {
      @include xxs {
        width: 53vw;
      }
      @include xs {
        width: auto;
      }
    }
  }

  &__container {
    display: grid;
    grid-template-columns: 1fr;
  }

  hr {
    display: none;
  }
}
</style>
