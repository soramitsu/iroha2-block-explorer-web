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
          <span class="h-sm cell">{{ $t('address') }}</span>
          <span class="h-sm cell">{{ $t('cryptos') }}</span>
          <span class="h-sm cell">{{ $t('assets') }}</span>
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
.domains-list-page {
  &__row {
    width: 100%;
    display: grid;
    grid-template-columns: 2fr 1fr 1fr;
  }
}
</style>
