<template>
  <nav class="navigation-menu">
    <BaseButton
      v-for="(item, i) in menu"
      :key="i"
      :to="item.to"
    >
      {{ item.label }}
    </BaseButton>
  </nav>
</template>

<script setup lang="ts">
import { menu } from '@/shared/config';
import BaseButton from '@/shared/ui/components/BaseButton.vue';
</script>

<style lang="scss">
@import '@/shared/ui/styles/main';

.navigation-menu {
  display: none;
  grid-auto-flow: column;
  grid-template-columns: auto;
  align-items: center;
  grid-gap: size(1);

  @include lg {
    display: grid;
  }
}
</style>
