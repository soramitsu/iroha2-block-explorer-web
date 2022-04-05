<template>
  <div class="app-header-logo">
    <LogoIcon class="app-header-logo__img" />

    <div class="app-header-logo__text">
      <span class="tpg-h3 app-header-logo__company">HYPERLEDGER</span>
      <span class="tpg-d2 app-header-logo__name">IROHA</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import LogoIcon from '@/assets/svg/logo.svg';
</script>

<style lang="scss">
@use '@/styles/theme.scss';

.app-header-logo {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;

  &__text {
    display: grid;
    margin-left: 12px;
    margin-top: 10px;
  }

  &__name {
    color: theme.color('primary');
    margin-left: -2px;
  }

  &__company {
    color: theme.color('content-primary');
    margin-bottom: -6px;
  }

  &__img {
    width: 55px;
    height: 52px;
  }
}
</style>
