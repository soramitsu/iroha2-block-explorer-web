<template>
  <RouterLink v-if="props.to" :to="props.to" class="base-button">
    <slot />
  </RouterLink>
  <button v-else class="base-button">
    <slot />
  </button>
</template>

<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router';

type Props = {
  to?: RouteLocationRaw;
}

const props = defineProps<Props>();
</script>

<style lang="scss">
@import 'styles';

.base-button {
  display: flex;
  cursor: pointer;
  user-select: none;
  text-decoration: none;
  padding: $size-1_5 $size-2;
  border-radius: $size-3;
  transition: color 300ms ease-in-out, box-shadow 300ms ease-in-out;
  background: theme-color('background');
  color: theme-color('content-quaternary');

  @include tpg-ch1;

  &:hover {
    color: theme-color('content-primary');
    @include shadow-elevated-1;
  }
}
</style>
