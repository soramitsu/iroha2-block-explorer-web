<script setup lang="ts">
import VueJsonPretty from 'vue-json-pretty';
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    value: Record<string, any>
    full?: boolean
  }>(),
  {
    full: false,
  }
);

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

const LINE_HEIGHT_IN_PX = 20;
const linesAmount = computed(() => {
  const lines = countProperties(props.value) + 2;

  if (!props.full) return Math.min(8, lines);

  return lines;
});
</script>

<template>
  <vue-json-pretty
    :height="linesAmount * LINE_HEIGHT_IN_PX"
    class="row-text"
    :data="props.value"
    :deep="3"
    virtual
    collapsed-on-click-brackets
  />
</template>

<style lang="scss">
@import '@/shared/ui/styles/main';
@import 'vue-json-pretty/lib/styles.css';

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
