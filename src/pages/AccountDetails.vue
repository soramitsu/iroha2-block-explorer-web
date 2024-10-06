<script setup lang="ts">
import { useRouter } from 'vue-router';
import { computed, onMounted, reactive, ref, watch } from 'vue';
import * as http from '@/shared/api';
import BaseContentBlock from '@/shared/ui/components/BaseContentBlock.vue';
import DataField from '@/shared/ui/components/DataField.vue';
import { useTable } from '@/shared/lib/table';
import BaseTable from '@/shared/ui/components/BaseTable.vue';
import BaseLoading from '@/shared/ui/components/BaseLoading.vue';
import { useErrorHandlers } from '@/shared/ui/composables/useErrorHandlers';
import type { Account } from '@/shared/api/schemas';
import { AccountIdSchema } from '@/shared/api/schemas';
import { parseMetadata } from '@/shared/ui/utils/json';
import BaseTabs from '@/shared/ui/components/BaseTabs.vue';
import type { TabAccountTransactions } from '@/features/filter-transactions/model';
import { ACCOUNT_TRANSACTIONS_OPTIONS } from '@/features/filter-transactions/model';
import { accountInstructionsAdaptiveOptions } from '@/features/filter-transactions/adaptive-options';
import {
  type filterTransactionsModel as ftm,
  InstructionTypeFilter,
  TransactionStatusFilter,
} from '@/features/filter-transactions';
import TransactionsTable from '@/shared/ui/components/TransactionsTable.vue';
import InstructionsTable from '@/shared/ui/components/InstructionsTable.vue';
import { objectOmit } from '@vueuse/shared';
import BaseLink from '@/shared/ui/components/BaseLink.vue';

const router = useRouter();
const { handleUnknownError } = useErrorHandlers();

const accountId = computed(() => {
  const id = router.currentRoute.value.params['id'];

  return AccountIdSchema.parse(id);
});

const account = ref<Account | null>(null);
const isFetchingAccount = ref(false);

onMounted(async () => {
  try {
    isFetchingAccount.value = true;
    account.value = await http.fetchAccount(accountId.value);

    listState.authority = accountId.value.toString();

    if (account.value) {
      const ownedEntities = [];

      if (account.value.owned_assets) ownedEntities.push(assetsTable.fetch({ owned_by: accountId.value.toString() }));
      if (account.value.owned_domains) ownedEntities.push(domainsTable.fetch({ owned_by: accountId.value.toString() }));

      if (!ownedEntities.length) return;

      await Promise.all(ownedEntities);
    }
  } catch (e) {
    handleUnknownError(e);
  } finally {
    isFetchingAccount.value = false;
  }
});

const assetsTable = useTable(http.fetchAssets);
const domainsTable = useTable(http.fetchDomains);

const transactionsTab = ref<TabAccountTransactions>('transactions');

const shouldShowInstructions = computed(() => transactionsTab.value === 'instructions');

const transactionsTable = useTable(http.fetchTransactions, { reversed: true });
const instructionsTable = useTable(http.fetchInstructions);

const listState = reactive({
  status: null,
  authority: accountId.value.toString(),
  kind: 'All' as ftm.TabInstructions,
});

const shouldShowKind = computed(() => listState.kind === 'All');

async function fetchTransactions() {
  try {
    if (!shouldShowInstructions.value) await transactionsTable.fetch(objectOmit(listState, ['kind']));
    else
      await instructionsTable.fetch({
        ...objectOmit(listState, shouldShowKind.value ? ['kind', 'status'] : ['status']),
        transaction_status: listState.status,
      });
  } catch (e) {
    handleUnknownError(e);
  }
}

watch(
  [listState, shouldShowInstructions],
  (value, oldValue) => {
    if (oldValue && value[1] !== oldValue[1]) {
      const isChanged = resetFilters();

      if (!isChanged) fetchTransactions();
    } else fetchTransactions();
  },
  { immediate: true }
);

function resetFilters() {
  const isFiltersDefault = !listState.status && listState.kind === 'All';

  if (isFiltersDefault) return false;

  listState.status = null;
  listState.kind = 'All';

  return true;
}
</script>

<template>
  <div class="account-details">
    <div class="account-details__personal">
      <BaseContentBlock
        :title="$t('accounts.accountInformation')"
        class="account-details__personal-information"
      >
        <template #default>
          <div
            v-if="isFetchingAccount"
            class="account-details__personal-information_loading"
          >
            <BaseLoading />
          </div>
          <div v-else-if="account">
            <div class="account-details__personal-information-row">
              <DataField
                :title="$t('accounts.accountId')"
                :hash="accountId.toString()"
                copy
                type="medium"
              />

              <DataField
                :title="$t('accounts.ownedDomains')"
                :value="account.owned_domains"
              />

              <DataField
                :title="$t('accounts.ownedAssets')"
                :value="account.owned_assets"
              />

              <DataField
                :title="$t('metadata')"
                :value="parseMetadata(account.metadata)"
              />
            </div>
          </div>
        </template>
      </BaseContentBlock>

      <BaseContentBlock
        :title="$t('accounts.accountAssets')"
        class="account-details__personal-owned"
      >
        <template #default>
          <span
            v-if="!account?.owned_assets"
            class="account-details__personal-owned_empty row-text"
          >{{
            $t('accounts.accountDoesntHaveAnyAssets')
          }}</span>
          <BaseTable
            v-else
            :loading="assetsTable.loading.value"
            :items="assetsTable.items.value"
            container-class="account-details__personal-owned-list"
            breakpoint="960"
            :pagination="assetsTable.pagination"
            @next-page="assetsTable.nextPage()"
            @prev-page="assetsTable.prevPage()"
            @set-page="assetsTable.setPage($event)"
            @set-size="assetsTable.setSize($event)"
          >
            <template #header>
              <div class="account-details__personal-owned-list-row">
                <span class="h-sm">{{ $t('name') }}</span>
                <span class="h-sm">{{ $t('type') }}</span>
                <span class="h-sm">{{ $t('value') }}</span>
              </div>
            </template>

            <template #row="{ item }">
              <div class="account-details__personal-owned-list-row">
                <div class="account-details__personal-owned-list-row-data row-text">
                  <BaseLink :to="`/assets/${encodeURIComponent(item.id.definition.toString())}`">
                    {{ item.id.definition.name }}
                  </BaseLink>
                </div>

                <div class="account-details__personal-owned-list-row-data row-text">
                  <span>{{ item.value.kind }}</span>
                </div>

                <div class="account-details__personal-owned-list-row-data row-text">
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
              <div class="account-details__personal-owned-mobile-list-row">
                <div class="account-details__personal-owned-mobile-list-row-data row-text">
                  <span class="h-sm">{{ $t('name') }}</span>
                  <BaseLink :to="`/assets/${encodeURIComponent(item.id.definition.toString())}`">
                    {{ item.id.definition.name }}
                  </BaseLink>
                </div>

                <div class="account-details__personal-owned-mobile-list-row-data row-text">
                  <span class="h-sm">{{ $t('type') }}</span>
                  <span>{{ item.value.kind }}</span>
                </div>

                <div class="account-details__personal-owned-mobile-list-row-data row-text">
                  <span class="h-sm">{{ $t('value') }}</span>
                  <template v-if="item.value.kind === 'Store'">
                    🔑: {{ Object.keys(item.value.metadata).length }}
                  </template>
                  <template v-else>
                    {{ item.value.value }}
                  </template>
                </div>
              </div>
            </template>
          </BaseTable>
        </template>
      </BaseContentBlock>

      <BaseContentBlock
        :title="$t('accounts.accountDomains')"
        class="account-details__personal-owned"
      >
        <template #default>
          <span
            v-if="!account?.owned_domains"
            class="account-details__personal-owned_empty row-text"
          >{{
            $t('accounts.accountDoesntHaveAnyDomains')
          }}</span>
          <BaseTable
            v-else
            :loading="domainsTable.loading.value"
            :items="domainsTable.items.value"
            container-class="account-details__personal-owned-list"
            breakpoint="960"
            :pagination="domainsTable.pagination"
            @next-page="domainsTable.nextPage()"
            @prev-page="domainsTable.prevPage()"
            @set-page="domainsTable.setPage($event)"
            @set-size="domainsTable.setSize($event)"
          >
            <template #header>
              <div class="account-details__personal-owned-list-row">
                <span class="h-sm">{{ $t('id') }}</span>
                <span class="h-sm">{{ $t('assets.assets') }}</span>
                <span class="h-sm">{{ $t('accounts.accounts') }}</span>
              </div>
            </template>

            <template #row="{ item }">
              <div class="account-details__personal-owned-list-row">
                <div class="account-details__personal-owned-list-row-data row-text">
                  <BaseLink :to="`/domains/${item.id}`">
                    {{ item.id }}
                  </BaseLink>
                </div>

                <div class="account-details__personal-owned-list-row-data row-text">
                  <span>{{ item.assets }}</span>
                </div>

                <div class="account-details__personal-owned-list-row-data row-text">
                  <span>{{ item.accounts }}</span>
                </div>
              </div>
            </template>

            <template #mobile-card="{ item }">
              <div class="account-details__personal-owned-mobile-list-row">
                <div class="account-details__personal-owned-mobile-list-row-data row-text">
                  <span class="h-sm">{{ $t('id') }}</span>
                  <BaseLink :to="`/domains/${item.id}`">
                    {{ item.id }}
                  </BaseLink>
                </div>

                <div class="account-details__personal-owned-mobile-list-row-data row-text">
                  <span class="h-sm">{{ $t('assets.assets') }}</span>
                  <span>{{ item.assets }}</span>
                </div>

                <div class="account-details__personal-owned-mobile-list-row-data row-text">
                  <span class="h-sm">{{ $t('accounts.accounts') }}</span>
                  <span>{{ item.accounts }}</span>
                </div>
              </div>
            </template>
          </BaseTable>
        </template>
      </BaseContentBlock>
    </div>
    <div class="account-details__transactions">
      <BaseContentBlock :title="$t('accounts.accountTransactions')">
        <template #header-action>
          <BaseTabs
            v-model="transactionsTab"
            :items="ACCOUNT_TRANSACTIONS_OPTIONS"
          />
        </template>
        <template #default>
          <div class="account-details__transactions-table account-details__transactions-table_short">
            <div class="account-details__transactions-table__filters content-row">
              <InstructionTypeFilter
                v-if="shouldShowInstructions"
                v-model="listState.kind"
                :adaptive-options="accountInstructionsAdaptiveOptions"
              />
              <TransactionStatusFilter v-model="listState.status" />
            </div>

            <TransactionsTable
              v-if="!shouldShowInstructions"
              :table="transactionsTable"
              :filter-by="{ kind: 'authority', id: accountId }"
              hash-type="short"
              show-block
            />
            <InstructionsTable
              v-else
              :table="instructionsTable"
              :show-kind="shouldShowKind"
              hash-type="short"
            />
          </div>
        </template>
      </BaseContentBlock>
    </div>
  </div>
</template>

<style lang="scss">
@import '@/shared/ui/styles/main';

.account-details {
  display: flex;

  @include xxs {
    gap: size(2);
    padding: 0 size(3);
    flex-direction: column;
  }

  @include lg {
    flex-direction: row;
  }

  &__personal {
    display: flex;
    flex-direction: column;
    gap: size(2);

    @include xxs {
      width: 90vw;
    }

    @include lg {
      width: 46vw;
    }

    @include xl {
      width: size(85);
    }

    @include xxl {
      width: size(95);
    }

    &-information {
      &_loading {
        margin-top: size(1);
        display: flex;
        justify-content: center;
        align-items: center;
      }

      &-row {
        margin-top: size(2);
        padding: 0 size(2) 0 size(4);

        & > div:not(:first-child) {
          margin-top: size(2);
        }
      }
    }

    &-owned {
      .base-content-block__body:has(.account-details__personal-owned_empty) {
        padding: size(0) size(4) size(4);
      }

      .content-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        padding: 0 size(4);
      }

      hr {
        display: none;
      }

      &-list {
        display: grid;

        .content-row:last-child {
          border-bottom: 1px solid theme-color('border-primary');
        }

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
            grid-template-columns: 25vw 25vw 25vw;
          }

          @include lg {
            grid-template-columns: 12vw 12vw 12vw;
          }
        }
      }

      &-mobile-list {
        &-row {
          border-bottom: 1px solid theme-color('border-primary');
          padding: size(2) size(4);
          @include xxs {
            width: 100%;
          }
          @include sm {
            width: 45vw;
          }
          display: flex;
          flex-direction: column;

          &-data {
            display: flex;
            align-items: center;
            margin-top: size(2);

            span:first-child {
              @include xxs {
                width: size(16);
              }
              @include xs {
                width: size(20);
              }
              @include sm {
                width: size(16);
              }
            }
          }
        }
      }
    }
  }

  &__transactions {
    .base-content-block__header {
      display: flex;

      @include xxs {
        flex-direction: column;
        gap: size(2);
        padding: size(2) size(4);
      }

      @include sm {
        flex-direction: row;
        gap: 0;
      }
    }

    margin-bottom: size(2);
    @include xxs {
      width: 90vw;
    }
    @include lg {
      width: 46vw;
    }
    @include xl {
      width: size(80);
    }
    @include xxl {
      width: size(95);
    }

    hr {
      display: none;
    }

    &-table {
      &_short {
        .content-row {
          @include xxs {
            width: 90vw;
          }

          @include lg {
            width: 46vw;
            height: 48px;
          }
          @include xl {
            width: auto;
          }

          height: auto;
          min-height: 0;
        }
        & > .content-row {
          height: auto;
        }
      }

      &__filters {
        padding: size(2) size(4);
        display: flex;
        flex-direction: column;
        gap: size(1);

        @include sm {
          flex-direction: row;
        }
      }
    }
  }
}
</style>
