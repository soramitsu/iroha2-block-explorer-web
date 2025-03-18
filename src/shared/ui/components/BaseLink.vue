<template>
  <router-link
    :to
    class="base-link"
    :data-monospace="monospace || null"
  >
    <slot />
  </router-link>
</template>

<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router';

interface Props {
  to: RouteLocationRaw
  monospace?: boolean
}

defineProps<Props>();
</script>

<style lang="scss">
@import '@/shared/ui/styles/main';

.base-link {
  color: theme-color('primary');
  cursor: pointer;

  &:hover {
    color: theme-color('primary-hover');
  }

  &[data-monospace] {
    @include tpg-link1-mono;
  }

  &:not([data-monospace]) {
    @include tpg-link1;
  }
}
</style>
