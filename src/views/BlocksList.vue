<template>
  <BaseContentBlock
    :title="$t('blocks')"
    class="blocks-list-page"
  >
    <BaseTable
      :loading="blocksStore.isLoading"
      :items="blocksStore.blocks"
      container-class="blocks-list-page__container"
      :table="table"
    >
      <template #header>
        <div class="blocks-list-page__row">
          <span class="h-sm cell">{{ $t('height') }}</span>
          <span class="h-sm cell">{{ $t('age') }}</span>
          <span class="h-sm cell">{{ $t('hash') }}</span>
          <span class="h-sm cell">{{ $t('transaction') }}</span>
        </div>
      </template>

      <template #row="{ item }">
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

      <template #mobile-card="{ item }">
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
import BaseLink from '@/core/components/BaseLink.vue';
import { useTable } from '@/core/composables/useTable';
import { format } from '@/core/utils/time';
import BaseHash from '@/core/components/BaseHash.vue';
import BaseTable from '@/core/components/BaseTable.vue';
import BaseContentBlock from '@/core/components/BaseContentBlock.vue';
import { useBlocksStore } from '@/stores/blocks';
import { onMounted } from 'vue';
import { useErrorHandlers } from '@/core/composables/useErrorHandlers';

const { handleUnknownError } = useErrorHandlers();

const blocksStore = useBlocksStore();
const table = useTable(blocksStore.fetchBlocks);

onMounted(async () => {
  try {
    await table.fetch();
  } catch (e) {
    handleUnknownError(e);
  }
});
</script>

<style lang="scss">
@import '@/styles/main';

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
