<template>
  <div class="home-page">
    <div class="home-page__buttons">
      <ThemeSwitcher />
      <LangDropdown />
      <MobileMenu />

      <div
        :id="PORTAL_ID"
        class="home-page__dropdown"
      />
    </div>

    <BackgroundLogo class="home-page__background-logo" />
    <LogoIcon class="home-page__logo-icon" />

    <h1 class="home-page__title">
      <span class="nowrap">{{ $t('homePage.title.firstLine') }}</span>
      {{ ' ' }}
      <span class="nowrap">{{ $t('homePage.title.secondLine') }}</span>
    </h1>

    <NavigationMenu class="home-page__menu" />
    <HomePageInfo />

    <div class="home-page__blocks">
      <LatestBlocks />
      <LatestTransactions />
    </div>
  </div>
</template>

<script setup lang="ts">
import BackgroundLogo from '@/core/assets/background-logo.svg';
import LogoIcon from '@/core/assets/logo.svg';
import NavigationMenu from '@/core/components/NavigationMenu.vue';
import ThemeSwitcher from '@/core/components/ThemeSwitcher.vue';
import LangDropdown from '@/core/components/LangDropdown.vue';
import MobileMenu from '@/core/components/MobileMenu.vue';
import { PORTAL_ID } from '@/core/consts';
import LatestTransactions from '@/core/widgets/LatestTransactions.vue';
import LatestBlocks from '@/core/widgets/LatestBlocks.vue';
import HomePageInfo from '@/views/HomePage/HomePageInfo.vue';
</script>

<style lang="scss">
@import '@/styles/main';

.home-page {
  position: relative;
  display: grid;
  justify-items: center;
  z-index: 0;

  &__dropdown {
    position: absolute;
    top: calc(50% + 20px + size(1));
    z-index: 10;
    right: 0;
  }

  &__buttons {
    position: absolute;
    top: size(1);
    right: size(1);

    position: relative;
    display: grid;
    grid-auto-columns: auto;
    grid-auto-flow: column;
    grid-gap: size(0.5);
    margin-left: auto;

    @include xs {
      grid-gap: size(1);
      top: size(2);
      right: size(2);
    }

    @include md {
      top: size(3);
      right: size(3);
    }

    @include lg {
      top: size(4);
      right: size(4);
    }

    @include xl {
      grid-gap: size(2);
    }
  }

  &__background-logo {
    position: absolute;
    top: size(-4);
    left: 50%;
    transform: translateX(-50.05%);
    color: theme-color('content-primary');
    z-index: -1;
  }

  &__logo-icon {
    height: 112px;
    width: 112px;
    margin-top: 25px;
    fill: theme-color('primary');

    @include md {
      margin-top: 50px;
    }

    @include xl {
      margin-top: 80px;
    }
  }

  &__title {
    @include tpg-h2;
    color: theme-color('content-primary');
    margin: size(4) size(6) size(5) size(6);
    text-align: center;

    @include xs {
      @include tpg-h1;
    }

    @include md {
      @include tpg-d1;
    }
  }

  &__blocks {
    display: grid;
    grid-template-columns: 1fr;
    justify-content: center;
    padding: size(1) size(1) size(2) size(1);
    grid-gap: size(1);
    width: 100%;

    @include xs {
      padding: size(2) size(2) size(4) size(2);
      grid-gap: size(2);
    }

    @include md {
      padding: size(5) size(3) size(5) size(3);
      grid-gap: size(3);
    }

    @include lg {
      grid-template-columns: 1fr 1fr;
    }

    @include xl {
      grid-template-columns: 600px 600px;
    }
  }
}
</style>
