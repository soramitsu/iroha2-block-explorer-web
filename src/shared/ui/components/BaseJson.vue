<script setup lang="ts">
import VueJsonPretty from 'vue-json-pretty';

const props = defineProps<{
  value: Record<string, any>
}>();

function countProperties(obj: Record<string, any>) {
  let count = 0;

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      count++;
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        count += countProperties(obj[key]);
        count++;
      }
    }
  }

  return count;
}
</script>

<template>
  <vue-json-pretty
    :height="Math.min(8, countProperties(props.value) + 2) * 20"
    class="row-text"
    :data="props.value"
    :deep="3"
    virtual
    collapsed-on-click-brackets
  />
</template>

<style lang="scss">
@use '@/shared/ui/styles/main' as *;
@use 'vue-json-pretty/lib/styles.css';

.vjs-tree-node:hover {
  background: none;
}

.vjs-tree-brackets:hover {
  color: theme-color('primary-hover');
}

.vjs-value {
  color: theme-color('primary');
}
</style>
