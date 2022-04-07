<template>
  <div class="base-tabs">
    <div
      v-for="(item, i) in props.items"
      :key="i"
      class="base-tabs__tab"
      :class="{ 'base-tabs__tab--active': item.value === modelValue }"
      @click="emit('update:modelValue', item.value)"
    >
      {{ item.label }}
    </div>
  </div>
</template>

<script setup lang="ts">
type TabItem = {
  label: string;
  value: string;
}

type Props = {
  items: TabItem[],
  modelValue: string,
}

type Emits = {
  (e: 'update:modelValue', value: string): void
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();
</script>

<style lang="scss">
@import 'styles';

.base-tabs {
  display: grid;
  grid-gap: $size-0_5;
  grid-auto-flow: column;
  width: fit-content;
  align-items: center;
  padding: $size-0_5;
  border-radius: $size-2;
  background: theme-color('background');

  @include shadow-lowered-1;

  &__tab {
    padding: $size-0_5 $size-1;
    border-radius: $size-1_5;
    @include tpg-s4;
    cursor: pointer;
    user-select: none;
    transition: all 300ms ease-in-out;
    color: theme-color('content-quaternary');

    &--active {
      background: theme-color('content-quaternary');
      color: theme-color('content-on-surface-variant');
      @include tpg-h4;
    }
  }
}

</style>
