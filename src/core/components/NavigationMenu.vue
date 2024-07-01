<template>
  <nav class="navigation-menu">
    <BaseButton
      v-for="(item, i) in MENU"
      :key="i"
      :to="item.to"
    >
      {{ $t(item.label) }}
    </BaseButton>
  </nav>
</template>

<script setup lang="ts">
import BaseButton from '@/core/components/BaseButton.vue';
import { MENU } from '@/core/consts';
</script>

<style lang="scss">
@import '@/styles/main';

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
