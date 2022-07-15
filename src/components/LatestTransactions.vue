<template>
  <BaseContentBlock :title="$t('latestTransactions')" class="latest-transactions">
    <template #header-action>
      <BaseButton line>{{ $t('viewAll') }}</BaseButton>
    </template>

    <template #default>
      <div class="content-row">
        <BaseTabs v-model="activeTab" :items="tabs" />

        <BaseDropdown
          v-model="filterValue"
          :items="filterItems"
          width="180px"
          :field-label="$t('timespan') + ':'"
        />
      </div>

      <template v-for="(transaction, i) in transactions" :key="i">
        <div class="content-row content-row--with-hover">
          <div class="latest-transactions__column">
            <ShortHash :hash="transaction.hash" />
            <span class="latest-transactions__time">{{ $t('time.minAgo', [8]) }}</span>
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
import ArrowIcon from '@/icons/arrow.svg';
import ShortHash from '@/components/ShortHash.vue';
import BaseTabs from '@/components/BaseTabs.vue';
import BaseDropdown from '@/components/BaseDropdown.vue';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { fetchTransactions } from '@/http';

type FakeTransactions = {
  from: string;
  to: string;
  hash: string;
}

const { t } = useI18n({ useScope: 'global' });

const transactions = new Array<FakeTransactions>(10).fill({
  from: 'cnTQ1kbv7PBNNQrEb1tZpmK7h1CW5Hkb5ZBLpK3JbMfZjx9RN',
  to: 'cnTQ1kbv7PBNNQrEb1tZpmK7h1CW5Hkb5ZBLpK3JbMfZjx9RN',
  hash: '0xTQ1kbv7PBNNQrEb1tZpmK7h1CW5Hkb5ZBLpK3JbMfZjx9RN',
});

const tabs = [
  { label: t('sort.mostRecent'), value: 'most-recent' },
  { label: t('sort.mostValue'), value: 'most-value' },
];

const filterItems = [
  { label: t('time.today'), value: 'today' },
  { label: t('time.week'), value: 'week' },
  { label: t('time.month'), value: 'month' },
  { label: t('time.year'), value: 'year' },
  { label: t('time.allTime'), value: 'all-time' },
];

const activeTab = ref(tabs[0].value);
const filterValue = ref(filterItems[4].value);

const _transactions = ref<Transaction[]>([]);

const res = fetchTransactions({ page: 1, page_size: 10 }).then(res => (_transactions.value = res.data));
</script>

<style lang="scss">
@import 'styles';

.latest-transactions {
  &__column {
    display: grid;
    grid-gap: size(0.5);
  }

  &__time {
    @include tpg-s5;
    color: theme-color('content-primary');
  }

  &__direction {
    display: grid;
    grid-gap: size(1.5);
    grid-template-columns: auto size(1) auto;
    margin: 0 auto 0 size(5);

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
