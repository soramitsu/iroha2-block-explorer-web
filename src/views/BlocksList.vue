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
        </div>
      </template>

      <template #row="{ item }: { item: Block }">
        <div class="blocks-list-page__row">
          <span class="cell">
            <a :href="`/blocks/${item.height}`" class="primary-link">
              {{ item.height }}
            </a>
          </span>

          <div class="cell">
            <time class="row-text">{{ format(item.timestamp) }}</time>
          </div>

          <span class="cell">
            <BaseCopyRow :name="$t('hash')" :value="item.block_hash">
              <a :href="`/blocks/${item.height}`" class="primary-link">
                {{ item.block_hash }}
              </a>
            </BaseCopyRow>
          </span>

          <div class="cell row-text">{{ item.transactions }}</div>
        </div>
      </template>

      <template #mobile-card="{ item }: { item: Block }">
        <div class="blocks-list-page__mobile-card">
          <div class="blocks-list-page__mobile-row">
            <span class="h-sm blocks-list-page__mobile-label">{{ $t('height') }}</span>
            <a :href="`/blocks/${item.height}`" class="primary-link">
              {{ item.height }}
            </a>
          </div>

          <div class="blocks-list-page__mobile-row">
            <span class="h-sm blocks-list-page__mobile-label">{{ $t('age') }}</span>
            <time class="row-text">{{ format(item.timestamp) }}</time>
          </div>

          <div class="blocks-list-page__mobile-row">
            <span class="h-sm blocks-list-page__mobile-label">{{ $t('hash') }}</span>
            <BaseCopyRow :name="$t('hash')" :value="item.block_hash">
              <a :href="`/blocks/${item.height}`" class="primary-link">
                <ShortHash :hash="item.block_hash" />
              </a>
            </BaseCopyRow>
          </div>

          <div class="blocks-list-page__mobile-row">
            <span class="h-sm blocks-list-page__mobile-label">{{ $t('transactions') }}</span>
            <span class="row-text">{{ item.transactions }}</span>
          </div>
        </div>
      </template>
    </BaseTable>
  </BaseContentBlock>
</template>

<script setup lang="ts">
import BaseContentBlock from '@/components/BaseContentBlock.vue';
import BaseTable from '@/components/BaseTable.vue';
import BaseCopyRow from '@/components/BaseCopyRow.vue';
import ShortHash from '@/components/ShortHash.vue';
import { useTable } from '@/composables/table';
import { fetchBlocks } from '@/http';
import { format } from '@/lib/time';

const table = useTable(fetchBlocks);
table.fetch();
</script>

<style lang="scss">
@import 'styles';

.blocks-list-page {
  &__row {
    width: 100%;
    display: grid;
    grid-template-columns: 130px 220px 640px auto;
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
