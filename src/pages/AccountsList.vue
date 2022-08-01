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
          <span class="h-sm cell">{{ $t('cryptos') }}</span>
          <span class="h-sm cell">{{ $t('nfts') }}</span>
        </div>
      </template>

      <template #row="{ item }: { item: Account }">
        <div class="accounts-list-page__row">
          <div class="cell">
            <BaseCopyRow :name="$t('address')" :value="item.id">
              <a :href="`/accounts/${item.id}`" class="primary-link">
                {{ item.id }}
              </a>
            </BaseCopyRow>
          </div>

          <div class="cell row-text">{{ accountModel.countCryptos(item) }}</div>

          <div class="cell row-text">{{ accountModel.countNFTs(item) }}</div>
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
            <span class="h-sm accounts-list-page__mobile-label">{{ $t('cryptos') }}</span>
            <div class="row-text">{{ accountModel.countCryptos(item) }}</div>
          </div>

          <div class="accounts-list-page__mobile-row">
            <span class="h-sm accounts-list-page__mobile-label">{{ $t('nfts') }}</span>
            <div class="row-text">{{ accountModel.countNFTs(item) }}</div>
          </div>
        </div>
      </template>
    </BaseTable>
  </BaseContentBlock>
</template>

<script setup lang="ts">
import BaseContentBlock from '~base/BaseContentBlock.vue';
import BaseCopyRow from '~base/BaseCopyRow.vue';
import BaseTable from '~base/BaseTable.vue';
import ShortHash from '~base/BaseShortHash.vue';
import { useTable } from '~shared/model/table';
import { fetchAccounts } from '~shared/api/http';
import { accountModel } from '~entities/account';

const table = useTable(fetchAccounts);
table.fetch();
</script>

<style lang="scss">
@import 'styles';

.accounts-list-page {
  &__row {
    width: 100%;
    display: grid;
    grid-template-columns: 3fr 1fr 1fr;
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
