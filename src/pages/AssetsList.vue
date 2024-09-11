<template>
  <BaseContentBlock
    :title="$t('assets.assets')"
    class="assets-list-page"
  >
    <BaseTable
      :loading="table.loading.value"
      :pagination="table.pagination"
      :items="table.items.value"
      container-class="assets-list-page__container"
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

      <template #row="{ item }">
        <div class="assets-list-page__row">
          <BaseLink
            :to="`/assets/${item.id.toString()}`"
            class="cell"
          >
            {{ item.id.definition.name }}
          </BaseLink>

          <BaseLink
            :to="`/domains/${item.id.definition.name}`"
            class="cell"
          >
            {{ item.id.definition.domain }}
          </BaseLink>

          <div class="cell row-text">
            <template v-if="item.value.kind === 'Store'">
              🔑: {{ Object.keys(item.value.metadata).length }}
            </template>
            <template v-else>
              {{ item.value.value }}
            </template>
          </div>
        </div>
      </template>

      <template #mobile-card="{ item }">
        <div class="assets-list-page__mobile-card">
          <div class="assets-list-page__mobile-row">
            <span class="h-sm assets-list-page__mobile-label">{{ $t('name') }}</span>

            <BaseLink :to="`/assets/${item.id}`">
              {{ item.id.definition.name }}
            </BaseLink>
          </div>

          <div class="assets-list-page__mobile-row">
            <span class="h-sm assets-list-page__mobile-label">{{ $t('domain') }}</span>

            <BaseLink :to="`/domains/${item.id.definition.domain}`">
              {{ item.id.definition.domain }}
            </BaseLink>
          </div>

          <div class="assets-list-page__mobile-row">
            <span class="h-sm assets-list-page__mobile-label">{{ $t('total') }}</span>
            <template v-if="item.value.kind === 'Store'">
              <span class="row-text">🔑: {{ Object.keys(item.value.metadata).length }}</span>
            </template>
            <template v-else>
              <span class="row-text">{{ item.value.value }}</span>
            </template>
          </div>
        </div>
      </template>
    </BaseTable>
  </BaseContentBlock>
</template>

<script setup lang="ts">
import * as http from '@/shared/api';
import { useTable } from '@/shared/lib/table';
import BaseLink from '@/shared/ui/components/BaseLink.vue';
import BaseTable from '@/shared/ui/components/BaseTable.vue';
import BaseContentBlock from '@/shared/ui/components/BaseContentBlock.vue';
import { useErrorHandlers } from '@/shared/ui/composables/useErrorHandlers';
import { onMounted } from 'vue';

const table = useTable(http.fetchAssets);
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

.assets-list-page {
  &__row {
    width: 100%;
    display: grid;
    grid-template-columns: 2fr 2fr 1fr;
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
}
</style>
