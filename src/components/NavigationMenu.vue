<template>
  <nav class="navigation-menu">
    <BaseButton v-for="(item, i) in menu" :key="i" :to="item.to">{{ item.label }}</BaseButton>
  </nav>
</template>

<script setup lang="ts">
import BaseButton from '@/components/BaseButton.vue';

const menu = [
  { label: 'Blocks', to: '/blocks' },
  { label: 'Tokens', to: '/tokens' },
  { label: 'Domains', to: '/domains' },
  { label: 'Accounts', to: '/accounts' },
  { label: 'Transactions', to: '/transactions' },
  { label: 'Network Stats', to: '/network' },
];
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
