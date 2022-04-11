<template>
  <RouterLink v-if="props.to" :to="props.to" :class="buttonClass">
    <slot />
  </RouterLink>
  <button v-else :class="buttonClass">
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { RouteLocationRaw } from 'vue-router';

type Props = {
  to?: RouteLocationRaw;
  line?: boolean;
}

const props = defineProps<Props>();

const buttonClass = computed(() => {
  return 'base-button' + (props.line ? ' base-button--line' : '');
});
</script>

<style lang="scss">
@import 'styles';

.base-button {
  display: flex;
  cursor: pointer;
  user-select: none;
  text-decoration: none;
  padding: $size-1_5 $size-2;
  border: none;
  border-radius: $size-3;
  transition: color 300ms ease-in-out, box-shadow 300ms ease-in-out;
  color: theme-color('content-quaternary');
  background: transparent;

  @include tpg-ch1;

  &:hover {
    color: theme-color('content-primary');

    &:not(.base-button--line) {
      background: theme-color('background');
      @include shadow-elevated-1;
    }
  }

  &--line {
    padding: $size-1_5 $size-0;
  }
}
</style>
