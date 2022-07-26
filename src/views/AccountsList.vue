<template>
  <BaseContentBlock :title="$t('accounts')" class="accounts-list-page">
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
        <div class="accounts-list-page__row">
          <span class="h-sm cell">{{ $t('address') }}</span>
          <span class="h-sm cell">{{ $t('balance') }}</span>
          <span class="h-sm cell">{{ $t('assets') }}</span>
        </div>
      </template>

      <template #row="{ item }: { item: Account }">
        <div class="accounts-list-page__row">
          <span class="cell">
            <BaseCopyRow :name="$t('address')" :value="item.id">
              <a :href="`/accounts/${item.id}`" class="primary-link">
                {{ item.id }}
              </a>
            </BaseCopyRow>
          </span>

          <span class="cell">-</span>

          <div class="cell">
            <a :href="`/accounts/${item.id}`" class="primary-link">
              {{ item.assets.length }}
            </a>
          </div>
        </div>
      </template>

      <template #mobile-card="{ item }: { item: Account }">
        <div class="accounts-list-page__mobile-card">
          <div class="accounts-list-page__mobile-row">
            <span class="h-sm accounts-list-page__mobile-label">{{ $t('address') }}</span>
            <BaseCopyRow :name="$t('address')" :value="item.id">
              <a :href="`/accounts/${item.id}`" class="primary-link">
                <ShortHash :hash="item.id" />
              </a>
            </BaseCopyRow>
          </div>

          <div class="accounts-list-page__mobile-row">
            <span class="h-sm accounts-list-page__mobile-label">{{ $t('balance') }}</span>
            -
          </div>

          <div class="accounts-list-page__mobile-row">
            <span class="h-sm accounts-list-page__mobile-label">{{ $t('assets') }}</span>
            <a :href="`/accounts/${item.id}`" class="primary-link">
              {{ item.assets.length }}
            </a>
          </div>
        </div>
      </template>
    </BaseTable>
  </BaseContentBlock>
</template>

<script setup lang="ts">
import BaseContentBlock from '@/components/BaseContentBlock.vue';
import BaseCopyRow from '@/components/BaseCopyRow.vue';
import BaseTable from '@/components/BaseTable.vue';
import ShortHash from '@/components/ShortHash.vue';
import { useTable } from '@/composables/table';
import { fetchAccounts } from '@/http';

const table = useTable(fetchAccounts);
table.fetch();
</script>

<style lang="scss">
@import 'styles';

.accounts-list-page {
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
