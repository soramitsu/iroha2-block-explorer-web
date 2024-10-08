<script setup lang="ts">
import { defaultFormat } from '@/shared/lib/time';
import BaseHash from '@/shared/ui/components/BaseHash.vue';
import TransactionStatus from '@/entities/transaction/TransactionStatus.vue';
import BaseLink from '@/shared/ui/components/BaseLink.vue';
import BaseTable from '@/shared/ui/components/BaseTable.vue';
import type { Instruction } from '@/shared/api/schemas';
import type { useTable } from '@/shared/lib/table';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const props = defineProps<{
  table: ReturnType<typeof useTable<Instruction>>
  showValue?: boolean
  showKind?: boolean
  hashType: 'short' | 'full'
}>();

function isBase64EncodedWasm(item: Instruction) {
  return item.kind === 'Upgrade';
}

function getInstructionPayloadValue(item: Instruction) {
  if (isBase64EncodedWasm(item)) return t('transactions.displayingIsntSupported');

  return Object.entries(item.payload)[0][1];
}

function getInstructionPayloadEntity(item: Instruction) {
  if (isBase64EncodedWasm(item)) return t('transactions.object');

  return Object.entries(item.payload)[0][0];
}
</script>

<template>
  <div
    class="instructions-table"
    :class="{ 'instructions-table_short': !props.showValue }"
  >
    <BaseTable
      :loading="props.table.loading.value"
      :pagination="props.table.pagination"
      :items="props.table.items.value"
      container-class="instructions-table__container"
      :pagination-breakpoint="1441"
      @next-page="props.table.nextPage()"
      @prev-page="props.table.prevPage()"
      @set-page="props.table.setPage($event)"
      @set-size="props.table.setSize($event)"
    >
      <template #row="{ item }">
        <div class="instructions-table__row">
          <TransactionStatus
            type="tooltip"
            class="instructions-table__icon"
            :committed="item.transaction_status === 'Committed'"
          />

          <div class="instructions-table__column">
            <div class="instructions-table__label">
              {{ $t('transactions.transactionID') }}
            </div>

            <BaseHash
              :hash="item.transaction_hash"
              :type="hashType"
              :link="`/transactions/${item.transaction_hash}`"
              copy
            />

            <div class="instructions-table__time">
              {{ defaultFormat(item.created_at) }}
            </div>
          </div>

          <div class="instructions-table__columns">
            <div
              v-if="props.showKind"
              class="instructions-table__column"
            >
              <div class="instructions-table__label">
                {{ $t('kind') }}
              </div>

              <span class="row-text">{{ item.kind }}</span>
            </div>

            <div class="instructions-table__column">
              <div class="instructions-table__label">
                {{ $t('entity') }}
              </div>

              <span class="row-text">{{ getInstructionPayloadEntity(item) }}</span>
            </div>

            <div class="instructions-table__column">
              <div class="instructions-table__label">
                {{ $t('transactions.block') }}
              </div>

              <BaseLink :to="`/blocks/${item.block}`">
                {{ item.block }}
              </BaseLink>
            </div>
          </div>

          <div
            v-if="props.showValue"
            class="instructions-table__column-value"
          >
            <div class="instructions-table__label">
              {{ $t('value') }}
            </div>

            <span class="row-text">{{ getInstructionPayloadValue(item) }}</span>
          </div>
        </div>
      </template>
    </BaseTable>
  </div>
</template>

<style lang="scss">
@import '@/shared/ui/styles/main';

.instructions-table {
  &_short {
    .content-row {
      @include xxs {
        width: 90vw;
      }

      @include lg {
        width: 46vw;
        height: size(12) !important;
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

    .instructions-table__columns {
      @include lg {
        flex-direction: column;
        gap: size(2);
      }
    }
  }

  &__row {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 80px;
    margin: size(1) 0;

    @include xxs {
      grid-template-columns: 1fr 1fr;
      margin: size(2) 0;
      grid-gap: size(2);
      display: flex;
      flex-direction: column;
    }

    @include sm {
      display: grid;
      grid-template-columns: 32px 0.8fr 1fr;
      grid-gap: size(2);
    }

    @include lg {
      grid-template-columns: 32px 0.4fr 1fr;
    }

    @include xl {
      grid-template-columns: 32px 1.4fr 1fr;
    }
  }

  &__container {
    display: grid;
    .content-row {
      padding: 0 size(4);

      height: auto;
      min-height: 0;
    }
  }

  &__icon {
    display: none;

    @include sm {
      display: grid;
    }
  }

  &__label {
    @include tpg-s3;
    width: size(6);
    color: theme-color('content-quaternary');
  }

  &__time {
    @include tpg-s3;
    color: theme-color('content-primary');
    grid-column: 1 / -1;
  }

  &__columns {
    display: flex;
    gap: size(3);
    flex-direction: column;

    @include md {
      flex-direction: row;
    }

    @include xl {
      flex-direction: column;
      gap: size(2);
    }

    .instructions-table__column {
      width: size(22);
    }
  }

  &__column {
    display: grid;
    grid-gap: size(1) size(1);
    margin-bottom: auto;

    @include xs {
      grid-template-columns: auto 1fr;
      margin: auto 0;
    }

    @include sm {
      grid-gap: size(1);
    }

    &-value {
      display: flex;
      gap: size(2);

      span {
        word-break: break-all;
      }

      @include xxs {
        width: 70vw;
      }

      @include sm {
        width: 75vw;
      }

      @include lg {
        width: 80vw;
      }

      @include xl {
        width: 85vw;
      }
    }
  }
}
</style>
