<template>
  <BaseContentBlock
    :title="$t('blocks.blocks')"
    class="blocks-list-page"
  >
    <BaseTable
      :loading="table.loading.value"
      :pagination="table.pagination"
      :items="table.items.value"
      container-class="blocks-list-page__container"
      reversed
      @next-page="table.nextPage()"
      @prev-page="table.prevPage()"
      @set-page="table.setPage($event)"
      @set-size="table.setSize($event)"
    >
      <template #header>
        <div class="blocks-list-page__row">
          <span class="h-sm cell">{{ $t('blocks.height') }}</span>
          <span class="h-sm cell">{{ $t('blocks.age') }}</span>
          <span class="h-sm cell">{{ $t('blocks.hash') }}</span>
          <span class="h-sm cell">{{ $t('transactions.transactions') }}</span>
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
            <time class="row-text">{{ defaultFormat(item.created_at) }}</time>
          </div>

          <BaseHash
            :hash="item.hash"
            :link="`/blocks/${item.hash}`"
            type="full"
            copy
            class="cell"
          />

          <div class="cell row-text">
            {{ $t('blocks.totalAndRejectedTransactions', [item.transactions_total, item.transactions_rejected]) }}
          </div>
        </div>
      </template>

      <template #mobile-card="{ item }">
        <div class="blocks-list-page__mobile-card">
          <div class="blocks-list-page__mobile-row">
            <span class="h-sm blocks-list-page__mobile-label">{{ $t('blocks.height') }}</span>

            <BaseLink :to="`/blocks/${item.height}`">
              {{ item.height }}
            </BaseLink>
          </div>

          <div class="blocks-list-page__mobile-row">
            <span class="h-sm blocks-list-page__mobile-label">{{ $t('blocks.age') }}</span>
            <time class="row-text">{{ defaultFormat(item.created_at) }}</time>
          </div>

          <div class="blocks-list-page__mobile-row">
            <span class="h-sm blocks-list-page__mobile-label">{{ $t('blocks.hash') }}</span>

            <BaseHash
              :hash="item.hash"
              :link="`/blocks/${item.height}`"
              type="short"
              copy
            />
          </div>

          <div class="blocks-list-page__mobile-row">
            <span class="h-sm blocks-list-page__mobile-label">{{ $t('transactions.transactions') }}</span>
            <span class="row-text">{{
              $t('blocks.totalAndRejectedTransactions', [item.transactions_total, item.transactions_rejected])
            }}</span>
          </div>
        </div>
      </template>
    </BaseTable>
  </BaseContentBlock>
</template>

<script setup lang="ts">
import BaseLink from '@/shared/ui/components/BaseLink.vue';
import { useTable } from '@/shared/lib/table';
import * as http from '@/shared/api';
import { defaultFormat } from '@/shared/lib/time';
import BaseHash from '@/shared/ui/components/BaseHash.vue';
import BaseTable from '@/shared/ui/components/BaseTable.vue';
import BaseContentBlock from '@/shared/ui/components/BaseContentBlock.vue';
import { useErrorHandlers } from '@/shared/ui/composables/useErrorHandlers';
import { onMounted } from 'vue';

const table = useTable(http.fetchBlocks, { reversed: true });

const { handleUnknownError } = useErrorHandlers();

onMounted(async () => {
  try {
    await table.fetch();
  } catch (e) {
    handleUnknownError(e);
  }
});
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

  hr {
    display: none;
  }
}
</style>
