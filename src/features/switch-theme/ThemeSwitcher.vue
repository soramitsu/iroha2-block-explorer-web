<template>
  <BaseButton
    :pressed="isDark"
    class="app-theme-switcher"
    aria-label="theme switcher"
    bordered
    rounded
    @click="toggleTheme"
  >
    <DarkModeIcon />
  </BaseButton>
</template>

<script setup lang="ts">
import DarkModeIcon from '@/shared/ui/icons/dark-mode.svg';
import { useDark } from '@vueuse/core';
import BaseButton from '@/shared/ui/components/BaseButton.vue';

const isDark = useDark();
let isTransitionActive = false;

function toggleTheme() {
  if (isTransitionActive) return;

  isDark.value = !isDark.value;
  const list = document.body.classList;
  list.add('theme-transition');
  isTransitionActive = true;

  setTimeout(() => {
    list.remove('theme-transition');
    isTransitionActive = false;
  }, 300);
}
</script>

<style lang="scss">
@import '@/shared/ui/styles/main';

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
