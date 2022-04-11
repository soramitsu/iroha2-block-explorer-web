<template>
  <div class="home-page-info">
    <SearchField
      class="home-page-info__search"
      placeholder="Search Address / Txn Hash / Block / Token"
      large
    />

    <div class="home-page-info__grid">
      <div v-for="(item, i) in info" :key="i" class="home-page-info__item">
        <span class="home-page-info__value">
          {{ item.value }}
        </span>

        <span class="home-page-info__label">
          {{ item.label }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import SearchField from '@/components/SearchField.vue';

const info = [
  { value: '5.599s', label: 'Average Block Time' },
  { value: '32.2', label: 'Average TPS' },
  { value: '$154M+', label: 'Total Value Locked' },
  { value: '12,658', label: 'Active Accounts' },
  { value: '654', label: 'Validators' },
  { value: '68', label: 'Nodes' },
  { value: '36', label: 'Node Locations' },
  { value: '16', label: 'Average View Changes per Block' },
];
</script>

<style lang="scss">
@import 'styles';

.home-page-info {
  background: theme-color('surface-variant');
  width: 100%;
  height: 356px;
  display: grid;
  justify-items: center;
  margin-top: 84px;

  &__search {
    position: relative;
    margin-top: -$size-5;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-template-rows: fit-content(100%) fit-content(100%);
    grid-gap: $size-5 100px;
    width: $home-content-width;
    padding: 0 $size-6;
  }

  &__item {
    display: grid;
    justify-items: center;
  }

  &__value {
    @include tpg-d1;
    color: theme-color('content-on-surface-variant');
  }

  &__label {
    @include tpg-s4;
    color: theme-color('content-quaternary');
    text-align: center;
  }
}
</style>
