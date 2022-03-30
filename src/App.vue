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
@use '@soramitsu-ui/theme/sass' as theme;
@use '@/styles/sora.scss';

@include theme.typography-preset-default;

:root {
  @include theme.tokens-preset-light;
}

#app {
  background: #F5F2F2; // sora.token-as-var('sys.color.util.surface');
  height: 100vh;
}
</style>
