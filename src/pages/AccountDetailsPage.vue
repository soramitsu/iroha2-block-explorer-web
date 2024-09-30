<script setup lang="ts">
import { useRouter } from 'vue-router';
import { computed, onMounted, ref } from 'vue';
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
import TransactionsTable from '@/shared/ui/components/TransactionsTable.vue';

const router = useRouter();
const { handleUnknownError } = useErrorHandlers();

const accountId = computed(() => {
  const id = router.currentRoute.value.params['id'];

  return AccountIdSchema.parse(id);
});

const account = ref<Account | null>(null);
const isFetchingAccount = ref(false);

const isEmptyAssets = ref(false);

onMounted(async () => {
  try {
    isFetchingAccount.value = true;
    account.value = await http.fetchAccount(accountId.value);

    if (account.value) {
      await Promise.all([assetsTable.fetch({ owned_by: accountId.value.toString() })]);
    }

    isEmptyAssets.value = !assetsTable.items.value.length;
  } catch (e) {
    handleUnknownError(e);
  } finally {
    isFetchingAccount.value = false;
  }
});

const assetsTable = useTable(http.fetchAssets);
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
        class="account-details__personal-assets"
      >
        <template #default>
          <span
            v-if="isEmptyAssets"
            class="account-details__personal-assets_empty row-text"
          >{{
            $t('accounts.accountDoesntHaveAnyAssets')
          }}</span>
          <BaseTable
            v-else
            :loading="assetsTable.loading.value"
            :items="assetsTable.items.value"
            container-class="account-details__personal-assets-list"
            breakpoint="960"
            :pagination="assetsTable.pagination"
            @next-page="assetsTable.nextPage()"
            @prev-page="assetsTable.prevPage()"
            @set-page="assetsTable.setPage($event)"
            @set-size="assetsTable.setSize($event)"
          >
            <template #header>
              <div class="account-details__personal-assets-list-row">
                <span class="h-sm">{{ $t('name') }}</span>
                <span class="h-sm">{{ $t('type') }}</span>
                <span class="h-sm">{{ $t('value') }}</span>
              </div>
            </template>

            <template #row="{ item }">
              <div class="account-details__personal-assets-list-row">
                <div class="account-details__personal-assets-list-row-data row-text">
                  <span>{{ item.id.definition.name }}</span>
                </div>

                <div class="account-details__personal-assets-list-row-data row-text">
                  <span>{{ item.value.kind }}</span>
                </div>

                <div class="account-details__personal-assets-list-row-data row-text">
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
              <div class="account-details__personal-assets-mobile-list-row">
                <div class="account-details__personal-assets-mobile-list-row-data row-text">
                  <span class="h-sm">{{ $t('name') }}</span>
                  <span>{{ item.id.definition.name }}</span>
                </div>

                <div class="account-details__personal-assets-mobile-list-row-data row-text">
                  <span class="h-sm">{{ $t('type') }}</span>
                  <span>{{ item.value.kind }}</span>
                </div>

                <div class="account-details__personal-assets-mobile-list-row-data row-text">
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
    </div>
    <div class="account-details__transactions">
      <BaseContentBlock :title="$t('accounts.accountTransactions')">
        <template #default>
          <TransactionsTable :authority="accountId" />
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
      margin-bottom: size(2);

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

    &-assets {
      &_empty {
        padding: 0 size(4);
      }

      .content-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        padding: 0 size(4);
      }

      hr {
        display: none;
      }
    }

    &-assets-list {
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

    &-assets-mobile-list {
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

  &__transactions {
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
  }
}
</style>
