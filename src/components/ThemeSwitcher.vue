<template>
  <div class="app-theme-switcher" @click="toggleTheme">
    <DarkModeIcon />
  </div>
</template>

<script setup lang="ts">
import DarkModeIcon from '@/assets/svg/dark-mode.svg';
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
@use '@/styles/theme';
@import '@/styles/common';

body.theme-transition * {
  transition-property: background, color, fill;
  transition-duration: 300ms;
  transition-timing-function: ease-in-out;
  box-shadow: none !important;
}

.app-theme-switcher {
  height: $size-5;
  width: $size-5;
  cursor: pointer;
  user-select: none;
  text-decoration: none;
  padding: $size-1_5;
  border-radius: 50%;
  background: theme.color('background');
  color: theme.color('content-tertiary');
  transition: color 300ms ease-in-out, box-shadow 300ms ease-in-out;

  &:hover {
    color: theme.color('content-primary');
  }

  svg {
    width: $size-2;
    height: $size-2;
  }
}

html {
  &:not(.dark) .app-theme-switcher {
    @include shadow-elevated-1;

    &:hover {
      @include shadow-elevated-2;
    }
  }

  &.dark .app-theme-switcher {
    @include shadow-lowered-1;

    &:hover {
      @include shadow-lowered-2;
    }
  }
}
</style>
