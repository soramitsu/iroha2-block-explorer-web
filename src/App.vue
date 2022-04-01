<template>
  <RouterView v-if="$route?.name === 'home'" />
  <AppPageLayout v-else>
    <RouterView />
  </AppPageLayout>
</template>

<script setup lang="ts">
import AppPageLayout from './components/AppPageLayout.vue';

// Waiting for theme change button and dark theme
// import { useDark } from '@vueuse/core';
// const isDark = useDark();
// isDark.value = true;
</script>

<style lang="scss">
@use '@/styles/theme.scss';

html {
  &:not(.dark) {
    @include theme.light-theme;
  }

  &.dark {
    @include theme.dark-theme;
  }
}

#app {
  background: theme.token-as-var('sys.color.background');
  height: 100vh;
}
</style>
