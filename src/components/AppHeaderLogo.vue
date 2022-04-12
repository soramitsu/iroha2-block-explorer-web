<template>
  <RouterLink to="/" class="app-header-logo">
    <LogoIcon class="app-header-logo__img" />

    <div class="app-header-logo__text">
      <span class="app-header-logo__company">HYPERLEDGER</span>
      <span class="app-header-logo__name">IROHA</span>
    </div>
  </RouterLink>
</template>

<script setup lang="ts">
import LogoIcon from '@/assets/svg/logo.svg';
</script>

<style lang="scss">
@import 'styles';

.app-header-logo {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  text-decoration: none;

  &__text {
    display: grid;
    margin-left: 12px;
    margin-top: 10px;
  }

  &__name {
    color: theme-color('primary');
    margin-left: -2px;
    @include tpg-d2;
  }

  &__company {
    color: theme-color('content-primary');
    margin-bottom: -6px;
    @include tpg-h3;
  }

  &__img {
    width: 55px;
    height: 52px;
    color: theme-color('primary');
  }
}
</style>
