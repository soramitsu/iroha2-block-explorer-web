<template>
  <BaseContentBlock title="Domains" class="domains-list-page">
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
          <span class="h-sm cell">Address</span>
          <span class="h-sm cell">Cryptos</span>
          <span class="h-sm cell">Assets</span>
        </div>
      </template>

      <template #row="{ item }: { item: Domain }">
        <!-- <div class="domains-list-page__row">
          <span class="cell">
            <BaseCopyRow name="Token" :value="item.id">
              <a :href="`/accounts/${item.id}}`" class="primary-link">
                {{ item.id }}
              </a>
            </BaseCopyRow>
          </span>

          <span class="cell">-</span>

          <div class="cell">
            <a :href="`/accounts/${item.id}}`" class="primary-link">
              {{ item.assets.length }}
            </a>
          </div>
        </div> -->
      </template>
    </BaseTable>
  </BaseContentBlock>
</template>

<script setup lang="ts">
import BaseContentBlock from '@/components/BaseContentBlock.vue';
import BaseCopyRow from '@/components/BaseCopyRow.vue';
import BaseTable from '@/components/BaseTable.vue';
import { useTable } from '@/composables/table';
import { fetchDomains } from '@/http';

const table = useTable(fetchDomains);
table.fetch();
</script>

<style lang="scss">
.domains-list-page {
  &__row {
    width: 100%;
    display: grid;
    grid-template-columns: 2fr 1fr 1fr;
  }
}
</style>
