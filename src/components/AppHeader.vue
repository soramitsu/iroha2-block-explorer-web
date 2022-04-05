<template>
  <header class="app-header">
    <AppHeaderLogo />

    <div class="app-header__row">
      <STextField>
        <template #append>
          <SearchIcon class="app-header__search-icon" />
        </template>
        <template #label>Search</template>
      </STextField>

      <NavigationMenu />

      <ThemeSwitcher />
    </div>
  </header>
</template>

<script setup lang="ts">
import AppHeaderLogo from './AppHeaderLogo.vue';
import NavigationMenu from './NavigationMenu.vue';
import ThemeSwitcher from './ThemeSwitcher.vue';
import { STextField } from '@soramitsu-ui/ui';
import SearchIcon from '@soramitsu-ui/icons/icomoon/basic-search-24.svg';
</script>

<style lang="scss">
@use '@/styles/theme.scss';
@import'@/styles/common';

.app-header {
  display: flex;
  align-items: center;
  height: $header-height;
  padding: 0 48px;

  &__search-icon path {
    fill: theme.color('border-secondary');
  }

  &__row {
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: space-between;
    margin-left: 96px;
  }
}
</style>
