<script setup lang="ts">
import { computed, reactive, watch } from 'vue';
import { useTable } from '@/shared/lib/table';
import * as http from '@/shared/api';
import { objectOmit } from '@vueuse/shared';
import {
  type filterTransactionsModel as ftm,
  InstructionTypeFilter,
  TransactionStatusFilter,
} from '@/features/filter-transactions';
import type { AccountId } from '@/shared/api/schemas';
import { useErrorHandlers } from '@/shared/ui/composables/useErrorHandlers';
import { accountInstructionsAdaptiveOptions } from '@/features/filter-transactions/adaptive-options';
import InstructionsTable from '@/shared/ui/components/InstructionsTable.vue';
import TransactionsTable from '@/shared/ui/components/TransactionsTable.vue';
import { useWindowSize } from '@vueuse/core';

const { handleUnknownError } = useErrorHandlers();
const props = withDefaults(
  defineProps<{
    showInstructions?: boolean
    filterBy?: { kind: 'authority', id: AccountId } | { kind: 'block', block: number } | null
  }>(),
  { filterBy: null }
);

const transactionsTable = useTable(http.fetchTransactions, { reversed: true });
const instructionsTable = useTable(http.fetchInstructions);

const listState = reactive({
  status: null,
  authority: props.filterBy?.kind === 'authority' ? props.filterBy.id.toString() : '',
  kind: '' as ftm.TabInstructions,
  block: props.filterBy?.kind === 'block' ? props.filterBy.block : '',
});

async function fetchTransactions() {
  try {
    if (!props.showInstructions) await transactionsTable.fetch(objectOmit(listState, ['kind']));
    else
      await instructionsTable.fetch({
        ...objectOmit(listState, ['status']),
        transaction_status: listState.status,
      });
  } catch (e) {
    handleUnknownError(e);
  }
}

watch(
  [listState, () => props.showInstructions],
  (value, oldValue) => {
    if (oldValue && value[1] !== oldValue[1]) {
      const isChanged = resetFilters();

      if (!isChanged) fetchTransactions();
    } else fetchTransactions();
  },
  { immediate: true }
);

function resetFilters() {
  const isFiltersDefault = !listState.status && listState.kind === '';

  if (isFiltersDefault) return false;

  listState.status = null;
  listState.kind = '';

  return true;
}

const INSTRUCTIONS_HASH_BREAKPOINT = 1440;
const TRANSACTIONS_HASH_BREAKPOINT = 1350;

const { width } = useWindowSize();

const hashType = computed(() => {
  if (props.filterBy?.kind === 'authority') return 'short';

  const breakpoint = props.showInstructions ? INSTRUCTIONS_HASH_BREAKPOINT : TRANSACTIONS_HASH_BREAKPOINT;

  return width.value < breakpoint ? 'short' : 'full';
});
</script>

<template>
  <div
    class="transactions-table"
    :class="{ 'transactions-table_short': props.filterBy?.kind === 'authority' }"
  >
    <div class="transactions-table__filters content-row">
      <InstructionTypeFilter
        v-if="props.showInstructions"
        v-model="listState.kind"
        :adaptive-options="accountInstructionsAdaptiveOptions"
      />
      <TransactionStatusFilter v-model="listState.status" />
    </div>

    <TransactionsTable
      v-if="!props.showInstructions"
      :table="transactionsTable"
      :filter-by="props.filterBy"
      :hash-type="hashType"
    />
    <InstructionsTable
      v-else
      :table="instructionsTable"
      :accounts="props.filterBy?.kind === 'authority'"
      :all-types="!listState.kind"
      :hash-type="hashType"
    />
  </div>
</template>

<style lang="scss">
@import '@/shared/ui/styles/main';

.transactions-table {
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
</style>
