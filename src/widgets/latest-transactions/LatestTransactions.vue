<template>
  <BaseContentBlock :title="$t('latestTransactions')" class="latest-transactions">
    <template #header-action>
      <BaseButton line>{{ $t('viewAll') }}</BaseButton>
    </template>

    <template #default>
      <div class="latest-transactions__filters">
        <BaseTabs v-model:value="activeTab" :items="tabs" />
      </div>

      <hr>

      <template v-for="(transaction, i) in transactions" :key="i">
        <div class="latest-transactions__row">
          <div class="latest-transactions__left">
            <BaseHash :hash="transaction.hash" type="two-line" :link="'/transactions/' + fakeHash" />
          </div>

          <div class="latest-transactions__time">
            <TimeIcon />
            <span>{{ $t('time.min', [8]) }} {{ $t('time.ago') }}</span>
          </div>

          <div class="latest-transactions__right">
            <span class="latest-transactions__value">1,245.34728384 XOR</span>
            <span class="latest-transactions__price">$49,800.00</span>
          </div>
        </div>
      </template>
    </template>
  </BaseContentBlock>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import BaseContentBlock from '~base/BaseContentBlock.vue';
import BaseButton from '~base/BaseButton.vue';
import BaseHash from '~base/BaseHash.vue';
import BaseTabs from '~base/BaseTabs.vue';
import TimeIcon from '~icons/clock.svg';
import { http } from '~shared/api';
import { transactionModel } from '~entities/transaction';

type FakeTransactions = {
  from: string;
  to: string;
  hash: string;
}

const { t } = useI18n({ useScope: 'global' });

const fakeHash = 'cnTQ1kbv7PBNNQrEb1tZpmK7h1CW5Hkb5ZBLpK3JbMfZjx9RN';

const transactions = new Array<FakeTransactions>(10).fill({
  from: 'cnTQ1kbv7PBNNQrEb1tZpmK7h1CW5Hkb5ZBLpK3JbMfZjx9RN',
  to: 'cnTQ1kbv7PBNNQrEb1tZpmK7h1CW5Hkb5ZBLpK3JbMfZjx9RN',
  hash: '0xTQ1kbv7PBNNQrEb1tZpmK7h1CW5Hkb5ZBLpK3JbMfZjx9RN',
});

const tabs = [
  { label: t('sort.instruction'), value: 'instruction' },
  { label: t('sort.wasm'), value: 'wasm' },
];

const activeTab = ref(tabs[0].value);

const _transactions = ref<Transaction[]>([]);

async function fetch() {
  const { data } = await http.fetchTransactions({ page: 1, page_size: 10 });
  _transactions.value = data.map(transactionModel.mapFromDto);
}

fetch();
</script>

<style lang="scss">
@import 'styles';

.latest-transactions {
  &__row {
    padding: size(1) size(2);
    border-bottom: 1px solid theme-color('border-primary');
    display: grid;
    grid-gap: size(1);
    grid-template-columns: 1fr;
    justify-content: start;
    align-items: center;
    min-height: 64px;

    &:hover {
      box-shadow: theme-shadow('row');
      border-color: transparent;
    }

    & > * {
      width: fit-content;
    }

    @include xs {
      grid-template-columns: 2fr 1fr;
    }

    @include sm {
      justify-content: space-between;
      grid-template-columns: 90px 1fr 180px;
      padding: 0 size(4);
    }
  }

  &__filters {
    display: grid;
    justify-items: center;
    justify-content: center;
    grid-gap: size(1);
    padding: size(2);

    @include xs {
      grid-template-columns: auto auto;
      justify-items: initial;
      justify-content: space-between;
    }
  }

  &__left {
    display: grid;
    grid-gap: size(0.5);
    grid-column: 1 / -1;

    @include sm {
      grid-column: 1 / 2;
    }
  }

  &__right {
    display: grid;
    grid-gap: size(0.5);
    margin-top: size(0.5);

    @include sm {
      margin: 0;
    }
  }

  &__time {
    display: grid;
    grid-gap: size(1);
    grid-auto-flow: column;
    color: theme-color('content-primary');

    @include tpg-s3;
  }

  path {
    fill: theme-color('content-quaternary');
  }

  &__direction {
    display: grid;
    grid-gap: size(1.5);
    grid-template-columns: auto size(1) auto;
    margin: 0;

    @include sm {
       margin: 0 auto;
    }

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

    @include xs {
      text-align: right;
    }
  }
}
</style>
