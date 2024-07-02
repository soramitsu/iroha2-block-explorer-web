<template>
  <RouterLink
    v-if="to"
    :to="to"
    class="base-button"
    :data-type="type"
    :data-pressed="pressed || null"
    :data-rounded="rounded || null"
  >
    <slot />
  </RouterLink>

  <button
    v-else
    class="base-button"
    :data-type="type"
    :data-pressed="pressed || null"
    :data-rounded="rounded || null"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { RouteLocationRaw } from 'vue-router';

const props = defineProps<{
  to?: RouteLocationRaw
  line?: boolean
  bordered?: boolean
  rounded?: boolean
  pressed?: boolean
}>();

const type = computed(() => {
  switch (true) {
    case props.line:
      return 'line';
    case props.bordered:
      return 'bordered';
    default:
      return 'default';
  }
});
</script>

<style lang="scss">
@import '@/styles/main';

.base-button {
  display: flex;
  cursor: pointer;
  user-select: none;
  text-decoration: none;
  padding: size(1.5) size(2);
  border: none;
  border-radius: size(3);
  transition:
    color 300ms ease-in-out,
    box-shadow 300ms ease-in-out;
  color: theme-color('content-tertiary');
  background: transparent;

  @include tpg-ch1;

  &:hover {
    color: theme-color('content-primary');
  }

  &[data-type='line'] {
    padding: size(1.5) 0;
  }

  &[data-type='default'] {
    &:hover {
      background: theme-color('background');
      @include shadow-elevated-active;
    }
  }

  &[data-type='bordered'] {
    background: theme-color('background');
    @include shadow-elevated;

    &[data-pressed] {
      @include shadow-lowered;
      color: theme-color('content-primary');
    }

    &:hover {
      @include shadow-elevated-active;

      &[data-pressed] {
        @include shadow-lowered-active;
      }
    }
  }

  &[data-rounded] {
    padding: size(1.5);
  }
}
</style>
