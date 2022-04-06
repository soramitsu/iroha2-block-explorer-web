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
@import 'styles';

html {
  &:not(.dark) {
    @include light-theme;
  }

  &.dark {
    @include dark-theme;
  }
}

#app {
  background: theme-color('background');
}

* {
  box-sizing: border-box;
  margin: 0;
}
</style>
