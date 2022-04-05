<template>
  <RouterView v-if="$route?.name === 'home'" />
  <AppPageLayout v-else>
    <RouterView />
  </AppPageLayout>
</template>

<script setup lang="ts">
import AppPageLayout from './components/AppPageLayout.vue';
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
  background: theme.color('background');
}
</style>
