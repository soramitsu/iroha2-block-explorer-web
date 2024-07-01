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
      <div
        v-for="(item, index) in APPLICATION_STATS"
        :key="index"
        class="home-page-info__item"
      >
        <span class="home-page-info__value">
          {{ item.value }}
        </span>

        <span class="home-page-info__label">
          {{ $t(item.label) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import SearchField from '@/core/components/SearchField.vue';
import { APPLICATION_STATS } from '@/core/consts';
</script>

<style lang="scss">
@import '@/styles/main';

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
      grid-template-columns: repeat(3, 1fr);
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
