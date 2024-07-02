<template>
  <BaseButton
    :pressed="isDark"
    class="app-theme-switcher"
    type="bordered"
    rounded
    @click="toggleTheme"
  >
    <DarkModeIcon />
  </BaseButton>
</template>

<script setup lang="ts">
import DarkModeIcon from '@/core/assets/dark-mode.svg';
import { useDark } from '@vueuse/core';
import BaseButton from '@/core/components/BaseButton.vue';
import { ref } from 'vue';

const isDark = useDark();
let isTransitionActive = ref(false);

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
@import '@/styles/main';

body.theme-transition * {
  transition-property: background, color, fill, border;
  transition-duration: 300ms;
  transition-timing-function: ease-in-out;
  box-shadow: none !important;
}

.app-theme-switcher {
  svg {
    width: size(2);
    height: size(2);
  }
}

html {
  &:not(.dark) .app-theme-switcher {
    @include shadow-elevated;

    &:hover {
      @include shadow-elevated-active;
    }
  }

  &.dark .app-theme-switcher {
    @include shadow-lowered;

    &:hover {
      @include shadow-lowered-active;
    }
  }
}
</style>
