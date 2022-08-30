<template>
  <BaseContentBlock :title="$t('assets')" class="assets-list-page">
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
        <div class="assets-list-page__row">
          <span class="h-sm cell">{{ $t('name') }}</span>
          <span class="h-sm cell">{{ $t('domain') }}</span>
          <span class="h-sm cell">{{ $t('total') }}</span>
        </div>
      </template>

      <template #row="{ item }: { item: Asset }">
        <div class="assets-list-page__row">
          <div class="cell">
            <a :href="`/assets/${item.definition_id}`" class="primary-link">
              {{ item.definition_id.split('#')[0] }}
            </a>
          </div>

          <div class="cell">
            <a :href="`/domains/${item.definition_id.split('#')[1]}`" class="primary-link">
              {{ item.definition_id.split('#')[1] }}
            </a>
          </div>

          <div class="cell row-text">{{ item.value.c }}</div>
        </div>
      </template>

      <template #mobile-card="{ item }: { item: Asset }">
        <div class="assets-list-page__mobile-card">
          <div class="assets-list-page__mobile-row">
            <span class="h-sm assets-list-page__mobile-label">{{ $t('name') }}</span>
            <a :href="`/assets/${item.definition_id}`" class="primary-link">
              {{ item.definition_id.split('#')[0] }}
            </a>
          </div>

          <div class="assets-list-page__mobile-row">
            <span class="h-sm assets-list-page__mobile-label">{{ $t('domain') }}</span>
            <a :href="`/domains/${item.definition_id.split('#')[1]}`" class="primary-link">
              {{ item.definition_id.split('#')[1] }}
            </a>
          </div>

          <div class="assets-list-page__mobile-row">
            <span class="h-sm assets-list-page__mobile-label">{{ $t('total') }}</span>
            <span class="row-text">{{ item.value.c }}</span>
          </div>
        </div>
      </template>
    </BaseTable>
  </BaseContentBlock>
</template>

<script setup lang="ts">
import BaseContentBlock from '~base/BaseContentBlock.vue';
import BaseTable from '~base/BaseTable.vue';
import { useTable } from '~shared/lib/table';
import { fetchAssets } from '~shared/api/http';

const table = useTable(fetchAssets);
table.fetch();
</script>

<style lang="scss">
@import 'styles';

.assets-list-page {
  &__row {
    width: 100%;
    display: grid;
    grid-template-columns: 2fr 2fr 1fr;
    justify-content: start;
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
