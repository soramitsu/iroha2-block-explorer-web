<template>
  <div class="app-page-layout">
    <AppHeader />
    <div class="app-page-layout__content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import AppHeader from './AppHeader.vue';
</script>

<style lang="scss">
@import 'styles';

.app-page-layout {
  &__content {
    padding: 0 $size-6 $header-height $size-6;
    min-height: calc(100vh - $header-height);
    display: grid;
  }
}
</style>
