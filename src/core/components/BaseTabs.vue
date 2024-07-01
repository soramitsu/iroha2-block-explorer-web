<template>
  <div class="base-tabs">
    <div
      v-for="(item, i) in props.items"
      :key="i"
      class="base-tabs__tab"
      :class="{ 'base-tabs__tab--active': item.value === model }"
      @click="model = item.value"
    >
      {{ $t(item.label) }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { useVModel } from '@vueuse/core';

const props = defineProps<{
  modelValue: string
  items: {
    label: string
    value: string
  }[]
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>();

const model = useVModel(props, 'modelValue', emit);
</script>

<style lang="scss">
@import '@/styles/main';

.base-tabs {
  display: grid;
  grid-gap: size(0.5);
  grid-auto-flow: column;
  width: fit-content;
  align-items: center;
  padding: size(0.5);
  border-radius: size(2);
  background: theme-color('background');

  @include shadow-input;

  &__tab {
    padding: size(0.5) size(1);
    border-radius: size(1.5);
    @include tpg-s4;
    cursor: pointer;
    user-select: none;
    transition: all 300ms ease-in-out;
    color: theme-color('content-quaternary');

    &:hover {
      background: theme-color('background-hover');
    }

    &--active {
      background: theme-color('content-quaternary');
      color: theme-color('content-on-surface-variant');

      &:hover {
        background: theme-color('content-quaternary');
      }
    }
  }
}
</style>
