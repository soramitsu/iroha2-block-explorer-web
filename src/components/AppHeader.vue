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

      <nav class="app-header__menu">
        <RouterLink v-for="(item, i) in menu" :key="i" :to="item.to">
          <SButton class="sora-tpg-ch1 app-header__button">{{ item.label }}</SButton>
        </RouterLink>

        <AppThemeSwitcher class="app-header__theme-switcher app-header__button" />
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
import AppHeaderLogo from './AppHeaderLogo.vue';
import AppThemeSwitcher from './AppThemeSwitcher.vue';
import { STextField, SButton } from '@soramitsu-ui/ui';
import SearchIcon from '@soramitsu-ui/icons/icomoon/basic-search-24.svg';

const menu = [
  { label: 'Blocks', to: '/blocks' },
  { label: 'Tokens', to: '/tokens' },
  { label: 'Domains', to: '/domains' },
  { label: 'Accounts', to: '/accounts' },
  { label: 'Transactions', to: '/transactions' },
  { label: 'Network Stats', to: '/network' },
];
</script>

<style lang="scss">
@use '@/styles/theme.scss';

.app-header {
  display: flex;
  align-items: center;
  height: 120px;
  padding: 0 48px;

  &__search-icon path {
    fill: theme.token-as-var('sys.color.border-secondary');
  }

  &__row {
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: space-between;
    margin-left: 96px;
  }

  &__menu {
    display: flex;
    align-items: center;
    margin-left: auto;
  }

  &__button {
    color: theme.token-as-var('sys.color.content-quaternary');

    &:hover {
      color: theme.token-as-var('sys.color.content-primary');
    }
  }

  &__theme-switcher {
    margin-left: 64px;
  }
}
</style>
