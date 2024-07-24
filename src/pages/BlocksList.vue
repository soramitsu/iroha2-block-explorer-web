<template>
  <BaseContentBlock
    :title="$t('blocks')"
    class="blocks-list-page"
  >
    <BaseTable
      :loading="table.loading.value"
      :pagination="table.pagination"
      :items="table.items.value"
      container-class="blocks-list-page__container"
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
          <BaseLink
            :to="`/blocks/${item.height}`"
            class="cell"
          >
            {{ item.height }}
          </BaseLink>

          <div class="cell">
            <time class="row-text">{{ format(item.timestamp) }}</time>
          </div>

          <BaseHash
            :hash="item.block_hash"
            :link="`/blocks/${item.height}`"
            type="full"
            copy
            class="cell"
          />

          <div class="cell row-text">
            {{ item.transactions }}
          </div>
        </div>
      </template>

      <template #mobile-card="{ item }: { item: Block }">
        <div class="blocks-list-page__mobile-card">
          <div class="blocks-list-page__mobile-row">
            <span class="h-sm blocks-list-page__mobile-label">{{ $t('height') }}</span>

            <BaseLink :to="`/blocks/${item.height}`">
              {{ item.height }}
            </BaseLink>
          </div>

          <div class="blocks-list-page__mobile-row">
            <span class="h-sm blocks-list-page__mobile-label">{{ $t('age') }}</span>
            <time class="row-text">{{ format(item.timestamp) }}</time>
          </div>

          <div class="blocks-list-page__mobile-row">
            <span class="h-sm blocks-list-page__mobile-label">{{ $t('hash') }}</span>

            <BaseHash
              :hash="item.block_hash"
              :link="`/blocks/${item.height}`"
              type="short"
              copy
            />
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
import BaseLink from '@/shared/ui/components/BaseLink.vue';
import { useTable } from '@/shared/lib/table';
import { http } from '@/shared/api';
import { format } from '@/shared/lib/time';
import BaseHash from '@/shared/ui/components/BaseHash.vue';
import BaseTable from '@/shared/ui/components/BaseTable.vue';
import BaseContentBlock from '@/shared/ui/components/BaseContentBlock.vue';

const table = useTable(http.fetchBlocks);
table.fetch();
</script>

<style lang="scss">
@import '@/shared/ui/styles/main';

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
