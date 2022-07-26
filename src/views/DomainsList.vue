<template>
  <BaseContentBlock :title="$t('domains')" class="domains-list-page">
    <BaseTable
      :loading="table.loading.value"
      :pagination="table.pagination"
      :items="table.items.value"
      @next-page="table.nextPage()"
      @prev-page="table.prevPage()"
      @set-page="table.setPage($event)"
      @set-size="table.setSize($event)"
    >
      <template #header>
        <div class="domains-list-page__row">
          <span class="h-sm cell">{{ $t('name') }}</span>
          <span class="h-sm cell">{{ $t('assets') }}</span>
          <span class="h-sm cell">{{ $t('accounts') }}</span>
        </div>
      </template>

      <template #row="{ item }: { item: Domain }">
        <div class="domains-list-page__row">
          <span class="cell">
            <a :href="`/domains/${item.id}`" class="primary-link">
              {{ item.id }}
            </a>
          </span>

          <div class="cell">
            <a :href="`/domains/${item.id}`" class="primary-link">
              {{ item.asset_definitions.length }}
            </a>
          </div>

          <span class="cell">
            <a :href="`/domains/${item.id}`" class="primary-link">
              {{ item.accounts.length }}
            </a>
          </span>
        </div>
      </template>

      <template #mobile-card="{ item }: { item: Domain }">
        <div class="domains-list-page__mobile-card">
          <div class="domains-list-page__mobile-row">
            <span class="h-sm domains-list-page__mobile-label">{{ $t('name') }}</span>
            <a :href="`/domains/${item.id}`" class="primary-link">
              {{ item.id }}
            </a>
          </div>

          <div class="domains-list-page__mobile-row">
            <span class="h-sm domains-list-page__mobile-label">{{ $t('assets') }}</span>
            <a :href="`/domains/${item.id}`" class="primary-link">
              {{ item.asset_definitions.length }}
            </a>
          </div>

          <div class="domains-list-page__mobile-row">
            <span class="h-sm domains-list-page__mobile-label">{{ $t('accounts') }}</span>
            <a :href="`/domains/${item.id}`" class="primary-link">
              {{ item.accounts.length }}
            </a>
          </div>
        </div>
      </template>
    </BaseTable>
  </BaseContentBlock>
</template>

<script setup lang="ts">
import BaseContentBlock from '@/components/BaseContentBlock.vue';
import BaseTable from '@/components/BaseTable.vue';
import { useTable } from '@/composables/table';
import { fetchDomains } from '@/http';

const table = useTable(fetchDomains);
table.fetch();
</script>

<style lang="scss">
@import 'styles';

.domains-list-page {
  &__row {
    width: 100%;
    display: grid;
    grid-template-columns: 2fr 1fr 1fr;
  }

  &__mobile-card {
    padding: size(2);
  }

  &__mobile-row {
    display: flex;
    align-items: center;
  }

  &__mobile-label {
    text-align: right;
    width: 80px;
    padding: size(1);
    margin-right: size(3);
  }
}
</style>
