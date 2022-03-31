<template>
  <RouterView v-if="$route?.name === 'home'" />
  <AppPageLayout v-else>
    <RouterView />
  </AppPageLayout>
</template>

<script setup lang="ts">
import AppPageLayout from './components/AppPageLayout.vue';
import { useTheme } from './composables/theme';

useTheme().init();
</script>

<style lang="scss">
@use '@/styles/theme.scss';

body {
  &.theme--light {
    @include theme.light-theme;
  }

  &.theme--dark {
    @include theme.dark-theme;
  }
}

#app {
  background: theme.token-as-var('sys.color.background');
  height: 100vh;
}
</style>
