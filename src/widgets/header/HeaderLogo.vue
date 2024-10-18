<script setup lang="ts">
import IrohaLogo from '@/assets/iroha-logo.png';
</script>

<template>
  <RouterLink
    to="/"
    class="header-logo"
  >
    <img
      :src="IrohaLogo"
      class="header-logo"
      alt="iroha"
    >
  </RouterLink>
</template>

<style lang="scss">
@import '@/shared/ui/styles/main';

.header-logo {
  width: 140px;
  height: 40px;

  @include xxs {
    width: 160px;
    height: 46px;
  }

  @include xl {
    width: 192px;
    height: 52px;
  }
}
</style>
