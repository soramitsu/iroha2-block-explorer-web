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

          <span class="row-text">{{ item.owned_domains }}</span>
          <span class="row-text">{{ item.owned_assets }}</span>
        </div>
      </template>

      <template #mobile-card="{ item }">
        <div class="accounts-list-page__mobile-card">
          <div class="accounts-list-page__mobile-row">
            <span class="h-sm accounts-list-page__mobile-label">{{ $t('accounts.address') }}</span>
            <BaseHash
              :hash="item.id.toString()"
              :link="`/accounts/${item.id}`"
              :type="hashType"
              copy
            />
          </div>

          <div class="accounts-list-page__mobile-row">
            <span class="h-sm accounts-list-page__mobile-label">{{ $t('domains.domains') }}</span>
            <span class="row-text">{{ item.owned_domains }}</span>
          </div>

          <div class="accounts-list-page__mobile-row">
            <span class="h-sm accounts-list-page__mobile-label">{{ $t('assets.assets') }}</span>
            <span class="row-text">{{ item.owned_assets }}</span>
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
import { useWindowSize } from '@vueuse/core';
import { computed, reactive, watch } from 'vue';
import { SM_WINDOW_SIZE, XS_WINDOW_SIZE } from '@/shared/ui/consts';
import { useParamScope } from '@vue-kakuyaku/core';
import { setupAsyncData } from '@/shared/utils/setup-async-data';
import type { AccountId } from '@/shared/api/schemas';
import { useRouter } from 'vue-router';

const HASH_BREAKPOINT = 1300;
const { width } = useWindowSize();
const router = useRouter();

const hashType = computed(() => {
  if (width.value > HASH_BREAKPOINT) return 'full';

  if (width.value > SM_WINDOW_SIZE) return 'medium';

  if (width.value > XS_WINDOW_SIZE) return 'short';

  return 'two-line';
});

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
const totalAccounts = computed(() => scope.value?.expose.data?.pagination?.total_items ?? 0);
const accounts = computed(() => scope.value?.expose.data?.items ?? []);

function handleRowClick(id: AccountId) {
  router.push(`/accounts/${id}`);
}
</script>

<style lang="scss">
@import '@/shared/ui/styles/main';

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
  }

  hr {
    display: none;
  }
}
</style>
