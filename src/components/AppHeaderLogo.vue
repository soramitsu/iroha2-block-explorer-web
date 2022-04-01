<template>
  <div class="app-header-logo">
    <LogoIcon class="app-header-logo__img" />

    <div class="app-header-logo__text">
      <span class="sora-tpg-h5 app-header-logo__company">HYPERLEDGER</span>
      <span class="sora-tpg-h1 app-header-logo__name">IROHA</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import LogoIcon from '@/assets/svg/logo.svg';
</script>

<style lang="scss">
@use '@/styles/theme.scss';

// TODO: Rewrite styles when the DS is ready

.app-header-logo {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;

  &__text {
    display: grid;
    margin-left: 12px;
  }

  &__name {
    color: theme.token-as-var('sys.color.primary');
    margin-left: -2px;
  }

  &__company {
    color: theme.token-as-var('sys.color.content-primary');
    margin-bottom: -6px;
    font-weight: bold !important;
  }

  &__img {
    width: 55px;
    height: 52px;
  }
}
</style>
