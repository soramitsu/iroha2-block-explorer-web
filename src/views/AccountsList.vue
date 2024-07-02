<template>
  <BaseContentBlock
    :title="$t('accounts')"
    class="accounts-list-page"
  >
    <BaseTable
      :loading="accountsStore.isLoading"
      :items="accountsStore.accounts"
      container-class="accounts-list-page__container"
      :table="table"
    >
      <template #header>
        <div class="accounts-list-page__row">
          <span class="h-sm cell">{{ $t('address') }}</span>
          <span class="h-sm cell">{{ $t('cryptos') }}</span>
          <span class="h-sm cell">{{ $t('nfts') }}</span>
        </div>
      </template>

      <template #row="{ item }">
        <div class="accounts-list-page__row">
          <BaseHash
            :hash="item.id"
            :link="`/accounts/${item.id}`"
            type="full"
            copy
            class="cell"
          />

          <div class="cell row-text">
            {{ accountModel.countCryptos(item) }}
          </div>

          <div class="cell row-text">
            {{ accountModel.countNFTs(item) }}
          </div>
        </div>
      </template>

      <template #mobile-card="{ item }">
        <div class="accounts-list-page__mobile-card">
          <div class="accounts-list-page__mobile-row">
            <span class="h-sm accounts-list-page__mobile-label">{{ $t('address') }}</span>
            <BaseHash
              :hash="item.id"
              :link="`/accounts/${item.id}`"
              type="short"
              copy
            />
          </div>

          <div class="accounts-list-page__mobile-row">
            <span class="h-sm accounts-list-page__mobile-label">{{ $t('cryptos') }}</span>
            <div class="row-text">
              {{ accountModel.countCryptos(item) }}
            </div>
          </div>

          <div class="accounts-list-page__mobile-row">
            <span class="h-sm accounts-list-page__mobile-label">{{ $t('nfts') }}</span>
            <div class="row-text">
              {{ accountModel.countNFTs(item) }}
            </div>
          </div>
        </div>
      </template>
    </BaseTable>
  </BaseContentBlock>
</template>

<script setup lang="ts">
import { useTable } from '@/core/composables/useTable';
import { accountModel } from '@/core/utils/account';
import BaseHash from '@/core/components/BaseHash.vue';
import BaseTable from '@/core/components/BaseTable.vue';
import BaseContentBlock from '@/core/components/BaseContentBlock.vue';
import { useAccountsStore } from '@/stores/accounts';
import { onMounted } from 'vue';
import { useErrorHandlers } from '@/core/composables/useErrorHandlers';

const { handleUnknownError } = useErrorHandlers();

const accountsStore = useAccountsStore();

const table = useTable(accountsStore.fetchAccounts);

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
