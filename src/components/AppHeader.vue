<template>
  <header class="app-header">
    <AppHeaderLogo />

    <div class="app-header__row">
      <SearchField placeholder="Search" />

      <NavigationMenu />

      <ThemeSwitcher />
    </div>
  </header>
</template>

<script setup lang="ts">
import AppHeaderLogo from './AppHeaderLogo.vue';
import NavigationMenu from './NavigationMenu.vue';
import ThemeSwitcher from './ThemeSwitcher.vue';
import SearchField from './SearchField.vue';
</script>

<style lang="scss">
@use '@/styles/theme';
@import'@/styles/common';

.app-header {
  display: flex;
  align-items: center;
  height: $header-height;
  padding: 0 48px;

  &__row {
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: space-between;
    margin-left: 96px;
  }
}
</style>
