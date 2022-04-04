<template>
  <label class="app-theme-switcher">
    <SSwitch
      id="theme-switcher"
      :model-value="isDark"
      @update:model-value="toggleTheme"
    />
    <span class="sora-tpg-ch1">Dark</span>
  </label>
</template>

<script setup lang="ts">
import { SSwitch } from '@soramitsu-ui/ui';
import { useDark } from '@vueuse/core';
import { ref } from 'vue';

const isDark = useDark();
const isTransitionActive = ref(false);

function toggleTheme() {
  if (isTransitionActive.value) return;

  isDark.value = !isDark.value;
  const list = document.body.classList;
  list.add('theme-transition');
  isTransitionActive.value = true;

  setTimeout(() => {
    list.remove('theme-transition');
    isTransitionActive.value = false;
  }, 300);
}
</script>

<style lang="scss">
body.theme-transition * {
  transition-property: background, color, fill;
  transition-duration: 300ms;
  transition-timing-function: ease;
}

.app-theme-switcher {
  display: flex;
  align-items: center;
  cursor: pointer;
}
</style>
