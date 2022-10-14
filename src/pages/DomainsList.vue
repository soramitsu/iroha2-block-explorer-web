<template>
  <BaseContentBlock :title="$t('domains')" class="domains-list-page">
    <BaseTable
      :loading="table.loading.value"
      :pagination="table.pagination"
      :items="table.items.value"
      container-class="domains-list-page__container"
      @next-page="table.nextPage()"
      @prev-page="table.prevPage()"
      @set-page="table.setPage($event)"
      @set-size="table.setSize($event)"
    >
      <template #header>
        <div class="domains-list-page__row">
          <span class="h-sm cell">{{ $t('name') }}</span>
          <span class="h-sm cell">{{ $t('cryptos') }}</span>
          <span class="h-sm cell">{{ $t('nfts') }}</span>
          <span class="h-sm cell">{{ $t('accounts') }}</span>
        </div>
      </template>

      <template #row="{ item }: { item: Domain }">
        <div class="domains-list-page__row">
          <BaseLink :to="`/domains/${item.id}`" class="cell">{{ item.id }}</BaseLink>

          <div class="cell row-text">{{ domainModel.countCryptos(item) }}</div>

          <div class="cell row-text">{{ domainModel.countNFTs(item) }}</div>

          <span class="cell row-text">{{ item.accounts.length }}</span>
        </div>
      </template>

      <template #mobile-card="{ item }: { item: Domain }">
        <div class="domains-list-page__mobile-card">
          <div class="domains-list-page__mobile-row">
            <span class="h-sm domains-list-page__mobile-label">{{ $t('name') }}</span>

            <BaseLink :to="`/domains/${item.id}`">{{ item.id }}</BaseLink>
          </div>

          <div class="domains-list-page__mobile-row">
            <span class="h-sm domains-list-page__mobile-label">{{ $t('cryptos') }}</span>
            <span class="row-text">{{ domainModel.countCryptos(item) }}</span>
          </div>

          <div class="domains-list-page__mobile-row">
            <span class="h-sm domains-list-page__mobile-label">{{ $t('nfts') }}</span>
            <span class="row-text">{{ domainModel.countNFTs(item) }}</span>
          </div>

          <div class="domains-list-page__mobile-row">
            <span class="h-sm domains-list-page__mobile-label">{{ $t('accounts') }}</span>
            <span class="row-text">{{ item.accounts.length }}</span>
          </div>
        </div>
      </template>
    </BaseTable>
  </BaseContentBlock>
</template>

<script setup lang="ts">
import BaseContentBlock from '~base/BaseContentBlock.vue';
import BaseTable from '~base/BaseTable.vue';
import BaseLink from '~shared/ui/components/BaseLink.vue';
import { useTable } from '~shared/lib/table';
import { http } from '~shared/api';
import { domainModel } from '~entities/domain';

const table = useTable(http.fetchDomains);
table.fetch();
</script>

<style lang="scss">
@import 'styles';

.domains-list-page {
  &__row {
    width: 100%;
    display: grid;
    grid-template-columns: 3fr 1fr 1fr 1fr;
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
