<template>
  <div class="base-radio-group">
    <div
      v-for="(item, i) in props.items"
      :key="i"
      class="base-radio-group__item"
      :data-active="item.value === props.modelValue || null"
      @click="choose(item.value)"
    >
      {{ $t(item.label) }}
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: string | null
  items: {
    value: string
    label: string
  }[]
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string | null]
}>();

function choose(value: string) {
  const val = value === props.modelValue ? null : value;
  emit('update:modelValue', val);
}
</script>

<style lang="scss">
@import '@/styles/main';

.base-radio-group {
  display: grid;
  grid-gap: size(1);
  grid-auto-flow: column;
  grid-auto-columns: auto;

  &__item {
    display: grid;
    grid-gap: size(0.5);
    grid-auto-flow: column;
    width: fit-content;
    align-items: center;
    padding: size(1) size(2);
    border-radius: size(2);
    background: theme-color('background');
    cursor: pointer;
    user-select: none;
    transition: all 300ms ease-in-out;
    color: theme-color('content-quaternary');
    @include shadow-input;
    @include tpg-s4;

    &:hover {
      background: theme-color('background-hover');
    }

    &[data-active] {
      background: theme-color('content-quaternary');
      color: theme-color('content-on-surface-variant');
      box-shadow: none;

      &:hover {
        background: theme-color('content-quaternary');
      }
    }
  }
}
</style>
