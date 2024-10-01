<template>
  <div class="base-content-block">
    <div class="base-content-block__header">
      <slot name="header" />

      <template v-if="!slots.header">
        <h2 class="base-content-block__title">
          {{ props.title }}
        </h2>
        <slot name="header-action" />
      </template>
    </div>

    <hr>

    <div class="base-content-block__body">
      <slot name="default" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSlots } from 'vue';

interface Props {
  title?: string
}

const props = defineProps<Props>();
const slots = useSlots();
</script>

<style lang="scss">
@import '@/shared/ui/styles/main';

.base-content-block {
  background: theme-color('surface');
  border-radius: size(4);
  display: grid;
  grid-template-rows: auto auto 1fr;

  @include shadow-block;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 72px;
    padding: 0 size(4);
  }

  &__body {
    padding: 0 0 size(4) 0;
  }

  &__title {
    color: theme-color('content-primary');
    @include tpg-h3;

    @include sm {
      @include tpg-h2;
    }
  }
}
</style>
