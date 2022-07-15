<template>
  <div class="home-page">
    <ThemeSwitcher class="home-page__theme-switcher" />
    <BackgroundLogo class="home-page__background-logo" />
    <LogoIcon class="home-page__logo-icon" />
    <h1 class="home-page__title">{{ $t('homePage.title') }}</h1>
    <NavigationMenu class="home-page__menu" />
    <HomePageInfo />

    <div class="home-page__blocks">
      <LatestBlocks />
      <LatestTransactions />
    </div>
  </div>
</template>

<script setup lang="ts">
import ThemeSwitcher from '@/components/ThemeSwitcher.vue';
import BackgroundLogo from '@/icons/background-logo.svg';
import LogoIcon from '@/icons/logo.svg';
import NavigationMenu from '@/components/NavigationMenu.vue';
import HomePageInfo from '@/components/HomePageInfo.vue';
import LatestBlocks from '@/components/LatestBlocks.vue';
import LatestTransactions from '@/components/LatestTransactions.vue';
</script>

<style lang="scss">
@import 'styles';

.home-page {
  position: relative;
  display: grid;
  justify-items: center;
  z-index: 0;

  &__theme-switcher {
    position: absolute;
    top: size(4);
    right: size(4);
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
    margin-top: 107px;
    fill: theme-color('primary');
  }

  &__title {
    @include tpg-d1;
    color: theme-color('content-primary');
    margin-top: size(4);
    margin-bottom: size(5);
  }

  &__blocks {
    display: grid;
    grid-template-columns: 600px 600px;
    grid-gap: size(3);
    margin-top: size(5);
    margin-bottom: 80px;
  }
}
</style>
