<template>
  <nav class="navigation-menu">
    <BaseButton v-for="(item, i) in menu" :key="i" :to="item.to">{{ item.label }}</BaseButton>
  </nav>
</template>

<script setup lang="ts">
import BaseButton from '@/components/BaseButton.vue';
import { menu } from '@/constants';

</script>

<style lang="scss">
@import 'styles';

.navigation-menu {
  display: grid;
  grid-auto-flow: column;
  grid-template-columns: auto;
  grid-gap: $size-2;
  align-items: center;
  margin: $size-0 auto;
}
</style>
