<template>
  <header class="app-header">
    <HeaderLogo />

    <SearchField
      class="app-header__search"
      size="md"
      :placeholder="$t('search')"
    />

    <NavigationMenu class="app-header__nav" />

    <div class="app-header__buttons">
      <ThemeSwitcher />
      <LangDropdown />
      <MobileMenu />
    </div>

    <div
      :id="PORTAL_ID"
      class="app-header__dropdown"
    />
  </header>
</template>

<script setup lang="ts">
import HeaderLogo from './HeaderLogo.vue';
import { NavigationMenu } from '@/features/navigation';
import { MobileMenu } from '@/features/mobile-menu';
import { LangDropdown } from '@/features/switch-lang';
import { ThemeSwitcher } from '@/features/switch-theme';
import { SearchField } from '@/features/search';
import { PORTAL_ID } from '@/shared/ui/consts';
</script>

<style lang="scss">
@import '@/shared/ui/styles/main';

.app-header {
  display: flex;
  align-items: center;
  height: $header-height-mobile;
  padding: 0 size(1);
  margin: 0 auto;
  max-width: 100%;
  position: relative;

  @include xs {
    padding: 0 size(2);
    height: $header-height-landscape-mobile;
  }

  @include md {
    padding: 0 size(3);
    height: $header-height;
  }

  @include xl {
    width: $xl;
  }

  @include xxl {
    padding: 0 size(7);
    width: $xxl;
  }

  &__search {
    margin-left: auto;
    display: none !important;

    @include sm {
      // display: flex !important; // #SEARCH: turn it on when functionality is ready
      margin-left: size(2);
      margin-right: 8px;
    }

    @include md {
      margin-right: 0;
    }

    @include xxl {
      margin-left: size(10);
    }
  }

  &__nav {
    margin-left: auto;
  }

  &__buttons {
    position: relative;
    display: grid;
    grid-auto-columns: auto;
    grid-auto-flow: column;
    grid-gap: size(0.5);
    margin-left: auto;

    @include sm {
      grid-gap: size(1);
    }

    @include lg {
      margin-left: 8px;
    }

    @include xl {
      grid-gap: size(2);
      margin-left: 16px;
    }
  }

  &__dropdown {
    position: absolute;
    top: calc(50% + 20px + size(1));
    z-index: 10;
    right: size(1);

    @include xs {
      right: size(2);
    }

    @include md {
      right: size(3);
    }
  }
}
</style>
