<template>
  <button class="app-theme-switcher" @click="toggleTheme">
    <DarkModeIcon />
  </button>
</template>

<script setup lang="ts">
import DarkModeIcon from '@/assets/svg/dark-mode.svg';
import { useDark } from '@vueuse/core';

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
@import 'styles';

body.theme-transition * {
  transition-property: background, color, fill;
  transition-duration: 300ms;
  transition-timing-function: ease-in-out;
  box-shadow: none !important;
}

.app-theme-switcher {
  height: size(5);
  width: size(5);
  cursor: pointer;
  user-select: none;
  text-decoration: none;
  padding: size(1.5);
  border: none;
  border-radius: 50%;
  background: theme-color('background');
  color: theme-color('content-tertiary');
  transition: color 300ms ease-in-out, box-shadow 300ms ease-in-out;

  &:hover {
    color: theme-color('content-primary');
  }

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
