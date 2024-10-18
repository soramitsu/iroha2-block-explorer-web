<script setup lang="ts">
import { useRouter } from 'vue-router';
import { computed, onMounted, ref } from 'vue';
import * as http from '@/shared/api';
import BaseContentBlock from '@/shared/ui/components/BaseContentBlock.vue';
import DataField from '@/shared/ui/components/DataField.vue';
import { useTable } from '@/shared/lib/table';
import BaseTable from '@/shared/ui/components/BaseTable.vue';
import BaseHash from '@/shared/ui/components/BaseHash.vue';
import { useWindowSize } from '@vueuse/core';
import BaseLoading from '@/shared/ui/components/BaseLoading.vue';
import { useErrorHandlers } from '@/shared/ui/composables/useErrorHandlers';
import type { Domain } from '@/shared/api/schemas';
import { DomainId } from '@/shared/api/schemas';
import { parseMetadata } from '@/shared/ui/utils/json';
import BaseLink from '@/shared/ui/components/BaseLink.vue';
import { LG_WINDOW_SIZE, MD_WINDOW_SIZE, XS_WINDOW_SIZE } from '@/shared/ui/consts';

const router = useRouter();
const { handleUnknownError } = useErrorHandlers();

const HASH_BREAKPOINT = 960;
const { width } = useWindowSize();

const accountHashType = computed(() => {
  if (width.value > MD_WINDOW_SIZE && width.value < LG_WINDOW_SIZE) return 'full';

  if (width.value > XS_WINDOW_SIZE) return 'medium';

  return 'short';
});

const domainAccountsHashType = computed(() => {
  if (width.value > HASH_BREAKPOINT) return 'medium';

  if (width.value > XS_WINDOW_SIZE) return 'short';

  return 'two-line';
});

const domainId = computed(() => {
  const id = router.currentRoute.value.params['id'];

  return DomainId.parse(id);
});

const domain = ref<Domain | null>(null);
const isFetchingDomain = ref(false);

const isEmptyAssets = ref(false);
const isEmptyAccounts = ref(false);

onMounted(async () => {
  try {
    isFetchingDomain.value = true;
    domain.value = await http.fetchDomain(domainId.value);

    if (domain.value) {
      await Promise.all([
        assetsTable.fetch({ domain: domainId.value }),
        accountsTable.fetch({ domain: domainId.value }),
      ]);
    }

    isEmptyAssets.value = !assetsTable.items.value.length;
    isEmptyAccounts.value = !accountsTable.items.value.length;
  } catch (e) {
    handleUnknownError(e);
  } finally {
    isFetchingDomain.value = false;
  }
});

const accountsTable = useTable(http.fetchAccounts);
const assetsTable = useTable(http.fetchAssetDefinitions);
</script>

<template>
  <div class="domain-details">
    <div class="domain-details__native">
      <BaseContentBlock
        :title="$t('domain')"
        class="domain-details__native-information"
      >
        <template #default>
          <div
            v-if="isFetchingDomain"
            class="domain-details__native-information_loading"
          >
            <BaseLoading />
          </div>
          <div v-else-if="domain">
            <div class="domain-details__native-information-row">
              <DataField
                :title="$t('domains.domainId')"
                :hash="domainId"
              />

              <DataField
                :title="$t('domains.ownedBy')"
                :hash="domain.owned_by.toString()"
                copy
                :link="`/accounts/${domain.owned_by}`"
                :type="accountHashType"
              />

              <DataField
                :title="$t('metadata')"
                :value="parseMetadata(domain.metadata)"
                metadata
              />
            </div>
          </div>
        </template>
      </BaseContentBlock>

      <BaseContentBlock
        :title="$t('domains.domainAssets')"
        class="domain-details__native-assets"
      >
        <template #default>
          <span
            v-if="isEmptyAssets"
            class="domain-details__native-assets_empty row-text"
          >
            {{ $t('domains.domainDoesntHaveAnyAssets') }}
          </span>
          <BaseTable
            v-else
            :loading="assetsTable.loading.value"
            :items="assetsTable.items.value"
            :pagination="assetsTable.pagination"
            container-class="domain-details__native-assets-list"
            :breakpoint="960"
            @next-page="assetsTable.nextPage()"
            @prev-page="assetsTable.prevPage()"
            @set-page="assetsTable.setPage($event)"
            @set-size="assetsTable.setSize($event)"
          >
            <template #header>
              <div class="domain-details__native-assets-list-row">
                <span class="h-sm">{{ $t('name') }}</span>
                <span class="h-sm">{{ $t('type') }}</span>
                <span class="h-sm">{{ $t('mintable') }}</span>
              </div>
            </template>

            <template #row="{ item }">
              <div class="domain-details__native-assets-list-row">
                <div class="domain-details__native-assets-list-row-data row-text">
                  <BaseLink :to="`/assets/${encodeURIComponent(item.id.toString())}`">
                    {{ item.id.name }}
                  </BaseLink>
                </div>

                <div class="domain-details__native-assets-list-row-data row-text">
                  <span>{{ item.type }}</span>
                </div>

                <div class="domain-details__native-assets-list-row-data row-text">
                  <span>{{ item.mintable }}</span>
                </div>
              </div>
            </template>

            <template #mobile-card="{ item }">
              <div class="domain-details__native-assets-mobile-list-row">
                <div class="domain-details__native-assets-mobile-list-row-data row-text">
                  <span class="h-sm">{{ $t('name') }}</span>
                  <BaseLink :to="`/assets/${encodeURIComponent(item.id.toString())}`">
                    {{ item.id.name }}
                  </BaseLink>
                </div>

                <div class="domain-details__native-assets-mobile-list-row-data row-text">
                  <span class="h-sm">{{ $t('type') }}</span>
                  <span>{{ item.type }}</span>
                </div>

                <div class="domain-details__native-assets-mobile-list-row-data row-text">
                  <span class="h-sm">{{ $t('mintable') }}</span>
                  <span>{{ item.mintable }}</span>
                </div>
              </div>
            </template>
          </BaseTable>
        </template>
      </BaseContentBlock>
    </div>

    <div class="domain-details__accounts">
      <BaseContentBlock :title="$t('domains.domainAccounts')">
        <template #default>
          <span
            v-if="isEmptyAccounts"
            class="domain-details__accounts_empty row-text"
          >
            {{ $t('domains.domainDoesntHaveAnyAccounts') }}
          </span>
          <BaseTable
            v-else
            :loading="accountsTable.loading.value"
            :items="accountsTable.items.value"
            :pagination="accountsTable.pagination"
            container-class="domain-details__accounts-container"
            :breakpoint="960"
            @next-page="accountsTable.nextPage()"
            @prev-page="accountsTable.prevPage()"
            @set-page="accountsTable.setPage($event)"
            @set-size="accountsTable.setSize($event)"
          >
            <template #header>
              <div class="domain-details__accounts-row">
                <span class="h-sm">{{ $t('accounts.accountId') }}</span>
              </div>
            </template>

            <template #row="{ item }">
              <div class="domain-details__accounts-row">
                <BaseHash
                  :hash="item.id.toString()"
                  :link="`/accounts/${item.id}`"
                  :type="domainAccountsHashType"
                  copy
                />
              </div>
            </template>

            <template #mobile-card="{ item }">
              <div class="domain-details__accounts-mobile-card">
                <div class="domain-details__accounts-mobile-row">
                  <span class="h-sm domain-details__accounts-mobile-label">{{ $t('accounts.accountId') }}</span>
                  <BaseHash
                    :hash="item.id.toString()"
                    :link="`/accounts/${item.id}`"
                    :type="domainAccountsHashType"
                    copy
                  />
                </div>
              </div>
            </template>
          </BaseTable>
        </template>
      </BaseContentBlock>
    </div>
  </div>
</template>

<style lang="scss">
@import '@/shared/ui/styles/main';

.domain-details {
  display: flex;

  @include xxs {
    gap: size(2);
    padding: 0 size(3);
    flex-direction: column;
  }

  @include lg {
    flex-direction: row;
  }

  &__native {
    display: flex;
    flex-direction: column;

    @include xxs {
      width: 90vw;
    }

    @include lg {
      width: 46vw;
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

        display: flex;
        flex-direction: column;
        gap: size(2);
      }
    }

    &-assets {
      .base-content-block__body:has(.domain-details__native-assets_empty) {
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
    }

    &-assets-list {
      @include sm {
        .base-table__mobile-card:nth-last-child(2) {
          border-bottom: 1px solid theme-color('border-primary');
        }
      }

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

    &-assets-mobile-list {
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

  &__accounts {
    .base-content-block__body:has(.domain-details__accounts_empty) {
      padding: size(0) size(4) size(4);
    }

    hr {
      display: none;
    }

    @include xxs {
      width: 90vw;
    }

    @include lg {
      width: 46vw;
    }

    .content-row {
      padding: 0 size(4);
    }

    &-row {
      width: 100%;
    }

    &-mobile-card {
      padding: size(2) size(4);
    }

    &-mobile-row {
      display: flex;
      align-items: center;
    }

    &-mobile-label {
      width: size(12);
    }
  }
}
</style>
