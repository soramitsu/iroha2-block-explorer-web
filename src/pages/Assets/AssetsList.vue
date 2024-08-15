<template>
  <BaseContentBlock
    :title="$t('assets')"
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
            :to="`/assets/${item.definition_id}`"
            class="cell"
          >
            {{ item.definition_id.split('#')[0] }}
          </BaseLink>

          <BaseLink
            :to="`/domains/${item.definition_id.split('#')[1]}`"
            class="cell"
          >
            {{ item.definition_id.split('#')[1] }}
          </BaseLink>

          <div class="cell row-text">
            <template v-if="item.value.t === 'Store'">
              🔑: {{ Object.keys(item.value.c).length }}
            </template>
            <template v-else>
              {{ item.value.c }}
            </template>
          </div>
        </div>
      </template>

      <template #mobile-card="{ item }">
        <div class="assets-list-page__mobile-card">
          <div class="assets-list-page__mobile-row">
            <span class="h-sm assets-list-page__mobile-label">{{ $t('name') }}</span>

            <BaseLink :to="`/assets/${item.definition_id}`">
              {{ item.definition_id.split('#')[0] }}
            </BaseLink>
          </div>

          <div class="assets-list-page__mobile-row">
            <span class="h-sm assets-list-page__mobile-label">{{ $t('domain') }}</span>

            <BaseLink :to="`/domains/${item.definition_id.split('#')[1]}`">
              {{ item.definition_id.split('#')[1] }}
            </BaseLink>
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
import { http } from '@/shared/api';
import { useTable } from '@/shared/lib/table';
import BaseLink from '@/shared/ui/components/BaseLink.vue';
import BaseTable from '@/shared/ui/components/BaseTable.vue';
import BaseContentBlock from '@/shared/ui/components/BaseContentBlock.vue';

const table = useTable(http.fetchAssets);
table.fetch();
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
