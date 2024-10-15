<script setup lang="ts">
import VueJsonPretty from 'vue-json-pretty';

const props = defineProps<{
  value: Record<string, any>
}>();
</script>

<template>
  <vue-json-pretty
    :height="Math.min(8, Object.keys(props.value).length + 2) * 20"
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
