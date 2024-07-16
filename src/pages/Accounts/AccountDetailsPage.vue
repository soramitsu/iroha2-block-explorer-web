<script setup lang="ts">
import { useRouter } from 'vue-router';
import { computed, onMounted, ref } from 'vue';
import { http } from '@/shared/api';
import BaseContentBlock from '@/shared/ui/components/BaseContentBlock.vue';
import BaseTabs from '@/shared/ui/components/BaseTabs.vue';
import DataField from '@/shared/ui/components/DataField.vue';
import { useTable } from '@/shared/lib/table';
import { formatMoney, numberFormatter } from '@/shared/utils/money-formatters';
import BaseTable from '@/shared/ui/components/BaseTable.vue';
import type { TableAsset } from '@/pages/Accounts/types';
import { getFakeAssets } from '@/pages/Accounts/utils';
import BaseLink from '@/shared/ui/components/BaseLink.vue';
import {
  type filterTransactionsModel as ftm,
  TransactionStatusFilter,
  TransactionTypeFilter,
} from '@/features/filter-transactions';
import BaseHash from '@/shared/ui/components/BaseHash.vue';
import TransactionStatus from '@/entities/transaction/TransactionStatus.vue';
import { transactionModel } from '@/entities/transaction';
import { computedEager, useWindowSize } from '@vueuse/core';
import { format } from '@/shared/lib/time';
import { adaptiveTransactionTypeOptions, assetsItems } from '@/pages/Accounts/consts';
import BaseLoading from '@/shared/ui/components/BaseLoading.vue';
import { useErrorHandlers } from '@/shared/ui/composables/useErrorHandlers';

const router = useRouter();

const { handleUnknownError } = useErrorHandlers();

const HASH_BREAKPOINT = 1200;
const { width } = useWindowSize();

const hashType = computedEager(() => (width.value < HASH_BREAKPOINT ? 'short' : 'medium'));

const accountId = computed(() => String(router.currentRoute.value.params['id']));

const account = ref<Account | null>(null);
const isFetchingAccount = ref(false);

onMounted(async () => {
  try {
    isFetchingAccount.value = true;
    account.value = await http.fetchAccount(accountId.value);

    if (account.value) {
      await Promise.all([assetsTable.fetch(), transactionsTable.fetch()]);
    }
  } catch (e) {
    handleUnknownError(e);
  } finally {
    isFetchingAccount.value = false;
  }
});

const assetsFilter = ref('cryptos');

// use account's assets from payload instead or replace with fetching account's assets method
const assetsTable = useTable(getFakeAssets);

const transactionStatus = ref<ftm.TransactionStatus>(null);
const transactionType = ref<ftm.DefaultTransactionTypeTabs>('transactions');

// use account's transactions from payload instead or replace with fetching account's transactions method
const transactionsTable = useTable(transactionModel.fetchList);

// replace with account's data
const accountAlias = ref('genesis@genesis.com"');
const accountSignature = ref('0xF9450D254A66abs3fsf334vds4341cdsas06b30Cfa9c6e7AE1B7598c7172');

const accountTotalValue = ref(875123);
const accountReservedValue = ref(1234);
const accountLockedValue = ref(543);
</script>

<template>
  <div class="account-details">
    <div class="account-details__personal">
      <BaseContentBlock
        :title="$t('accountDetails.accountInformation')"
        class="account-details__personal-information"
      >
        <template #default>
          <div
            v-if="isFetchingAccount"
            class="account-details__personal-information_loading"
          >
            <BaseLoading />
          </div>
          <div v-else>
            <div class="account-details__personal-information-row">
              <DataField
                title="Account ID"
                :hash="accountId"
                copy
              />
              <DataField
                title="Alias"
                :hash="accountAlias"
                link="/"
              />
            </div>

            <div class="account-details__personal-information-row">
              <DataField
                title="Signature"
                :hash="accountSignature"
              />
            </div>
          </div>
        </template>
      </BaseContentBlock>

      <BaseContentBlock
        :title="$t('accountDetails.accountAssets')"
        class="account-details__personal-assets"
      >
        <template #header-action>
          <BaseTabs
            v-model="assetsFilter"
            :items="assetsItems"
          />
        </template>

        <template #default>
          <div class="account-details__personal-assets-table-header">
            <DataField
              :value="formatMoney(accountTotalValue)"
              bold
              :title="$t('accountDetails.totalValue')"
            />
            <DataField
              :value="formatMoney(accountReservedValue)"
              :title="$t('accountDetails.reserved')"
            />
            <DataField
              :value="formatMoney(accountLockedValue)"
              :title="$t('accountDetails.locked')"
            />
          </div>

          <BaseTable
            :table="assetsTable"
            container-class="account-details__personal-assets-list"
            breakpoint="960"
            disabled-pagination
          >
            <template #header>
              <div class="account-details__personal-assets-list-row">
                <span class="h-sm">{{ $t('accountDetails.tokens') }}</span>
                <span class="h-sm">{{ $t('accountDetails.amount') }}</span>
                <span class="h-sm">{{ $t('accountDetails.price') }}</span>
                <span class="h-sm">{{ $t('accountDetails.value') }}</span>
              </div>
            </template>

            <template #row="{ item }: { item: TableAsset }">
              <div class="account-details__personal-assets-list-row">
                <div class="account-details__personal-assets-list-row-asset">
                  <div class="account-details__personal-assets-list-row-asset-logo">
                    <component :is="item.icon" />
                  </div>

                  <div class="account-details__personal-assets-list-row-asset-name">
                    <span class="h-sm">{{ item.symbol }}</span>
                    <BaseLink :to="`/assets/${item.symbol}`">
                      {{ item.name }}
                    </BaseLink>
                  </div>
                </div>

                <div class="account-details__personal-assets-list-row-amount row-text">
                  <span>{{ numberFormatter(item.amount) + ' ' + item.symbol.toUpperCase() }}</span>
                </div>

                <div class="account-details__personal-assets-list-row-price row-text">
                  <span>{{ formatMoney(item.price) }}</span>
                </div>

                <div class="account-details__personal-assets-list-row-value row-text">
                  <span>{{ formatMoney(item.amount * item.price) }}</span>
                </div>
              </div>
            </template>

            <template #mobile-card="{ item }: { item: TableAsset }">
              <div class="account-details__personal-assets-mobile-list-row">
                <div class="account-details__personal-assets-mobile-list-row-asset">
                  <span class="h-sm">{{ $t('accountDetails.tokens') }}</span>

                  <div>
                    <div class="account-details__personal-assets-mobile-list-row-asset-logo">
                      <component :is="item.icon" />
                    </div>

                    <div class="account-details__personal-assets-mobile-list-row-asset-name">
                      <span class="h-sm">{{ item.symbol }}</span>
                      <BaseLink to="/">
                        {{ item.name }}
                      </BaseLink>
                    </div>
                  </div>
                </div>

                <div class="account-details__personal-assets-mobile-list-row-amount row-text">
                  <span class="h-sm">{{ $t('accountDetails.amount') }}</span>
                  <span>{{ numberFormatter(item.amount) + ' ' + item.symbol.toUpperCase() }}</span>
                </div>

                <div class="account-details__personal-assets-mobile-list-row-price row-text">
                  <span class="h-sm">{{ $t('accountDetails.price') }}</span>
                  <span>{{ formatMoney(item.price) }}</span>
                </div>

                <div class="account-details__personal-assets-mobile-list-row-value row-text">
                  <span class="h-sm">{{ $t('accountDetails.value') }}</span>
                  <span>{{ formatMoney(item.amount * item.price) }}</span>
                </div>
              </div>
            </template>
          </BaseTable>
        </template>
      </BaseContentBlock>
    </div>

    <BaseContentBlock
      :title="$t('accountDetails.accountTransactions')"
      class="account-details__transactions"
    >
      <div class="account-details__transactions-filters content-row">
        <TransactionTypeFilter
          v-model="transactionType"
          class="account-details__transactions-type"
          :adaptive-options="adaptiveTransactionTypeOptions"
          default-options
        />
        <TransactionStatusFilter
          v-model="transactionStatus"
          class="account-details__transactions-status"
        />
      </div>

      <BaseTable
        :table="transactionsTable"
        container-class="account-details__transactions-container"
        disabled-pagination
      >
        <template #row="{ item }: { item: Transaction }">
          <div class="account-details__transactions-row">
            <TransactionStatus
              type="tooltip"
              class="account-details__transactions-row-icon"
              :committed="!!item.rejection_reason"
            />

            <div class="account-details__transactions-row-column">
              <div class="account-details__transactions-row-column-label row-text">
                {{ $t('accountDetails.transactionID') }}
              </div>

              <BaseHash
                :hash="item.hash"
                :type="hashType"
                :link="'/transactions/' + item.hash"
                copy
              />
            </div>

            <span class="account-details__transactions-row-column">
              <span class="account-details__transactions-row-column-time row-text">{{
                format(item.payload.creation_time)
              }}</span>
            </span>
          </div>
        </template>
      </BaseTable>
    </BaseContentBlock>
  </div>
</template>

<style lang="scss">
@import '@/shared/ui/styles/main';

.account-details {
  display: grid;

  @include xs {
    padding: 0 size(2);
    grid-gap: size(1);
  }

  @include md {
    padding: 0 size(3);
    grid-gap: size(3);
    grid-template-columns: 1fr;
  }

  @include lg {
    grid-template-columns: 50% 50%;
  }

  &__personal {
    display: flex;
    flex-direction: column;

    &-information {
      margin-bottom: size(4);

      &_loading {
        margin-top: size(1);
        display: flex;
        justify-content: center;
        align-items: center;
      }

      &-row {
        margin-top: size(2);
        display: flex;
        flex-direction: column;
        padding: 0 size(2) 0 size(4);

        & > div:first-child {
          margin: 0 size(4) size(2) 0;
        }

        &:nth-child(2) {
          display: -webkit-box;
          word-break: break-all;
        }

        @include xs() {
          padding: 0 size(4);
        }

        @include md {
          flex-direction: row;
        }

        @include lg {
          flex-direction: column;
        }

        @include xl {
          flex-direction: row;
        }
      }
    }

    &-assets {
      margin-bottom: size(3);
      @include xs {
        margin-bottom: size(2);
      }

      @include lg {
        margin-bottom: 0;
      }

      &-table-header {
        padding: 0 size(4);
        display: flex;
        justify-content: space-between;

        & > div {
          margin: size(2) 0;
        }

        @mixin secondaryFieldsLeftMargins($margin1, $margin2) {
          & > div:nth-child(2) {
            margin-left: size($margin1);
          }
          & > div:nth-child(3) {
            margin-left: size($margin2);
          }
        }

        @include xs {
          justify-content: normal;
          @include secondaryFieldsLeftMargins(4, 6);
        }

        @include sm {
          @include secondaryFieldsLeftMargins(10, 16);
        }

        @include md {
          @include secondaryFieldsLeftMargins(28, 18);
        }

        @include lg {
          @include secondaryFieldsLeftMargins(12, 6);
        }

        @include xl {
          @include secondaryFieldsLeftMargins(16, 12);
        }
      }
    }

    &-assets-list {
      display: grid;

      @include xxs {
        grid-template-columns: 1fr;
      }

      @include sm {
        grid-template-columns: 1fr 1fr;
      }

      @include md {
        grid-template-columns: 1fr;
      }

      &-row {
        display: grid;

        @include md {
          grid-template-columns: 22vw 22vw 22vw 22vw;
        }

        @include lg {
          grid-template-columns: 12vw 10vw 10vw 8vw;
        }

        & > span {
          padding: 0;
        }

        &-asset {
          display: flex;

          &-logo {
            width: 32px;
            height: 32px;
            margin-right: size(2);

            svg {
              width: 100%;
              height: 100%;
            }
          }

          &-name {
            display: flex;
            flex-direction: column;
          }
        }

        &-amount,
        &-price,
        &-value {
          display: flex;
          align-items: center;

          span {
            text-overflow: ellipsis;
            overflow: hidden;
          }
        }
      }
    }

    &-assets-mobile-list {
      &-row {
        padding: size(2) size(4);
        width: 100%;
        display: flex;
        flex-direction: column;

        & > span {
          padding: 0;
        }

        &-asset {
          display: flex;

          & > span {
            display: flex;
            align-items: center;
            width: 25%;
            margin-right: 10%;
          }

          & > div {
            display: flex;
          }

          &-logo {
            width: 32px;
            height: 32px;
            margin-right: size(2);

            svg {
              width: 100%;
              height: 100%;
            }
          }

          &-name {
            display: flex;
            flex-direction: column;
          }
        }

        &-amount,
        &-price,
        &-value {
          display: flex;
          align-items: center;
          margin-top: size(2);

          span:first-child {
            width: 25%;
            margin-right: 10%;
          }

          span:nth-child(2) {
            width: 60%;
            text-overflow: ellipsis;
            overflow: hidden;
          }
        }
      }
    }
  }

  &__transactions {
    &-filters {
      display: flex;

      @include xxs {
        padding: size(1) 0;
        flex-direction: column;
      }

      @include sm {
        padding: 0 size(3);
        flex-direction: row;
      }
    }

    &-type {
      @include xxs {
        margin-bottom: size(1);
      }

      @include sm {
        margin-bottom: 0;
      }
    }

    &-container {
      display: grid;

      .content-row {
        height: 48px;
        min-height: 0;
      }
    }

    &-row {
      width: 100%;
      height: 32px;
      display: grid;
      grid-gap: size(2);
      grid-template-columns: 32px 2fr 1fr;

      @include xxs {
        grid-template-columns: 1fr 1fr;
        margin: size(2) 0;
        padding: 0 size(2);
      }

      @include xs {
        grid-template-columns: 32px 1fr 1fr;
        grid-gap: size(2);
        padding: 0;
      }

      @include lg {
        grid-template-columns: 32px 2fr 1fr;
      }

      &-column {
        display: flex;
        justify-content: left;
        align-items: center;

        & > div {
          margin-right: 3vw;
        }
      }

      &-icon {
        display: none;

        @include xs {
          display: grid;
        }
      }
    }
  }
}
</style>
