<template>
  <BaseContentBlock :title="$t('blocks')" class="blocks-list-page">
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
        <div class="blocks-list-page__row">
          <span class="h-sm cell">{{ $t('height') }}</span>
          <span class="h-sm cell">{{ $t('age') }}</span>
          <span class="h-sm cell">{{ $t('hash') }}</span>
          <span class="h-sm cell">{{ $t('transaction') }}</span>
          <span class="h-sm cell">{{ $t('validators') }}</span>
        </div>
      </template>
    </BaseTable>
  </BaseContentBlock>
</template>

<script setup lang="ts">
import BaseContentBlock from '@/components/BaseContentBlock.vue';
import BaseTable from '@/components/BaseTable.vue';
import { useTable } from '@/composables/table';
import { fetchFakeData } from '@/http';

const table = useTable(fetchFakeData);
table.fetch();
</script>

<style lang="scss">
.blocks-list-page {
  &__row {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 2fr 5fr 1fr 1fr auto;
  }
}
</style>
