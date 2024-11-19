<script setup lang="ts">
import { useRouter } from 'vue-router';
import { computed, reactive, ref, watch } from 'vue';
import * as http from '@/shared/api';
import BaseContentBlock from '@/shared/ui/components/BaseContentBlock.vue';
import DataField from '@/shared/ui/components/DataField.vue';
import BaseTable from '@/shared/ui/components/BaseTable.vue';
import BaseLoading from '@/shared/ui/components/BaseLoading.vue';
import { AccountIdSchema } from '@/shared/api/schemas';
import { parseMetadata } from '@/shared/ui/utils/json';
import BaseTabs from '@/shared/ui/components/BaseTabs.vue';
import type { TabAccountTransactions } from '@/features/filter-transactions/model';
import { ACCOUNT_TRANSACTIONS_OPTIONS } from '@/features/filter-transactions/model';
import TransactionsTable from '@/shared/ui/components/TransactionsTable.vue';
import InstructionsTable from '@/shared/ui/components/InstructionsTable.vue';
import BaseLink from '@/shared/ui/components/BaseLink.vue';
import { XS_WINDOW_SIZE } from '@/shared/ui/consts';
import { useWindowSize } from '@vueuse/core';
import { useParamScope } from '@vue-kakuyaku/core';
import { setupAsyncData } from '@/shared/utils/setup-async-data';

const router = useRouter();
const { width } = useWindowSize();

const hashType = computed(() => {
  if (width.value > XS_WINDOW_SIZE) return 'medium';

  return 'short';
});

const accountId = computed(() => {
  const id = router.currentRoute.value.params['id'];

  return AccountIdSchema.parse(id);
});

const accountScope = useParamScope(
  () => {
    return {
      key: accountId.value.toString(),
      payload: accountId.value,
    };
  },
  ({ payload }) => setupAsyncData(() => http.fetchAccount(payload))
);

const isAccountLoading = computed(() => accountScope.value.expose.isLoading);
const account = computed(() => {
  const res = accountScope.value?.expose.data;

  if (!res) return null;

  return res;
});

const domainsListState = reactive({
  page: 1,
  per_page: 10,
  owned_by: computed(() => accountId.value),
});

watch([() => domainsListState.per_page], () => {
  domainsListState.page = 1;
});

const domainsScope = useParamScope(
  () => {
    return {
      key: account.value?.owned_domains ? JSON.stringify(domainsListState) : '',
      payload: domainsListState,
    };
  },
  ({ payload }) => setupAsyncData(() => http.fetchDomains(payload))
);

const isDomainsLoading = computed(() => domainsScope.value?.expose?.isLoading);
const totalDomains = computed(() => domainsScope.value?.expose?.data?.pagination?.total_items ?? 0);
const domains = computed(() => domainsScope.value?.expose?.data?.items ?? []);

const assetsListState = reactive({
  page: 1,
  per_page: 10,
  owned_by: computed(() => accountId.value),
});

watch([() => assetsListState.per_page], () => {
  assetsListState.page = 1;
});

const assetsScope = useParamScope(
  () => {
    return {
      key: account.value?.owned_assets ? JSON.stringify(assetsListState) : '',
      payload: assetsListState,
    };
  },
  ({ payload }) => setupAsyncData(() => http.fetchAssets(payload))
);

const isAssetsLoading = computed(() => assetsScope.value?.expose.isLoading);
const totalAssets = computed(() => assetsScope.value?.expose.data?.pagination?.total_items ?? 0);
const assets = computed(() => assetsScope.value?.expose.data?.items ?? []);

const transactionsTab = ref<TabAccountTransactions>('transactions');
const shouldShowInstructions = computed(() => transactionsTab.value === 'instructions');
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
            v-if="isAccountLoading"
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
                :type="hashType"
              />

              <DataField
                :title="$t('metadata')"
                metadata
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
            v-model:page="assetsListState.page"
            v-model:page-size="assetsListState.per_page"
            :loading="isAssetsLoading"
            :total="totalAssets"
            :items="assets"
            container-class="account-details__personal-owned-list"
            :breakpoint="960"
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
            v-model:page="domainsListState.page"
            v-model:page-size="domainsListState.per_page"
            :loading="isDomainsLoading"
            :total="totalDomains"
            :items="domains"
            container-class="account-details__personal-owned-list"
            :breakpoint="960"
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
            <TransactionsTable
              v-if="!shouldShowInstructions"
              :filter-by="{ kind: 'authority', value: accountId }"
              hash-type="short"
              show-block
            />
            <InstructionsTable
              v-else
              hash-type="short"
              :filter-by="{ kind: 'authority', value: accountId }"
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
      width: 45vw;
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

      .base-table > .content-row {
        display: flex;
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
      width: 48vw;
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
        }
        & > .content-row {
          height: auto;
        }

        .transactions-table__columns {
          @include sm {
            flex-direction: column;
          }
          @include md {
            flex-direction: row;
          }
          @include lg {
            flex-direction: column;
          }
        }

        .transactions-table__column {
          &-hash {
            @include sm {
              width: 30vw;
            }
            @include md {
              width: 19vw;
            }
            @include lg {
              width: size(24);
            }
          }
          &-block {
            width: size(16);
          }
        }
      }
    }
  }
}
</style>
