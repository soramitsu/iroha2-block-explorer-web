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
@use '@/shared/ui/styles/main' as *;

.context-tooltip {
  display: none;
  background-color: theme-color('content-primary');
  color: theme-color('content-on-background-inverted');
  position: absolute;
  bottom: size(-1);
  height: size(4);
  padding: size(1);
  border-radius: size(0.5);
  z-index: 1;
  white-space: pre;

  @include tpg-s4;
}
</style>
