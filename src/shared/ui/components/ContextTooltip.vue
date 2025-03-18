<script setup lang="ts">
const props = defineProps<{
  message: string
}>();
</script>

<template>
  <div class="context-tooltip">
    <span>{{ props.message }}</span>
  </div>
</template>

<style scoped lang="scss">
@import '@/shared/ui/styles/main';

.context-tooltip {
  display: none;
  background-color: theme-color('content-primary');
  color: theme-color('content-on-background-inverted');
  position: absolute;
  bottom: size(-1);
  height: size(4);
  padding: size(1);
  border-radius: size(0.5);
  white-space: nowrap;
  z-index: 1;

  @include tpg-s4;
}
</style>
