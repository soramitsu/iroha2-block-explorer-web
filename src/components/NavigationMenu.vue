<template>
  <nav class="navigation-menu">
    <BaseButton
      v-for="(item, i) in menu"
      :key="i"
      :to="item.to"
      line
    >
      {{ item.label }}
    </BaseButton>
  </nav>
</template>

<script setup lang="ts">
import BaseButton from '@/components/BaseButton.vue';
import { menu } from '@/constants';

</script>

<style lang="scss">
@import 'styles';

.navigation-menu {
  display: none;
  grid-auto-flow: column;
  grid-template-columns: auto;
  align-items: center;

  @include lg {
    display: grid;
  }

  .base-button {
    padding: size(1.5) size(1);

    @include xl {
      padding: size(1.5) size(1.5);
    }
  }
}
</style>
