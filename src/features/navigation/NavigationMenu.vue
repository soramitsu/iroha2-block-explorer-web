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
import BaseButton from '~base/BaseButton.vue';
import { menu } from '~shared/config';

</script>

<style lang="scss">
@import 'styles';

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
