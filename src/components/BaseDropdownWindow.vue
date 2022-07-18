<template>
  <div class="base-dropdown-window" :data-size="size">
    <slot name="top" />

    <div v-if="items?.length" class="base-dropdown-window__list">
      <div
        v-for="(item, i) in items"
        :key="i"
        :data-active="value === item.value || null"
        :data-size="size"
        class="base-dropdown-window__item"
        @click="emit('update:value', item.value)"
      >
        {{ item.label }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
type Props = {
  value?: string,
  size: 'md' | 'lg',
  items?: {
    label: string,
    value: string,
  }[],
}

type Emits = {
  (event: 'update:value', value: string): void,
}

defineProps<Props>();
const emit = defineEmits<Emits>();
</script>

<style lang="scss">
@import 'styles';

.base-dropdown-window {
  background: theme-color('background');
  color: theme-color('content-primary');
  fill: theme-color('content-primary');
  overflow: hidden;

  @include tpg-s4;
  @include shadow-input;

  &[data-size=md] {
    border-radius: size(2);
  }

  &[data-size=lg] {
    border-radius: size(3);
  }

  &__list {
    margin: size(1) 0;
  }

  &__item {
    user-select: none;
    cursor: pointer;

    &:hover, &[data-active] {
      background: theme-color('background-hover');
    }

    &[data-size=md] {
      padding: size(0.5) size(2);
    }

    &[data-size=lg] {
      padding: size(1) size(3);
    }
  }
}
</style>
