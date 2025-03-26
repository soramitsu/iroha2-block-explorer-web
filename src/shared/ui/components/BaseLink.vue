<template>
  <a
    v-if="isExternalLink"
    :href="props.to"
    target="_blank"
    class="base-link"
  >
    <slot />
  </a>
  <router-link
    v-else
    :to
    class="base-link"
    :data-monospace="monospace || null"
  >
    <slot />
  </router-link>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  to: string
  monospace?: boolean
}

const props = defineProps<Props>();

const isExternalLink = computed(() => {
  return props.to.startsWith('http');
});
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
