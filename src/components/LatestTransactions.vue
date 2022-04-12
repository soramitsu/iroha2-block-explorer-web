<template>
  <BaseContentBlock title="Latest Blocks" class="latest-transactions">
    <template #header-action>
      <BaseButton line>view all</BaseButton>
    </template>

    <template #default>
      <div class="content-row">
        <BaseTabs v-model="activeTab" :items="tabs" />

        <BaseDropdown
          v-model="filterValue"
          :items="filterItems"
          width="180px"
          field-label="Timespan:"
        />
      </div>

      <template v-for="(transaction, i) in transactions" :key="i">
        <div class="content-row content-row--with-hover">
          <div class="latest-transactions__column">
            <ShortHash :hash="transaction.hash" />
            <span class="latest-transactions__time">8 min ago</span>
          </div>

          <div class="latest-transactions__direction">
            <ShortHash :hash="transaction.from" />
            <ArrowIcon />
            <ShortHash :hash="transaction.to" />
          </div>

          <div class="latest-transactions__column">
            <span class="latest-transactions__value">1,245.34728384 XOR</span>
            <span class="latest-transactions__price">$49,800.00</span>
          </div>
        </div>

        <hr>
      </template>
    </template>
  </BaseContentBlock>
</template>

<script setup lang="ts">
import BaseContentBlock from '@/components/BaseContentBlock.vue';
import BaseButton from '@/components/BaseButton.vue';
import ArrowIcon from '@/assets/svg/arrow.svg';
import ShortHash from '@/components/ShortHash.vue';
import BaseTabs from '@/components/BaseTabs.vue';
import BaseDropdown from '@/components/BaseDropdown.vue';
import { ref } from 'vue';

type FakeTransactions = {
  from: string;
  to: string;
  hash: string;
}

const transactions = new Array<FakeTransactions>(10).fill({
  from: 'cnTQ1kbv7PBNNQrEb1tZpmK7h1CW5Hkb5ZBLpK3JbMfZjx9RN',
  to: 'cnTQ1kbv7PBNNQrEb1tZpmK7h1CW5Hkb5ZBLpK3JbMfZjx9RN',
  hash: '0xTQ1kbv7PBNNQrEb1tZpmK7h1CW5Hkb5ZBLpK3JbMfZjx9RN',
});

const tabs = [
  { label: 'Most Recent', value: 'most-recent' },
  { label: 'Most Value', value: 'most-value' },
];

const filterItems = [
  { label: 'Today', value: 'today' },
  { label: 'Week', value: 'week' },
  { label: 'Month', value: 'month' },
  { label: 'Year', value: 'year' },
  { label: 'All time', value: 'all-time' },
];

const activeTab = ref(tabs[0].value);
const filterValue = ref(filterItems[4].value);
</script>

<style lang="scss">
@import 'styles';

.latest-transactions {
  &__column {
    display: grid;
    grid-gap: $size-0_5;
  }

  &__time {
    @include tpg-s5;
    color: theme-color('content-primary');
  }

  &__direction {
    display: grid;
    grid-gap: $size-1_5;
    grid-template-columns: auto $size-1 auto;
    margin: 0 auto 0 $size-5;

    svg {
      color: theme-color('content-quaternary');
    }
  }

  &__value {
    @include tpg-s3;
    color: theme-color('content-primary');
  }

  &__price {
    @include tpg-s5-bold;
    color: theme-color('content-quaternary');
    text-align: right;
  }
}
</style>
