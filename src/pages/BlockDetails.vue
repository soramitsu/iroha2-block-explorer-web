<template>
  <div v-if="block && block.height">
    <BaseContentBlock
      :title="$t('blockDetails.title', { height: block.height })"
      class="block-details-card"
    >
      <!-- Card Header -->
      <template #header>
        <div class="block-details-card__title">
          <ArrowIcon />
          <h2 class="base-content-block__title">
            {{ $t("blockDetails.title", { height: block.height }) }}
          </h2>
          <ArrowIcon />
        </div>
        <time class="transactions-list-page__time">
          {{ formatTime(block.timestamp) }}
        </time>
      </template>

      <!-- Card Body  -->
      <template #default>
        <BlockDetailsCard rejected_merkle_root_hash="" block-number="" merkle_root_hash="" parent_block_hash="" view_change_proofs="" invalidated_block_hashes="" hash="" />
      </template>
    </BaseContentBlock>
  </div>
  <!-- Block Transaction Details Component -->
  <BaseContentBlock
    :title="$t('block',1) + ' ' + $t('transaction',2)"
    class="transactions-list-page"
  >
    <div class="content-row">
      <TransactionTypeFilter
        v-model="tab"
        class="transactions-list-page__tabs"
      />
      <TransactionStatusFilter
        v-model="status"
        class="transactions-list-page__status"
      />
    </div>

    <BaseTable
      :loading="table.loading.value"
      :pagination="table.pagination.value"
      :items="table.items.value"
      container-class="transactions-list-page__container"
      @next-page="table.nextPage()"
      @prev-page="table.prevPage()"
      @set-page="table.setPage($event)"
      @set-size="table.setSize($event)"
    >
      <template #row="{ item }: { item: Transaction }">
        <div class="transactions-list-page__row">
          <TransactionStatus
            type="tooltip"
            class="transactions-list-page__icon"
            :committed="item.committed"
          />

          <div class="transactions-list-page__column">
            <div class="transactions-list-page__label">TxID</div>

            <BaseHash
              :hash="item.hash"
              :type="hashType"
              :link="'/transactions/' + item.hash"
              copy
            />

            <div class="transactions-list-page__time">
              {{ formatTime(item.payload.creation_time) }}
            </div>
          </div>
        </div>
      </template>
    </BaseTable>
  </BaseContentBlock>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useBlockTable } from '~features/blocks/utils/useBlockTable';
import { computedEager, useWindowSize } from '@vueuse/core';
import { http } from '~shared/api';
import { TransactionStatus } from '~entities/transaction';
import { format as formatTime } from '~shared/lib/time';
import {
  filterTransactionsModel,
  TransactionStatusFilter,
  TransactionTypeFilter,
} from '~features/filter-transactions';
import invariant from 'tiny-invariant';

import BaseContentBlock from '~base/BaseContentBlock.vue';
import BaseTable from '~base/BaseTable.vue';
import BaseHash from '~shared/ui/components/BaseHash.vue';
import BaseLink from '~shared/ui/components/BaseLink.vue';
import ArrowIcon from '~icons/arrow.svg';
import BlockDetailsCard from "~pages/BlockDetailsCard.vue";

const WINDOW_WIDTH_BREAKPOINT_TO_SHRINK_HASH = 1200;

const status = ref<filterTransactionsModel.Status>(null);
const tab = ref<filterTransactionsModel.Tab>('all');

const { width } = useWindowSize();

const hashType = computedEager<'full' | 'medium' | 'short' | 'two-line'>(() =>
  width.value < WINDOW_WIDTH_BREAKPOINT_TO_SHRINK_HASH ? 'short' : 'full',
);

const route = useRoute();
const height = computedEager(() => {
  const heightString = route.params.id;
  invariant(typeof heightString === 'string');
  return parseInt(heightString, 10);
});

const block = ref();
const table = useBlockTable();

onMounted(async () => {
  try {
    const blockDetails = await http.fetchBlocksDetails(height.value);
    block.value = blockDetails;
    console.log(blockDetails);
    table.setTransaction(blockDetails.transactions);
  } catch (err) {
    console.error('Error fetching block details:', err);
  }
});
</script>

<style lang="scss">
@import "styles";

.block-details-card {
  margin-bottom: 1rem;
  &__title {
    display: inline-flex;
    align-items: flex-start;
    gap: 8px;

    & > svg {
      display: flex;
      align-items: center;
      justify-content: center;
      height: size(3);
      width: size(3);
      padding: 4px;
      color: var("content-quaternary");
      cursor: pointer;

      &:first-child {
        transform: rotateY(180deg);
      }
    }
  }

  &__body {
    display: grid;
    gap: 16px;
    width: 100%;
    height: 100%;
    margin: 1rem;
    padding: 0 0 1rem 1rem;

    @include xs {
      grid-template-columns: 1fr;
      grid-gap: size(2);
    }

    @include sm {
      grid-template-columns: repeat(2, 1fr);
      margin: size(2) 0;
    }
  }
  &__column {
    display: flex;
    flex-direction: column;
    row-gap: 32px;
    &__row {
      width: 100%;
      justify-content: start;
      &__hash {
        margin: 0.5rem 1rem 0;
        a {
          color: theme-color("content-primary");
          text-decoration: none;
        }
      }
      &__hashFrame {
        margin: 0.5rem 1rem 0;
      }
    }
  }
}

// styles for the blockTable
.transactions-list-page {
  &__row {
    width: 10%;
    display: grid;
    grid-template-columns: 1fr 80px;
    margin: size(1) 0;

    @include xs {
      grid-template-columns: 1fr 150px;
      margin: size(2) 0;
    }

    @include sm {
      grid-template-columns: 32px 1fr 150px;
      grid-gap: size(2);
    }

    @include lg {
      grid-template-columns: 32px 2fr 1fr;
    }
  }

  &__container {
    display: grid;
  }

  &__tabs {
    display: none; // need a mobile version of the component

    @include md {
      display: grid;
    }
  }

  &__status {
    margin: 0 auto;

    @include xs {
      margin: 0 0 0 auto;
    }
  }

  &__icon {
    display: none;

    @include sm {
      display: grid;
    }
  }

  &__label {
    @include tpg-s5;
    color: theme-color("content-quaternary");

    @include sm {
      @include tpg-s3;
    }
  }

  &__time {
    @include tpg-s5;
    color: theme-color("content-primary");
    grid-column: 1 / -1;

    @include sm {
      @include tpg-s3;
    }
  }

  &__column {
    display: grid;
    grid-gap: size(0.5) size(1);
    margin-bottom: auto;

    @include xs {
      grid-template-columns: auto 1fr;
      margin: auto 0;
    }

    @include sm {
      grid-gap: size(1) size(2);
    }
  }
}
</style>
