<template>
  <div class="home-page-info">
    <div class="home-page-info__search">
      <SearchField
        size="lg"
        :placeholder="$t('homePage.searchPlaceholder')"
        large
      />
    </div>

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
import { useI18n } from 'vue-i18n';

const { t } = useI18n({ useScope: 'global' });

const info = [
  { value: '5.599s', label: t('homePage.averageBlockTime') },
  { value: '32.2', label: t('homePage.averageTps') },
  { value: '$154M+', label: t('homePage.totalValueLocked') },
  { value: '12,658', label: t('homePage.activeAccounts') },
  { value: '654', label: t('homePage.validators') },
  { value: '68', label: t('homePage.nodes') },
  { value: '36', label: t('homePage.nodeLocations') },
  { value: '16', label: t('homePage.averageViewChanges') },
];
</script>

<style lang="scss">
@import 'styles';

.home-page-info {
  background: theme-color('surface-variant');
  width: 100%;
  height: auto;
  display: grid;
  justify-items: center;
  margin-top: 0;
  z-index: 1;

  @include xs {
    margin-top: size(3);
  }

  @include md {
    margin-top: size(10);
  }

  &__search {
    position: relative;
    margin-top: size(-3);
    width: 100%;
    padding: 0 size(2);

    @include xs {
      margin-top: size(-4);
    }

    @include md {
      margin-top: size(-5.5);
      padding: 0 size(9);
      width: $home-content-width-tablet;
    }

    @include lg {
      padding: 0 size(12);
      width: $home-content-width;
    }
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: fit-content(100%) fit-content(100%);
    grid-gap: size(2) 0;
    width: 100%;
    padding: size(2) size(1);

    @include xs {
      grid-gap: size(3) 0;
    }

    @include sm {
      grid-template-columns: repeat(3, 1fr);
      padding: size(3) 0;
    }

    @include md {
      grid-template-columns: repeat(4, 1fr);
      width: $home-content-width-tablet;
      padding: size(5) 0;
    }

    @include lg {
      width: $home-content-width;
      padding: size(7) size(12) size(7) size(12);
      grid-gap: size(5) 0;
    }
  }

  &__item {
    display: grid;
    justify-items: center;
  }

  &__value {
    @include tpg-h3;
    color: theme-color('content-on-surface-variant');

    @include xs {
      @include tpg-h1;
    }

    @include md {
      @include tpg-d2;
    }

    @include lg {
      @include tpg-d1;
    }
  }

  &__label {
    @include tpg-s5;
    color: theme-color('content-quaternary');
    text-align: center;

    @include xs {
      @include tpg-s4;
    }
  }
}
</style>
