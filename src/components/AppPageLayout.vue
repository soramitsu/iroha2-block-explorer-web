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
.app-page-layout {
  &__content {
    padding: 0 48px 120px 48px;
  }
}
</style>
