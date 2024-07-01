<template>
  <div
    class="base-dropdown-window"
    :data-size="size"
  >
    <slot name="top" />

    <div class="base-dropdown-window__list">
      <div
        v-for="(item, i) in items"
        :key="i"
        :data-active="model === item.value || null"
        :data-size="size"
        class="base-dropdown-window__item"
        @click="model = item.value"
      >
        {{ props.disableTranslation ? item.label : $t(item.label) }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useVModel } from '@vueuse/core';

const props = withDefaults(
  defineProps<{
    disableTranslation?: boolean
    modelValue: string
    size: 'md' | 'lg'
    items: {
      label: string
      value: string
    }[]
  }>(),
  {
    disableTranslation: false,
  }
);

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>();

const model = useVModel(props, 'modelValue', emit);
</script>

<style lang="scss">
@import '@/styles/main';

.base-dropdown-window {
  background: theme-color('background');
  color: theme-color('content-primary');
  fill: theme-color('content-primary');
  overflow: hidden;

  @include tpg-s4;
  @include shadow-input;

  &[data-size='md'] {
    border-radius: size(2);
  }

  &[data-size='lg'] {
    border-radius: size(3);
  }

  &__list {
    margin: size(1) 0;
  }

  &__item {
    user-select: none;
    cursor: pointer;

    &:hover,
    &[data-active] {
      background: theme-color('background-hover');
    }

    &[data-size='md'] {
      padding: size(0.5) size(2);
    }

    &[data-size='lg'] {
      padding: size(1) size(3);
    }
  }
}
</style>
