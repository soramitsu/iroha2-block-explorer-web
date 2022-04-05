<template>
  <div class="base-content-block">
    <div class="base-content-block__header">
      <slot v-if="slots.header" name="header" />

      <template v-else>
        <h2 class="tpg-h2">{{ props.title }}</h2>
        <slot name="header-action" />
      </template>
    </div>

    <div class="base-content-block__body">
      <slot name="default" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSlots } from 'vue';

type Props = {
  title: string;
}

const props = defineProps<Props>();
const slots = useSlots();
</script>

<style lang="scss">
@use '@/styles/theme';
@import '@/styles/common';

.base-content-block {
  padding: $size-3 $size-4;
  background: theme.color('surface');
  border-radius: $size-4;
  min-height: 100%;

  @include shadow-block;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__body {
    margin-top: $size-3;
  }

  .tpg-h2 {
    color: theme.color('content-primary');
  }
}
</style>
