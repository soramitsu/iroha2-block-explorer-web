<template>
  <BaseContentBlock
    :title="$t('accounts.accounts')"
    class="accounts-list-page"
  >
    <BaseTable
      :loading="table.loading.value"
      :pagination="table.pagination"
      :items="table.items.value"
      container-class="accounts-list-page__container"
      @next-page="table.nextPage()"
      @prev-page="table.prevPage()"
      @set-page="table.setPage($event)"
      @set-size="table.setSize($event)"
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
            :hash="item.id"
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
              :hash="item.id"
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
import { http } from '@/shared/api';
import { useTable } from '@/shared/lib/table';
import BaseHash from '@/shared/ui/components/BaseHash.vue';
import BaseTable from '@/shared/ui/components/BaseTable.vue';
import BaseContentBlock from '@/shared/ui/components/BaseContentBlock.vue';
import { useWindowSize } from '@vueuse/core';
import { computed, onMounted } from 'vue';
import { useErrorHandlers } from '@/shared/ui/composables/useErrorHandlers';
import { ZodError } from 'zod';

const table = useTable(http.fetchAccounts);
const { handleUnknownError, handleZodError } = useErrorHandlers();

onMounted(async () => {
  try {
    await table.fetch();
  } catch (e) {
    if (e instanceof ZodError) handleZodError(e);
    else handleUnknownError(e);
  }
});

const HASH_BREAKPOINT = 1300;
const { width } = useWindowSize();

const hashType = computed(() => (width.value < HASH_BREAKPOINT ? 'short' : 'full'));
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
}
</style>
