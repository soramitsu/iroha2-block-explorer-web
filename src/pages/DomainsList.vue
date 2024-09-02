<template>
  <BaseContentBlock
    :title="$t('domains.domains')"
    class="domains-list-page"
  >
    <BaseTable
      :loading="table.loading.value"
      :pagination="table.pagination"
      :items="table.items.value"
      container-class="domains-list-page__container"
      @next-page="table.nextPage()"
      @prev-page="table.prevPage()"
      @set-page="table.setPage($event)"
      @set-size="table.setSize($event)"
    >
      <template #header>
        <div class="domains-list-page__row">
          <span class="h-sm cell">{{ $t('name') }}</span>
          <span class="h-sm">{{ $t('domains.ownedBy') }}</span>
          <span class="h-sm">{{ $t('domains.totalAccounts') }}</span>
          <span class="h-sm">{{ $t('domains.totalAssets') }}</span>
        </div>
      </template>

      <template #row="{ item }">
        <div class="domains-list-page__row">
          <BaseLink
            :to="`/domains/${item.id}`"
            class="cell"
          >
            {{ item.id }}
          </BaseLink>

          <BaseHash
            :hash="item.owned_by"
            :link="`/accounts/${item.owned_by}`"
            :type="hashType"
            copy
          />

          <span class="row-text">{{ item.accounts }}</span>
          <span class="row-text">{{ item.assets }}</span>
        </div>
      </template>

      <template #mobile-card="{ item }">
        <div class="domains-list-page__mobile-card">
          <div class="domains-list-page__mobile-row">
            <span class="h-sm domains-list-page__mobile-label">{{ $t('name') }}</span>

            <BaseLink :to="`/domains/${item.id}`">
              {{ item.id }}
            </BaseLink>
          </div>

          <div class="domains-list-page__mobile-row">
            <span class="h-sm domains-list-page__mobile-label">{{ $t('domains.ownedBy') }}</span>
            <BaseHash
              :hash="item.owned_by"
              :link="`/accounts/${item.owned_by}`"
              :type="hashType"
              copy
            />
          </div>

          <div class="domains-list-page__mobile-row">
            <span class="h-sm domains-list-page__mobile-label">{{ $t('domains.totalAccounts') }}</span>
            <span class="row-text">{{ item.accounts }}</span>
          </div>
          <div class="domains-list-page__mobile-row">
            <span class="h-sm domains-list-page__mobile-label">{{ $t('domains.totalAssets') }}</span>
            <span class="row-text">{{ item.assets }}</span>
          </div>
        </div>
      </template>
    </BaseTable>
  </BaseContentBlock>
</template>

<script setup lang="ts">
import { http } from '@/shared/api';
import { useTable } from '@/shared/lib/table';
import BaseLink from '@/shared/ui/components/BaseLink.vue';
import BaseTable from '@/shared/ui/components/BaseTable.vue';
import BaseContentBlock from '@/shared/ui/components/BaseContentBlock.vue';
import BaseHash from '@/shared/ui/components/BaseHash.vue';
import { useWindowSize } from '@vueuse/core';
import { computed, onMounted } from 'vue';
import { useErrorHandlers } from '@/shared/ui/composables/useErrorHandlers';
import { ZodError } from 'zod';

const table = useTable(http.fetchDomains);

const { handleUnknownError, handleZodError } = useErrorHandlers();

onMounted(async () => {
  try {
    await table.fetch();
  } catch (e) {
    if (e instanceof ZodError) handleZodError(e);
    else handleUnknownError(e);
  }
});

const HASH_BREAKPOINT = 1350;
const { width } = useWindowSize();

const hashType = computed(() => (width.value < HASH_BREAKPOINT ? 'short' : 'full'));
</script>

<style lang="scss">
@import '@/shared/ui/styles/main';

.domains-list-page {
  &__row {
    width: 100%;
    display: grid;
    grid-template-columns: 0.5fr 2.2fr 0.4fr 0.5fr;
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
}
</style>
